---
title: Persisting documents with MongoRepository
path: /persisting-documents-with-mongorepository
date: 2019-07-08
updated: 2019-11-13
author: [naiyer]
tags: ['guide']
---

Spring Boot provides a variety of ways to interact with a MongoDB database: low-level abstractions like `MongoReader`/`MongoWriter`, Query, Criteria and Update DSLs and `MongoTemplate` helper to facilitate common document operations. As a part of Spring Data, it also provides a familiar Repository style programming model through `MongoRepository` interface. In this guide, we'll explore some of the capabilities of `MongoRepository` by persisting and querying MongoDB documents.

### Setup

> We'll use
> - Java 11
> - Spring Boot 2.1.8
> - MongoDB 4

Before getting started, make sure that a mongoDB instance is available to persist your data. You can use Docker to run an instance. Create a `docker-compose.yml` file at the project root and add the following details in it.

```yaml
version: '3.1'

services:

  mongo:
    image: mongo
    container_name: mongo_db
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: erin
      MONGO_INITDB_ROOT_PASSWORD: richards
```

Executing the following command to launch the container.

```bash
docker-compose up -d
```

### Table of Contents

## Define a domain

Let's start by defining a domain. Say, you want to persist an `Email` object which consists of an `address`, an `Identity` of a user, a set of `Session` created by the user and a `created` date. When an `Email` object is saved, corresponding `Identity` object and `Session` objects should also be persisted; the same goes for the delete operation.

![Domain](./images/2019-07-08-persisting-documents-with-mongorepository.svg)

A Many-to-One relationship in MongoDB can be modeled with either [embedded documents](https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/) or [document references](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/); with the latter method being more useful since it prevents the repetition of data. We can enforce this behavior through a `@DBRef` annotation.

Our `Email` document may look like this:

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;

public class Email {

  private @Id String key;
  private String address;
  private @DBRef Identity identity;
  private @DBRef Set<Session> sessions;
  private ZonedDateTime created;

  // constructors, getters and setters, etc.
}
```

In the similar fashion, define `Identity` and `Session` documents.

## Create a Repository

Create a repository by extending the `MongoRepository` interface, as follows.

```java
import dev.mflash.guides.mongo.domain.Email;
import dev.mflash.guides.mongo.domain.Identity;
import dev.mflash.guides.mongo.domain.Session;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EmailRepository extends MongoRepository<Email, String> {

  Email findDistinctFirstByIdentity(Identity identity);

  List<Email> findBySessions(Session session);

  Email findByAddress(String address);
}
```

Since `MongoRepository` extends `CrudRepository` interface, it provides several CRUD methods (like `findAll()`, `save()`, etc) out-of-the-box. For specific queries, we can declare query methods (using certain [naming conventions](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#repositories.query-methods.query-creation)) for Spring to generate their implementations at runtime.

### Unit tests for Repository

Now that our repository is ready, write some tests to verify if it works as expected.

```java
import static dev.mflash.guides.mongo.configuration.TestData.*;
import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
public @SpringBootTest class EmailRepositoryTest {

  private @Autowired EmailRepository repository;

  public @Before void setUp() {
    repository.deleteAll();
    repository.saveAll(emails.values());
  }

  public @Test void findAll() {
    final var totalNumberOfRecords = 3;
    assertEquals(totalNumberOfRecords, repository.findAll().size());
  }

  public @Test void setKeyOnSave() {
    repository.findAll().forEach(email -> assertNotNull(email.getKey()));
  }

  public @Test void findDistinctFirstByIdentityName() {
    final var tinaLawrence = Name.TINA_LAWRENCE;
    assertEquals(identities.get(tinaLawrence),
        repository.findDistinctFirstByIdentity(identities.get(tinaLawrence)).getIdentity());
  }

  public @Test void findBySessionLocale() {
    final var numberOfResults = 2;
    assertEquals(numberOfResults, repository.findBySessions(sessions.get(City.LOS_ANGELES)).size());
  }

  public @Test void findByAddress() {
    final var address = Address.MOHD_ALI;
    assertEquals(Name.MOHD_ALI.name, repository.findByAddress(address.email).getIdentity().getName());
  }
}
```

When you'll run these tests, the following exception may be thrown:

```java
org.bson.codecs.configuration.CodecConfigurationException: Can't find a codec for class java.time.ZonedDateTime.
```

This happens because `Email` class has a field `created` of type `ZonedDateTime` which can't be converted to a valid mongoDB representation by available Spring converters. Hence, you'll have to tell Spring how this conversion can be done.

### Converters for `ZonedDateTime`

Spring provides a `Converter` interface that can be implemented for this very purpose. To convert `Date` to `ZonedDateTime` object, write a converter like this:

```java
import org.springframework.core.convert.converter.Converter;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;

