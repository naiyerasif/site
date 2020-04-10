---
title: 'Persisting documents with MongoRepository'
date: 2019-07-08 11:12:13
updated: 2019-12-08 19:59:01
authors: [naiyer]
labels: [spring, mongodb]
---

Spring Boot provides a variety of ways to work with a MongoDB database: low-level `MongoReader` and `MongoWriter` APIs, Query, Criteria and Update DSLs, and `MongoTemplate` helper. `MongoRepository` interface is the Repository-style programming model provided by `spring-boot-starter-data-mongodb`.

In this post, we'll explore how to persist documents with `MongoRepository`.

##### Setup

The examples in this post use

- Java 13
- Spring Boot 2.2.5
- MongoDB 4

You'd need a mongoDB instance to persist the data. You can install MongoDB Community Server from [here](https://www.mongodb.com/download-center/community) or get a free to try instance at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). You can also use Docker to run an instance. Create a `docker-compose.yml` file at the project root and add the following details in it.

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

Execute the following command to launch the container.

```bash
docker-compose up -d
```

## Define a domain

Let's start by defining a domain. Say, you want to persist an `Account` object that contains information about a `User` and their `Session`s from different locations. When someone updates or deletes an `Account`, the corresponding `User` and `Session` should also get updated or deleted.

![Domain](./images/2019-07-08-persisting-documents-with-mongorepository.svg)

A Many-to-One relationship in MongoDB can be modeled with either [embedded documents](https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/) or [document references](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/); with the latter method being more useful since it prevents the repetition of data. You can enforce this behavior through a `@DBRef` annotation.

Define an `Account` class, like this:

```java
// src/main/java/dev/mflash/guides/mongo/domain/Account.java

public class Account {

  private @Id String key;
  private String address;
  private @DBRef User user;
  private @DBRef Set<Session> sessions;
  private ZonedDateTime created;

  // constructors, getters and setters, builders, etc.
}
```

Similarly, define `User`

```java
// src/main/java/dev/mflash/guides/mongo/domain/User.java

public class User {

  private @Id String key;
  private String name;
  private Locale locale;
  private LocalDate dateOfBirth;

  // constructors, getters and setters, builders, etc.
}
```

and `Session` classes.

```java
// src/main/java/dev/mflash/guides/mongo/domain/Session.java

public class Session {

  private @Id String key;
  private String city;
  private Locale locale;
  private String fingerprint;
  private LocalDate lastAccessedOn;
  private LocalTime lastAccessedAt;

  // constructors, getters and setters, builders, etc.
}
```

## Create a Repository

Extend `MongoRepository` to create a repository for `Account`.

```java
// src/main/java/dev/mflash/guides/mongo/repository/AccountRepository.java

public interface AccountRepository extends MongoRepository<Account, String> {

  Account findDistinctFirstByUser(User user);

  List<Account> findBySessions(Session session);

  Account findByAddress(String address);
}
```

