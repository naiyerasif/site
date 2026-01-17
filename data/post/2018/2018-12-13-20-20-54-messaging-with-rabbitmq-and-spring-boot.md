---
slug: "2018/12/13/messaging-with-rabbitmq-and-spring-boot"
title: "Messaging with RabbitMQ and Spring Boot"
date: 2018-12-13 20:20:54
update: 2025-12-31 23:50:00
type: "guide"
---

[RabbitMQ](https://www.rabbitmq.com/) is an open source message broker. It supports a variety of messaging and streaming protocols, and can be used to implement message queues, which is the focus of this post. A typical message flow in RabbitMQ works as follows: a producer sends a message to an exchange, which routes the message to one or more queues based on rules defined by the exchange type. To receive messages, a queue must be bound to at least one exchange; this association is called a _binding_. Consumers subscribe to these queues and process the stored messages.

:::figure{.popout.popout-image}
![This diagram shows a producer that sends messages to a RabbitMQ broker, which routes them through different exchange types. Direct exchanges deliver messages to specific queues, topic exchanges route messages based on routing keys, and fanout exchanges broadcast messages to multiple queues. A consumer subscribes to these queues and consumes the published messages.](./images/2018-12-13-20-20-54-messaging-with-rabbitmq-and-spring-boot-01.svg)

::caption[Message flow in RabbitMQ through different exchange types]
:::

RabbitMQ supports several types of exchanges, including direct, fanout, topic, and others. [Spring AMQP](https://docs.spring.io/spring-boot/reference/messaging/amqp.html) project provides support for many of these exchange types. In this post, we'll focus on topic exchange, which uses routing keys to decide how to route the message to queues.

:::note{.setup}
The examples in this post use:

- Java 25
- Spring Boot 4.0.1
- RabbitMQ 4
- Testcontainers 2.0.3
- Docker 28.5.2
- Maven 3.9.12
:::

Create a Spring Boot application using the following `pom.xml` file.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.0.1</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot4-messaging-rabbitmq</artifactId>
	<version>2.0.0</version>

	<properties>
		<java.version>25</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-amqp</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-amqp-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-testcontainers</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>testcontainers-junit-jupiter</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>testcontainers-rabbitmq</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-dependency-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>properties</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<configuration>
					<argLine>@{argLine} -javaagent:${org.mockito:mockito-core:jar}</argLine>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Declare a queue, a topic exchange, and a binding that connects the queue to the topic exchange using a routing key. Here, all of these components are registered through a configuration.

```java
package com.example.messaging.rabbitmq;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfiguration {

	public static final String QUEUE_NAME = "message-queue";
	public static final String MESSAGE_TOPIC_EXCHANGE = "message-topic-exchange";
	public static final String ROUTING_KEY = "message.#";

	@Bean
	Queue queue() {
		return new Queue(QUEUE_NAME, false);
	}

	@Bean
	TopicExchange exchange() {
		return new TopicExchange(MESSAGE_TOPIC_EXCHANGE);
	}

	@Bean
	Binding binding(Queue queue, TopicExchange exchange) {
		return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
	}
}
```

We also need a RabbitMQ server for our application to interact with. To do this, let's use [Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html) to launch a RabbitMQ container using Docker on application start. Testcontainers will automatically register the required configurations (such as the username and password) with its [service connection](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html#testing.testcontainers.service-connections) support.

```java
package com.example.messaging.rabbitmq;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.rabbitmq.RabbitMQContainer;

@TestConfiguration(proxyBeanMethods = false)
public class LocalConfiguration {

	@Bean
	@ServiceConnection
	public RabbitMQContainer rabbitContainer() {
		return new RabbitMQContainer("rabbitmq:4-management-alpine");
	}
}
```

Let's register `LocalConfiguration` with a custom application launcher, `LocalLauncher` just for local testing.

```java
package com.example.messaging.rabbitmq;

import org.springframework.boot.SpringApplication;

class LocalLauncher {

	static void main(String... args) {
		SpringApplication
				.from(Launcher::main)
				.with(LocalConfiguration.class)
				.run(args);
	}
}
```

We'll use this launcher to run the application later.

## Exchanging string messages

Let's register a consumer to receive string messages from the queue configured in `RabbitConfiguration` we just defined.

```java {9}
package com.example.messaging.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class Receiver {

	@RabbitListener(queues = RabbitConfiguration.QUEUE_NAME)
	public void receive(final String message) {
		IO.println("Received: " + message);
	}
}
```

To trigger message consumption, let's publish a sample message using a `RabbitTemplate` configured by the Spring AMQP starter. We can inject it for a `CommandLineRunner` which runs on application start.

```java {16..26}
package com.example.messaging.rabbitmq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Launcher {

	static void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}

	@Bean
	CommandLineRunner commandLineRunner(RabbitTemplate rabbitTemplate) {
		return _ -> {
			IO.println("Sending message...");
			rabbitTemplate.convertAndSend(
					RabbitConfiguration.MESSAGE_TOPIC_EXCHANGE,
					RabbitConfiguration.ROUTING_KEY,
					"Hello World!"
			);
		};
	}
}
```

When we launch the application using `LocalLauncher`, we should see the message being consumed through the log output, as follows.

```log
2025-12-30T23:10:46.578 INFO 7488 --- [main] c.example.messaging.rabbitmq.Launcher : Started Launcher in 3.87 seconds (process running for 4.104)
Sending message...
Received: Hello World!
```

We can also write an integration test using Testcontainers to verify the message consumption, as shown below.

```java
package com.example.messaging.rabbitmq;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Import(LocalConfiguration.class)
class ReceiverTest {

	private @Autowired RabbitTemplate rabbitTemplate;
	private @MockitoSpyBean Receiver receiver;

	@Test
	@DisplayName("Should receive text message on message-queue")
	void shouldReceiveTextMessageOnMessageQueue() {
		var message = "Hello World!";

		rabbitTemplate.convertAndSend(
				RabbitConfiguration.MESSAGE_TOPIC_EXCHANGE,
				RabbitConfiguration.ROUTING_KEY,
				message
		);

		verify(receiver, timeout(1000)).receive(message);
	}
}
```

## Exchanging complex messages

Eventually, you may want to exchange more complex objects through the queue rather than simple strings. By default, Spring AMQP configures a `SimpleMessageConverter` with the `RabbitTemplate` that supports strings, `Serializable` instances, and byte arrays. More complex types, however, require a specialized `MessageConverter`, such as `JacksonJsonMessageConverter`. To use it, we need to add the `jackson-databind` dependency in `pom.xml`.

```xml title="pom.xml" ins{26..29}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.0.1</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot4-messaging-rabbitmq</artifactId>
	<version>2.0.0</version>

	<properties>
		<java.version>25</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-amqp</artifactId>
		</dependency>

		<dependency>
			<groupId>tools.jackson.core</groupId>
			<artifactId>jackson-databind</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-amqp-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-testcontainers</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>testcontainers-junit-jupiter</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>testcontainers-rabbitmq</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-dependency-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>properties</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<configuration>
					<argLine>@{argLine} -javaagent:${org.mockito:mockito-core:jar}</argLine>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Next, we need to inject `JacksonJsonMessageConverter` into `RabbitConfiguration` so that Spring AMQP uses it as the preferred `MessageConverter` instead of the default `SimpleMessageConverter`.

```java ins{7,8,34..37}
package com.example.messaging.rabbitmq;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.SmartMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfiguration {

	public static final String QUEUE_NAME = "message-queue";
	public static final String MESSAGE_TOPIC_EXCHANGE = "message-topic-exchange";
	public static final String ROUTING_KEY = "message.#";

	@Bean
	Queue queue() {
		return new Queue(QUEUE_NAME, false);
	}

	@Bean
	TopicExchange exchange() {
		return new TopicExchange(MESSAGE_TOPIC_EXCHANGE);
	}

	@Bean
	Binding binding(Queue queue, TopicExchange exchange) {
		return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
	}

	@Bean
	SmartMessageConverter messageConverter() {
		return new JacksonJsonMessageConverter();
	}
}
```

Now, suppose we want to consume the instances of `Book` from the queue.

```java
package com.example.messaging.rabbitmq;

public record Book(String title, String author) {}
```

To do this, modify the consumer to accept a `Book`.

```java del{10..12} ins{13..15}
package com.example.messaging.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class Receiver {

	@RabbitListener(queues = RabbitConfiguration.QUEUE_NAME)
	public void receive(final String message) {
		IO.println("Received: " + message);
	}
	public void receive(final Book book) {
		IO.println("Received: " + book);
	}
}
```

And publish a `Book` through the `RabbitTemplate` using `CommandLineRunner` as follows.

```java del{23} ins{24}
package com.example.messaging.rabbitmq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Launcher {

	static void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}

	@Bean
	CommandLineRunner commandLineRunner(RabbitTemplate rabbitTemplate) {
		return _ -> {
			IO.println("Sending message...");
			rabbitTemplate.convertAndSend(
					RabbitConfiguration.MESSAGE_TOPIC_EXCHANGE,
					RabbitConfiguration.ROUTING_KEY,
					"Hello World!"
					new Book("Platform Decay", "Martha Wells")
			);
		};
	}
}
```

Launch the application using `LocalLauncher` again, and you should see the message consumption in the logs.

```log
2025-12-30T23:25:00.277 INFO 7876 --- [main] c.example.messaging.rabbitmq.Launcher : Started Launcher in 3.946 seconds (process running for 4.191)
Sending message...
Received: Book[title=Platform Decay, author=Martha Wells]
```

As before, we can validate this usecase with an integration test using Testcontainers, as shown below.

```java
package com.example.messaging.rabbitmq;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Import(LocalConfiguration.class)
class ReceiverTest {

	private @Autowired RabbitTemplate rabbitTemplate;
	private @MockitoSpyBean Receiver receiver;

	@Test
	@DisplayName("Should receive book message on message-queue")
	void shouldReceiveBookMessageOnMessageQueue() {
		var book = new Book("The Faith of Beasts", "James S A Corey");

		rabbitTemplate.convertAndSend(
				RabbitConfiguration.MESSAGE_TOPIC_EXCHANGE,
				RabbitConfiguration.ROUTING_KEY,
				book
		);

		verify(receiver, timeout(1000)).receive(book);
	}
}
```

---

**Source code**

- [springboot4-messaging-rabbitmq](https://github.com/Microflash/backstage/tree/main/spring/springboot4-messaging-rabbitmq)

**Related**

- [RabbitMQ tutorial](https://www.rabbitmq.com/tutorials/tutorial-one-spring-amqp)
- [RabbitMQ docs](https://www.rabbitmq.com/docs)