public class DateToZonedDateTimeConverter implements Converter<Date, ZonedDateTime> {

  public @Override ZonedDateTime convert(Date source) {
    return source.toInstant().atZone(ZoneOffset.UTC);
  }
}
```

> **Note** that UTC is considered as `ZoneOffset` here. `Date` object, the one which gets persisted in MongoDB, contains no zone information. However, since MongoDB timestamps default to UTC, you can adjust the offset accordingly for your timezone.

Similarly, for conversion from `ZonedDateTime` to `Date`, write a yet another converter.

```java
import org.springframework.core.convert.converter.Converter;

import java.time.ZonedDateTime;
import java.util.Date;

public class ZonedDateTimeToDateConverter implements Converter<ZonedDateTime, Date> {

  public @Override Date convert(ZonedDateTime source) {
    return Date.from(source.toInstant());
  }
}
```

Inject these converters through a `MongoCustomConversions` bean as follows:

```java
import dev.mflash.guides.mongo.helper.converter.DateToZonedDateTimeConverter;
import dev.mflash.guides.mongo.helper.converter.ZonedDateTimeToDateConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.ArrayList;
import java.util.List;

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "com.mflash.repository";
  private final List<Converter<?,?>> converters = new ArrayList<>();

  public @Bean MongoCustomConversions customConversions() {
    converters.add(new DateToZonedDateTimeConverter());
    converters.add(new ZonedDateTimeToDateConverter());
    return new MongoCustomConversions(converters);
  }

}
```

Now, you'll be able to run the unit tests successfully.

## Cascade the documents

Spring Data Mongo doesn't support cascading of objects out-of-the-box. The official Spring documentation states that:

> The mapping framework does not handle cascading saves. If you change an `Account` object that is referenced by a `Person` object, you must save the `Account` object separately. Calling save on the `Person` object will not automatically save the `Account` objects in the property accounts.

However, we can write a custom mechanism to cascade objects on save and delete operations by listening to `MongoMappingEvent`s.

### Define a `@Cascade` annotation

Let's start by defining an annotation to indicate that a field should be cascaded.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Cascade {

  CascadeType value() default CascadeType.ALL;
}
```

Since cascading can be done for save and/or delete operations, we can generalize this implementation by passing a value to the annotation that will set the type of cascading. By default, we'll cascade on both save and delete operations through `CascadeType.ALL` value.

Annotate the desired fields with this annotation.

```java
import dev.mflash.guides.mongo.helper.event.Cascade;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;

public class Email {

  private @Id String key;
  private String address;
  private @DBRef @Cascade Identity identity;
  private @DBRef @Cascade Set<Session> sessions;
  private ZonedDateTime created;

  // constructors, getters and setters, etc.
}
```

### Detect the fields to be cascaded

The references of cascaded objects should be associated with a document. We need to check if such a valid document exists. This can be done by checking the `@Id` of the document through a `FieldCallback`.

```java
import org.springframework.data.annotation.Id;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

import java.lang.reflect.Field;

public class IdentifierCallback implements FieldCallback {

  private boolean idFound;

  public @Override void doWith(final Field field) throws IllegalArgumentException {
    ReflectionUtils.makeAccessible(field);

    if (field.isAnnotationPresent(Id.class)) {
      idFound = true;
    }
  }

  public boolean isIdFound() {
    return idFound;
  }
}
```

Similarly, we need to identify the objects that should be cascaded, by detecting `@Cascade` annotation on a field, once again, through a `FieldCallback` and then perform actual persistence operation using `MongoOperations`.

```java
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Objects;

public class CascadeSaveCallback implements FieldCallback {

  private final Object source;
  private final MongoOperations mongoOperations;

  public CascadeSaveCallback(Object source, MongoOperations mongoOperations) {
    this.source = source;
    this.mongoOperations = mongoOperations;
  }

  public @Override void doWith(final Field field)
      throws IllegalArgumentException, IllegalAccessException {
    ReflectionUtils.makeAccessible(field);

    if (field.isAnnotationPresent(DBRef.class) && field.isAnnotationPresent(Cascade.class)) {
      final Object fieldValue = field.get(source);

      if (Objects.nonNull(fieldValue)) {
        final var callback = new IdentifierCallback();
        final CascadeType cascadeType = field.getAnnotation(Cascade.class).value();

        if (cascadeType.equals(CascadeType.SAVE) || cascadeType.equals(CascadeType.ALL)) {
          if (fieldValue instanceof Collection<?>) {
            ((Collection<?>) fieldValue).forEach(mongoOperations::save);
          } else {
            ReflectionUtils.doWithFields(fieldValue.getClass(), callback);
            mongoOperations.save(fieldValue);
          }
        }
      }
    }
  }
}
```