Since `MongoRepository` extends `CrudRepository` interface, it provides several CRUD methods (like `findAll()`, `save()`, etc) out-of-the-box. For specific queries, you can declare query methods (using certain [naming conventions](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#repositories.query-methods.query-creation)) for Spring to generate their implementations at runtime.

### Unit tests for the `AccountRepository`

Now that the `AccountRepository` has been defined, write some tests to verify if it works as expected.

```java
// src/test/java/dev/mflash/guides/mongo/repository/AccountRepositoryTest.java

@ExtendWith(SpringExtension.class)
public @SpringBootTest class AccountRepositoryTest {

  private @Autowired AccountRepository repository;

  public @BeforeEach void setUp() {
    repository.deleteAll();
    repository.saveAll(account.values());
  }

  public @Test void findAll() {
    final var totalNumberOfRecords = 3;
    assertEquals(totalNumberOfRecords, repository.findAll().size());
  }

  public @Test void setKeyOnSave() {
    repository.findAll().forEach(account -> assertNotNull(account.getKey()));
  }

  public @Test void findDistinctFirstByUserName() {
    final var tinaLawrence = Name.TINA_LAWRENCE;
    assertEquals(users.get(tinaLawrence),
        repository.findDistinctFirstByUser(users.get(tinaLawrence)).getUser());
  }

  public @Test void findBySessionLocale() {
    final var numberOfResults = 2;
    assertEquals(numberOfResults, repository.findBySessions(sessions.get(City.LOS_ANGELES)).size());
  }

  public @Test void findByAddress() {
    final var address = Address.MOHD_ALI;
    assertEquals(Name.MOHD_ALI.name, repository.findByAddress(address.email).getUser().getName());
  }
}
```

When you'll run these tests, the following exception may be thrown:

```bash
org.bson.codecs.configuration.CodecConfigurationException: Can't find a codec for class java.time.ZonedDateTime.
```

This happens because `Account` has a field `created` of type `ZonedDateTime` which can't be converted to a valid MongoDB representation by available Spring converters. Hence, you'll have to tell Spring how to do this conversion.

### Converters for `ZonedDateTime`

Spring provides a `Converter` interface that you can implement for this very purpose. To convert `Date` to `ZonedDateTime` object, write a converter like this:

```java
// src/main/java/dev/mflash/guides/mongo/helper/converter/DateToZonedDateTimeConverter.java

public class DateToZonedDateTimeConverter implements Converter<Date, ZonedDateTime> {

  public @Override ZonedDateTime convert(Date source) {
    return source.toInstant().atZone(ZoneOffset.UTC);
  }
}
```

> **INFO** UTC is considered as `ZoneOffset` here. `Date` object, persisted in MongoDB, contains no zone information. However, since MongoDB timestamps default to UTC, you can adjust the offset accordingly for your timezone.

Similarly, for conversion from `ZonedDateTime` to `Date`, write a yet another converter.

```java
// src/main/java/dev/mflash/guides/mongo/helper/converter/ZonedDateTimeToDateConverter.java

public class ZonedDateTimeToDateConverter implements Converter<ZonedDateTime, Date> {

  public @Override Date convert(ZonedDateTime source) {
    return Date.from(source.toInstant());
  }
}
```

Inject these converters through a `MongoCustomConversions` bean as follows:

```java
// src/main/java/dev/mflash/guides/mongo/configuration/MongoConfiguration.java

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "dev.mflash.guides.mongo.repository";
  private final List<Converter<?, ?>> converters = new ArrayList<>();

  public @Bean MongoCustomConversions customConversions() {
    converters.add(new DateToZonedDateTimeConverter());
    converters.add(new ZonedDateTimeToDateConverter());
    return new MongoCustomConversions(converters);
  }
}
```

Now, you'll be able to run the unit tests successfully.

## Cascade the documents

Spring Data Mongo doesn't support cascading of the objects out-of-the-box. The official Spring documentation states that:

> The mapping framework does not handle cascading saves. If you change an `Account` object that is referenced by a `Person` object, you must save the `Account` object separately. Calling save on the `Person` object will not automatically save the `Account` objects in the property accounts.

However, you can write a custom mechanism to cascade objects on save and delete operations by listening to `MongoMappingEvent`s.

### Define a `@Cascade` annotation

Let's start by defining an annotation to indicate that a field should be cascaded.

```java
// src/main/java/dev/mflash/guides/mongo/helper/event/Cascade.java

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Cascade {

  CascadeType value() default CascadeType.ALL;
}
```

Since cascading can be done for save and/or delete operations, let's generalize this implementation by passing a value to the annotation that will set the type of cascading. By default, we'll cascade on both save and delete operations through `CascadeType.ALL` value.

Annotate the desired fields with this annotation.

```java
// src/main/java/dev/mflash/guides/mongo/domain/Account.java

public class Account {

  // Other properties

  private @DBRef @Cascade User user;
  private @DBRef @Cascade Set<Session> sessions;

  // constructors, getters and setters, builders, etc.
}
```

### Detect the fields to be cascaded

The references of cascaded objects should be associated with a document, first by checking if such a valid document exists. This can be done by checking the `@Id` of the document through a `FieldCallback`.

```java
// src/main/java/dev/mflash/guides/mongo/helper/event/IdentifierCallback.java

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

Similarly, we need to identify which fields have been annotated with `@Cascade` annotation, through a `FieldCallback`, and afterward perform a persistence operation using `MongoOperations`.

```java
// src/main/java/dev/mflash/guides/mongo/helper/event/CascadeSaveCallback.java

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

You can also write a `CascadeDeleteCallback` for the delete operation. At this point, these methods can be manually called before save or delete operations to trigger cascading. But why not automate this!

### Automate the cascading

Create a `MongoEventListener` to listen to `MongoMappingEvent`s and invoke the appropriate callbacks.

```java
// src/main/java/dev/mflash/guides/mongo/helper/event/CascadeMongoEventListener.java

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
// src/main/java/dev/mflash/guides/mongo/configuration/MongoConfiguration.java

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "dev.mflash.guides.mongo.repository";

  public @Bean CascadeMongoEventListener cascadeMongoEventListener() {
    return new CascadeMongoEventListener();
  }

  // Other configurations
}
```

### Unit tests to verify cascading

To verify if the cascading works, let's write some unit tests by persisting some `Account` objects and querying for `User` and `Session` objects.

```java
// src/test/java/dev/mflash/guides/mongo/repository/CascadeTest.java

@ExtendWith(SpringExtension.class)
public @SpringBootTest class CascadeTest {

  private @Autowired AccountRepository accountRepository;
  private @Autowired SessionRepository sessionRepository;
  private @Autowired UserRepository userRepository;
  private User jasmine;
  private Session paris;
  private Account saved;

  public @BeforeEach void setUp() {
    accountRepository.deleteAll();
    sessionRepository.deleteAll();
    userRepository.deleteAll();

    jasmine = new Builder().name("Jasmine Beck").locale(Locale.FRANCE)
        .dateOfBirth(LocalDate.of(1995, Month.DECEMBER, 12)).build();
    paris = new Session.Builder().city("Paris").locale(Locale.FRANCE).build();
    Account account = new Account.Builder().address("jasmine@nos.com").user(jasmine).session(paris)
        .build();

    saved = accountRepository.save(account);
  }

  public @Test void saveCascade() {
    userRepository.findById(saved.getUser().getKey())
        .ifPresent(user -> assertEquals(jasmine, user));
    saved.getSessions().stream().findFirst().ifPresent(session -> assertEquals(paris, session));
  }

  public @Test void deleteCascade() {
    Account account = accountRepository.findDistinctFirstByUser(jasmine);
    accountRepository.deleteById(account.getKey());

    account.getSessions()
        .forEach(session -> assertTrue(sessionRepository.findById(session.getKey()).isEmpty()));
    assertTrue(userRepository.findById(account.getUser().getKey()).isEmpty());
  }
}
```

## References

**Source Code** &mdash; [spring-data-mongo-repository](https://gitlab.com/mflash/spring-guides/-/tree/master/spring-data-mongo-repository)