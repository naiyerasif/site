---
title: Messaging with RabbitMQ
path: /messaging-with-rabbitmq
date: 2018-12-13
updated: 2019-09-21
author: [naiyer]
summary: Create a message queue with RabbitMQ and publish and read messages using a Spring backend
tags: ['guide']
---

## Intent

In this guide, you'll learn to create a message queue with RabbitMQ and to publish and read messages using a Spring backend.

### Setup

> This guide uses
> - Java 11
> - Spring Boot 2.1.8
> - RabbitMQ 3 running as a Docker container

### Table of Contents

## Setup a RabbitMQ broker

Start by setting up a RabbitMQ broker; you can choose to [install](https://www.rabbitmq.com/download.html) it on your machine or run it as a container. For later, create a `docker-compose.yml` file in the project's root and add the following configuration.

```yaml
version: '3.1'

services:

  rabbitmq:
    image: "rabbitmq:3-management"
    container_name: "rmq3"
    hostname: "albatross"
    restart: "no"
    environment:
      RABBITMQ_DEFAULT_USER: "rabbitmq"
      RABBITMQ_DEFAULT_PASS: "rabbitmq"
    labels:
      NAME: "rabbitmq1"
    ports:
      - "5672:5672"
      - "15672:15672"
```

Now, execute the following command on CLI.

```bash
docker-compose up -d
```

This will launch a RabbitMQ3 container. To access the management console, point your browser at <http://localhost:15672/> and login with the same username and password as set in `docker-compose.yml`.

## Define a domain

Say, you want to publish a list of books in a message and then consume it. To do so, define a simple Book class as follows.

```java
public class Book {

  private final String isbn;
  private final String title;
  private final String author;

  // constructors, getters and setters, etc.
}
```

To start with, you'll create a list of books to publish in the queue.

## Configure Queue, Topic Exchange and Routing Key

A typical RabbitMQ queue has a name to identify it, an optional routing key to selectively process messages and exchange to route the messages to a queue based on the value of a routing key. A topic exchange works on a wildcard match of a routing pattern. There are several other types of exchanges. A binding ties a queue with an exchange and a routing key.

You can configure all these as follows.

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

public @Configuration class RabbitMQConfiguration {

  public static final String TOPIC_EXCHANGE_NAME = "mflash-exchange";
  public static final String QUEUE_NAME = "mflash-queue";
  private static final String ROUTING_KEY = "books.#";

  public @Bean TopicExchange topicExchange() {
    return new TopicExchange(TOPIC_EXCHANGE_NAME);
  }

  public @Bean Queue queue() {
    return new Queue(QUEUE_NAME);
  }

  public @Bean Binding binding() {
    return BindingBuilder.bind(queue()).to(topicExchange()).with(ROUTING_KEY);
  }
}
```

## Create a Publisher

A publisher or producer sends the message to the queue. In the present case, it’ll send a list of books. You'll use a `RabbitTemplate` object injected through Spring to send this list in the queue.

```java
import dev.mflash.guides.rabbitmq.configuration.RabbitMQConfiguration;
import dev.mflash.guides.rabbitmq.domain.Book;
import dev.mflash.guides.rabbitmq.domain.Book.BookBuilder;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public @Service class Publisher implements CommandLineRunner {

  private final RabbitTemplate rabbitTemplate;
  private final Reader reader;

  public Publisher(RabbitTemplate rabbitTemplate, Reader reader) {
    this.rabbitTemplate = rabbitTemplate;
    this.reader = reader;
  }

  public @Override void run(String... args) throws Exception {
    rabbitTemplate
        .convertAndSend(RabbitMQConfiguration.TOPIC_EXCHANGE_NAME, "books.new", getBooks());
    reader.getLatch().await(10, TimeUnit.SECONDS);
  }

  private List<Book> getBooks() {
    List<Book> books = new ArrayList<>();
    books.add(new BookBuilder().isbn("978-1250078308").title("Archenemies").author("Marissa Meyer")
        .build());
    books.add(new BookBuilder().isbn("978-0399555770").title("Skyward").author("Brandon Sanderson")
        .build());
    books.add(new BookBuilder().isbn("978-0374285067").title("Void Star").author("Zachary Mason")
        .build());

    return books;
  }
}
```

**Note** that all the published messages are serialized as byte arrays by default. To properly serialize the list of `Book`s, set the message converter of `RabbitTemplate` as an instance of `Jackson2JsonMessageConverter`.

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

public @Configuration class RabbitMQConfiguration {

  public static final String TOPIC_EXCHANGE_NAME = "mflash-exchange";
  public static final String QUEUE_NAME = "mflash-queue";
  private static final String ROUTING_KEY = "books.#";

  public @Bean TopicExchange topicExchange() {
    return new TopicExchange(TOPIC_EXCHANGE_NAME);
  }

  public @Bean Queue queue() {
    return new Queue(QUEUE_NAME);
  }

  public @Bean Binding binding() {
    return BindingBuilder.bind(queue()).to(topicExchange()).with(ROUTING_KEY);
  }

  public @Bean RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    final var rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(messageConverter());
    return rabbitTemplate;
  }

  public @Bean MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}
```

## Create a Reader

A reader or consumer will read the messages published by the publisher. In the present case, you'll simply print the list.

```java
import dev.mflash.guides.rabbitmq.configuration.RabbitMQConfiguration;
import dev.mflash.guides.rabbitmq.domain.Book;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CountDownLatch;

public @Service class Reader {

  private CountDownLatch latch = new CountDownLatch(1);

  @RabbitListener(queues = RabbitMQConfiguration.QUEUE_NAME, containerFactory = "listenerContainerFactory")
  public void receiveMessage(final List<Book> books) {
    books.forEach(System.out::println);
    latch.countDown();
  }

  public CountDownLatch getLatch() {
    return latch;
  }
}
```

A `CountDownLatch` is used to wait for several threads to complete (here, it is set to 1).

Specify the container factory that will be used to convert the incoming message into a list of books. Inject this list as a bean and set the message converter to `Jackson2JsonMessageConverter` to correctly deserialize the incoming message.

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

public @Configuration class RabbitMQConfiguration {

  public static final String TOPIC_EXCHANGE_NAME = "mflash-exchange";
  public static final String QUEUE_NAME = "mflash-queue";
  private static final String ROUTING_KEY = "books.#";

  public @Bean TopicExchange topicExchange() {
    return new TopicExchange(TOPIC_EXCHANGE_NAME);
  }

  public @Bean Queue queue() {
    return new Queue(QUEUE_NAME);
  }

  public @Bean Binding binding() {
    return BindingBuilder.bind(queue()).to(topicExchange()).with(ROUTING_KEY);
  }

  public @Bean SimpleRabbitListenerContainerFactory listenerContainerFactory(
      ConnectionFactory connectionFactory) {
    final var factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter());
    return factory;
  }

  public @Bean RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    final var rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(messageConverter());
    return rabbitTemplate;
  }

  public @Bean MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}
```

Launching the application will execute the `run()` method of the `Publisher` class and after 10 seconds, the consumer will be called to print the message received from the queue.

## References

> **Source Code** &mdash; [spring-messaging-rabbitmq](https://github.com/Microflash/guides/tree/master/spring/spring-messaging-rabbitmq)