You can also write a `CascadeDeleteCallback` for the delete operation. At this point, we can manually call these methods before save or delete operations to trigger cascading. However, we can also automate this to save pains.

### Automate the cascading

Create a `MongoEventListener` to listen to `MongoMappingEvent`s and invoke the appropriate callbacks.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterConvertEvent;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.util.ReflectionUtils;

public class CascadeMongoEventListener extends AbstractMongoEventListener<Object> {

  private @Autowired MongoOperations mongoOperations;

  public @Override void onBeforeConvert(final BeforeConvertEvent<Object> event) {
    final Object source = event.getSource();
    ReflectionUtils
        .doWithFields(source.getClass(), new CascadeSaveCallback(source, mongoOperations));
  }

  public @Override void onAfterConvert(AfterConvertEvent<Object> event) {
    final Object source = event.getSource();
    ReflectionUtils
        .doWithFields(source.getClass(), new CascadeDeleteCallback(source, mongoOperations));
  }
}
```

`CascadeMongoEventListener` will invoke `CascadeSaveCallback` or `CascadeDeleteCallback` depending on your repository method. Inject it as a bean in the `MongoConfiguration` to complete the implementation.

```java
import dev.mflash.guides.mongo.helper.converter.DateToZonedDateTimeConverter;
import dev.mflash.guides.mongo.helper.converter.ZonedDateTimeToDateConverter;
import dev.mflash.guides.mongo.helper.event.CascadeMongoEventListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.ArrayList;
import java.util.List;

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "com.mflash.repository";
  private final List<Converter<?, ?>> converters = new ArrayList<>();

  public @Bean CascadeMongoEventListener cascadeMongoEventListener() {
    return new CascadeMongoEventListener();
  }

  public @Bean MongoCustomConversions customConversions() {
    converters.add(new DateToZonedDateTimeConverter());
    converters.add(new ZonedDateTimeToDateConverter());
    return new MongoCustomConversions(converters);
  }
}
```

### Unit tests to verify cascading

To verify if the cascading works, let's write some unit tests by persisting some `Email` objects and querying for `Identity` and `Session` objects.

```java
import static org.junit.Assert.*;

import dev.mflash.guides.mongo.domain.Email;
import dev.mflash.guides.mongo.domain.Identity;
import dev.mflash.guides.mongo.domain.Session;
import dev.mflash.guides.mongo.domain.Email.EmailBuilder;
import dev.mflash.guides.mongo.domain.Identity.IdentityBuilder;
import dev.mflash.guides.mongo.domain.Session.SessionBuilder;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.time.Month;
import java.util.Locale;

@RunWith(SpringRunner.class)
public @SpringBootTest class CascadeTest {

  private @Autowired EmailRepository emailRepository;
  private @Autowired SessionRepository sessionRepository;
  private @Autowired IdentityRepository identityRepository;
  private Identity jasmine;
  private Session paris;
  private Email saved;

  public @Before void setUp() {
    emailRepository.deleteAll();
    sessionRepository.deleteAll();
    identityRepository.deleteAll();

    jasmine = new IdentityBuilder().name("Jasmine Beck").locale(Locale.FRANCE)
        .dateOfBirth(LocalDate.of(1995, Month.DECEMBER, 12)).build();
    paris = new SessionBuilder().city("Paris").locale(Locale.FRANCE).build();
    Email email = new EmailBuilder().address("jasmine@nos.com").identity(jasmine).session(paris)
        .build();

    saved = emailRepository.save(email);
  }

  public @Test void saveCascade() {
    identityRepository.findById(saved.getIdentity().getKey())
        .ifPresent(identity -> assertEquals(jasmine, identity));
    saved.getSessions().stream().findFirst().ifPresent(session -> assertEquals(paris, session));
  }

  public @Test void deleteCascade() {
    Email email = emailRepository.findDistinctFirstByIdentity(jasmine);
    emailRepository.deleteById(email.getKey());

    email.getSessions()
        .forEach(session -> assertTrue(sessionRepository.findById(session.getKey()).isEmpty()));
    assertTrue(identityRepository.findById(email.getIdentity().getKey()).isEmpty());
  }
}
```

## References

> **Source Code**: [spring-data-mongo-repository](https://github.com/Microflash/guides/tree/master/spring/spring-data-mongo-repository)