---
slug: "2019/07/08/persisting-documents-with-mongorepository"
title: "Persisting documents with MongoRepository"
description: "Spring Data MongoDB provides a variety of ways to work with a MongoDB database. One of the ways is the repository-style programming model that adds convenient abstractions to work with MongoDB. Learn how to persist documents, cascade them, and create custom converters for specific data types."
date: "2019-07-08 11:12:13"
update: "2020-10-26 10:10:01"
category: "guide"
tags: ["spring", "repository", "mongodb"]
---

[Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb) provides a variety of ways to work with a MongoDB database: low-level `MongoReader` and `MongoWriter` APIs, and higher-level `MongoTemplate` and `MongoOperations` APIs that make use of Query, Criteria and Update DSLs. It also provides a repository-style programming model through the `MongoRepository` interface which adds convenient abstractions to work with MongoDB.

In this post, we'll explore how to persist documents with `MongoRepository`, create custom converters for specific data types and cascade the documents.

:::setup
The examples in this post use

- Java 15
- Spring Boot 2.3.4
- Lombok 1.18.12
- MongoDB 4
:::

Lombok is used to generate boilerplate code (e.g., getters, setters, builders, etc.) by using annotations. You can learn more about it [here](https://projectlombok.org/).

You'd need a mongoDB instance to persist the data. You can install MongoDB Community Server from [here](https://www.mongodb.com/download-center/community) or get a free trial instance at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). You can also launch MongoDB as a Docker container. Create a `docker-compose.yml` file somewhere and add the following details in it.

```yaml
version: '3'

services:

  mongo:
    image: mongo:latest
    container_name: mongodb_latest
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: gwen
      MONGO_INITDB_ROOT_PASSWORD: stacy
```

Open the terminal at the location of `docker-compose.yml` and execute the following command to launch the container.

```sh
docker-compose up -d
```

## Define a domain

:::assert{title=Story}
Consider a fictional social network where a *user* can create an *account*. A sign in by a user from a distinct location creates a *session* associated with that location. Since a user can sign in from different locations, multiple sessions may exist for an account. A user may decide to delete their account; if this happens, the corresponding sessions should also be deleted.
:::

Let's start by defining a domain for the above story. The relationship between the `Account`, `User` and `Session` collections can be represented by the following diagram.

![Domain](/images/post/2019/2019-07-08-11-12-13-persisting-documents-with-mongorepository.svg)

A Many-to-One relationship in MongoDB can be modeled with either [embedded documents](https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/) or [document references](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/). You can add the latter behavior through a `@DBRef` annotation.

Define an `Account` class as follows -

```java
// src/main/java/dev/mflash/guides/mongo/domain/Account.java

@Data @Builder
public class Account {

  private final @Id @Default String key = UUID.randomUUID().toString();
  private @DBRef User user;
  private @DBRef @Singular Set<Session> sessions;
  private ZonedDateTime created;
}
```

Similarly, define the `User`

```java
// src/main/java/dev/mflash/guides/mongo/domain/User.java

@Data @Builder
public class User {

  private final @Id @Default String key = UUID.randomUUID().toString();
  private String name;
  private String email;
  private Locale locale;
  private LocalDate dateOfBirth;
}
```

and `Session` classes.

```java
// src/main/java/dev/mflash/guides/mongo/domain/Session.java

@Data @Builder
public class Session {

  private final @Id @Default String key = UUID.randomUUID().toString();
  private String city;
  private Locale locale;
  private LocalDateTime accessed;
}
```

Note that we're initializing the `key` with a random UUID. We'll discuss why this is needed in the [cascading](#cascade-the-document-operations) section. 

## Create a Repository

Define a repository for the `Account` by extending the `MongoRepository` interface.

```java
// src/main/java/dev/mflash/guides/mongo/repository/AccountRepository.java

public interface AccountRepository extends MongoRepository<Account, String> {

  Account findDistinctFirstByUser(User user);

  List<Account> findBySessions(Session session);
}
```

`MongoRepository` extends `CrudRepository` interface and thereby, provides several CRUD methods (e.g., `findAll()`, `save()`, etc.) out-of-the-box. For specific queries, you can declare query methods (using the [naming conventions](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#repositories.query-methods.query-creation) described in the docs). Spring will generate their implementations at runtime.

### Testing the `AccountRepository`

Let's write some tests to check the functionality of the `AccountRepository`. We'll use assertion methods provided by [AssertJ](https://assertj.github.io/doc/), a popular assertion library that comes bundled with Spring.

```java
// src/test/java/dev/mflash/guides/mongo/repository/AccountRepositoryTest.java

@ExtendWith(SpringExtension.class)
@SpringBootTest class AccountRepositoryTest {

  private static final List<User> SAMPLE_USERS = List.of(
      User.builder().name("Tina Lawrence").email("tina@example.com").locale(Locale.CANADA).dateOfBirth(
          LocalDate.of(1989, Month.JANUARY, 11)).build(),
      User.builder().name("Adrian Chase").email("adrian@example.com").locale(Locale.UK).dateOfBirth(
          LocalDate.of(1994, Month.APRIL, 23)).build(),
      User.builder().name("Mohd Ali").email("mohdali@example.com").locale(Locale.JAPAN).dateOfBirth(
          LocalDate.of(1999, Month.OCTOBER, 9)).build()
  );

  private static final List<Session> SAMPLE_SESSIONS = List.of(
      Session.builder().city("Toronto").locale(Locale.CANADA).build(),
      Session.builder().city("Los Angeles").locale(Locale.US).build(),
      Session.builder().city("London").locale(Locale.UK).build(),
      Session.builder().city("Paris").locale(Locale.FRANCE).build(),
      Session.builder().city("Tokyo").locale(Locale.JAPAN).build()
  );

  private static final List<Account> SAMPLE_ACCOUNTS = List.of(
      Account.builder().user(SAMPLE_USERS.get(0)).session(SAMPLE_SESSIONS.get(0)).session(SAMPLE_SESSIONS.get(1))
          .created(ZonedDateTime.now()).build(),
      Account.builder().user(SAMPLE_USERS.get(1)).session(SAMPLE_SESSIONS.get(1)).session(SAMPLE_SESSIONS.get(2))
          .created(ZonedDateTime.now()).build(),
      Account.builder().user(SAMPLE_USERS.get(2)).session(SAMPLE_SESSIONS.get(4)).session(SAMPLE_SESSIONS.get(3))
          .created(ZonedDateTime.now()).build()
  );

  private @Autowired AccountRepository repository;

  @BeforeEach
  void setUp() {
    repository.deleteAll();
    repository.saveAll(SAMPLE_ACCOUNTS);
  }

  @Test
  @DisplayName("Should find some accounts")
  void shouldFindSomeAccounts() {
    assertThat(repository.count()).isEqualTo(SAMPLE_ACCOUNTS.size());
  }

  @Test
  @DisplayName("Should assign a key on save")
  void shouldAssignAKeyOnSave() {
    assertThat(repository.findAll()).extracting("key").isNotNull();
  }

  @Test
  @DisplayName("Should get a distinct user by first name")
  void shouldGetADistinctUserByFirstName() {
    assertThat(repository.findDistinctFirstByUser(SAMPLE_USERS.get(0)).getUser())
        .isEqualToIgnoringGivenFields(SAMPLE_USERS.get(0), "key");
  }

  @Test
  @DisplayName("Should find some users with a given session")
  void shouldFindSomeUsersWithAGivenSession() {
    assertThat(repository.findBySessions(SAMPLE_SESSIONS.get(1))).isNotEmpty();
  }
}
```

In the above test, we begin by creating some test data (`SAMPLE_USERS`, `SAMPLE_SESSIONS` and `SAMPLE_ACCOUNTS`). Using the test data we test several functionalities of the repository.

:::deter
Use this approach only when you have a disposable database, e.g., an embedded test database or a [MongoDB test container](https://www.testcontainers.org/modules/databases/mongodb/) available for the test.
:::

When you'll run these tests, the following exception may be thrown:

```log
org.bson.codecs.configuration.CodecConfigurationException: Can't find a codec for class java.time.ZonedDateTime
```

This happens because `Account` has a field `created` of type `ZonedDateTime` which can't be converted to a valid MongoDB representation by the available Spring converters. You'll have to tell Spring how to do this conversion by defining a custom converter.

### Converters for `ZonedDateTime`

Spring provides a `Converter` interface that you can implement for this purpose. We need two converters here: one to convert `ZonedDateTime` to `Date` and the other to convert `Date` to `ZonedDateTime`.

```java {9-23}
// src/main/java/dev/mflash/guides/mongo/configuration/ZonedDateTimeConverters.java

public class ZonedDateTimeConverters {

  public static List<Converter<?, ?>> getConvertersToRegister() {
    return List.of(ZonedDateTimeToDateConverter.INSTANCE, DateToZonedDateTimeConverter.INSTANCE);
  }

  private enum ZonedDateTimeToDateConverter implements Converter<ZonedDateTime, Date> {
    INSTANCE;

    public @Override Date convert(ZonedDateTime source) {
      return Date.from(source.toInstant());
    }
  }

  private enum DateToZonedDateTimeConverter implements Converter<Date, ZonedDateTime> {
    INSTANCE;

    public @Override ZonedDateTime convert(Date source) {
      return source.toInstant().atZone(ZoneOffset.UTC);
    }
  }
}
```

In the above `ZonedDateTimeConverters` implementation, we first define the `ZonedDateTimeToDateConverter` and `DateToZonedDateTimeConverter` converters by extending the `Converter` interface. Finally, we return a list of these converters through `getConvertersToRegister` method. 

> Also note that we've defined *UTC* as the `ZoneOffset` here. MongoDB [stores times in UTC](https://docs.mongodb.com/manual/reference/bson-types/#document-bson-type-date) by default. You will have to adjust the offset if you need to store times in a custom timezone.

Inject these converters through a `MongoCustomConversions` bean as follows:

```java {8-10}
// src/main/java/dev/mflash/guides/mongo/configuration/MongoConfiguration.java

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "dev.mflash.guides.mongo.repository";

  public @Bean MongoCustomConversions customConversions() {
    return new MongoCustomConversions(ZonedDateTimeConverters.getConvertersToRegister());
  }
}
```

You'll be able to run the tests successfully now.

## Cascade the document operations

:::deter
There is no concept of *foreign keys* in MongoDB and it does not support cascading. Spring Data MongoDB [states](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#mapping-usage-references) clearly that the mapping framework does not handle cascading saves. If you change an `Account` object that is referenced by a `Person` object, you must save the `Account` object separately. Calling save on the `Person` object will not automatically save the `Account` objects in the property accounts.

The following implementation illustrates a way cascading can be done. However, it is not a *robust* solution and has its own trade-offs. Therefore, it is recommended to cascade the documents manually to ensure consistency and correctness of the data.
:::

Spring Data MongoDB provides the support for lifecycle events through the `MongoMappingEvent` class. You can use this to write an event listener that can perform cascading operations for you.

### Define a `@Cascade` annotation

Let's start by defining an annotation to indicate that a field should be cascaded.

```java
// src/main/java/dev/mflash/guides/mongo/event/Cascade.java

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Cascade {

  CascadeType value() default CascadeType.ALL;
}
```

The `CascadeType` is an `enum` that denotes different types of cascading supported by our implementation.

```java
// src/main/java/dev/mflash/guides/mongo/event/CascadeType.java

public enum CascadeType {
  ALL, SAVE, DELETE
}
```

With this, we can pass a `CascadeType` value to the `@Cascade` annotation and control the type of cascading we may want. By default, both save and delete operations will be cascaded.

Annotate the desired fields with this annotation.

```java {8-9}
// src/main/java/dev/mflash/guides/mongo/domain/Account.java

@Data @Builder
public class Account {

  // Other properties

  private @DBRef @Cascade User user;
  private @DBRef @Cascade @Singular Set<Session> sessions;

  // Other properties
}
```

### Detect the fields to be cascaded

The references of cascaded objects should be associated with a document by checking if such a document exists. You can do this by checking the `@Id` of the document through a `FieldCallback`.

```java
// src/main/java/dev/mflash/guides/mongo/event/IdentifierCallback.java

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

Since a valid non-null `@Id` must be present for this to properly work, we need to initialize the key as early as possible. That's why we are [initializing](#define-a-domain) the `key` field of every document with a random UUID.

To detect the fields to be cascaded, we need to check which of them have been annotated with the `@Cascade` annotation. For a save cascade, define an implementation of the `FieldCallback` which performs this check and applies a `save` operation using a `MongoOperations` bean.

```java {21,24}
// src/main/java/dev/mflash/guides/mongo/event/CascadeSaveCallback.java

@RequiredArgsConstructor
public class CascadeSaveCallback implements FieldCallback {

  private final Object source;
  private final MongoOperations mongoOperations;

  public @Override void doWith(final Field field) throws IllegalArgumentException, IllegalAccessException {
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

Similarly, implement a `CascadeDeleteCallback` that checks the presence of the `@Id` and `@Cascade` annotations and applies the `remove` operation.

```java {21,24}
// src/main/java/dev/mflash/guides/mongo/event/CascadeDeleteCallback.java

@RequiredArgsConstructor
public class CascadeDeleteCallback implements FieldCallback {

  private final Object source;
  private final MongoOperations mongoOperations;

  public @Override void doWith(final Field field) throws IllegalArgumentException, IllegalAccessException {
    ReflectionUtils.makeAccessible(field);

    if (field.isAnnotationPresent(DBRef.class) && field.isAnnotationPresent(Cascade.class)) {
      final Object fieldValue = field.get(source);

      if (Objects.nonNull(fieldValue)) {
        final var callback = new IdentifierCallback();
        final CascadeType cascadeType = field.getAnnotation(Cascade.class).value();

        if (cascadeType.equals(CascadeType.DELETE) || cascadeType.equals(CascadeType.ALL)) {
          if (fieldValue instanceof Collection<?>) {
            ((Collection<?>) fieldValue).forEach(mongoOperations::remove);
          } else {
            ReflectionUtils.doWithFields(fieldValue.getClass(), callback);
            mongoOperations.remove(fieldValue);
          }
        }
      }
    }
  }
}
```

These callbacks won't be invoked automatically; you'd need a listener to invoke them.

### Invoking the cascade automatically

The `AbstractMongoEventListener` class provides various [callback methods](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#mongodb.mapping-usage.events) that get invoked during the persistence operations. As mentioned in the docs,

- the `onBeforeSave` callback method is called *before* inserting or saving a document in the database; this method captures the `BeforeSaveEvent` containing the document being saved.
- the `onBeforeDelete` callback method is called *before* a document is deleted; this method captures the `BeforeDeleteEvent` containing the document about to be deleted.
- the `onAfterDelete` callback method is called *after* a document or a set of documents have been deleted; this method captures the `AfterDeleteEvent` containing the document(s) that has/have been deleted. The references of the documents in the `AfterDeleteEvent` merely contain the values of `id` and not other fields since they've already been deleted.

Also note that the lifecycle events are emitted only for the parent types. These events won't be emitted for any children until and unless they're annotated with the `@DBRef` annotation.

Let's use these callback methods to execute the cascade callbacks implemented earlier. Create a `AccountCascadeMongoEventListener` class that extends `AbstractMongoEventListener` for the `Account` class. 

```java
// src/main/java/dev/mflash/guides/mongo/event/AccountCascadeMongoEventListener.java

public class AccountCascadeMongoEventListener extends AbstractMongoEventListener<Account> {

  private @Autowired MongoOperations mongoOperations;
  private Account deletedAccount;

  public @Override void onBeforeSave(BeforeSaveEvent<Account> event) {
    final Object source = event.getSource();
    ReflectionUtils.doWithFields(source.getClass(), new CascadeSaveCallback(source, mongoOperations));
  }

  public @Override void onBeforeDelete(BeforeDeleteEvent<Account> event) {
    final Object id = Objects.requireNonNull(event.getDocument()).get("_id");
    deletedAccount = mongoOperations.findById(id, Account.class);
  }

  public @Override void onAfterDelete(AfterDeleteEvent<Account> event) {
    ReflectionUtils.doWithFields(Account.class, new CascadeDeleteCallback(deletedAccount, mongoOperations));
  }
}
```

and inject it as a bean using `MongoConfiguration`.

```java {8-10}
// src/main/java/dev/mflash/guides/mongo/configuration/MongoConfiguration.java

@EnableMongoRepositories(MongoConfiguration.REPOSITORY_PACKAGE)
public @Configuration class MongoConfiguration {

  static final String REPOSITORY_PACKAGE = "dev.mflash.guides.mongo.repository";

  public @Bean AccountCascadeMongoEventListener cascadeMongoEventListener() {
    return new AccountCascadeMongoEventListener();
  }

  public @Bean MongoCustomConversions customConversions() {
    return new MongoCustomConversions(ZonedDateTimeConverters.getConvertersToRegister());
  }
}
```

### Testing the cascading

To verify if the cascading works, let's write some tests.

```java
// src/test/java/dev/mflash/guides/mongo/repository/AccountCascadeTest.java

@ExtendWith(SpringExtension.class)
@SpringBootTest class AccountCascadeTest {

  private static final User SAMPLE_USER = User.builder().name("Jasmine Beck").email("jasmine@example.com").locale(
      Locale.FRANCE).dateOfBirth(LocalDate.of(1995, Month.DECEMBER, 12)).build();
  private static final Session SAMPLE_SESSION = Session.builder().city("Paris").locale(Locale.FRANCE).build();
  private static final Account SAMPLE_ACCOUNT = Account.builder().user(SAMPLE_USER).session(SAMPLE_SESSION).created(
      ZonedDateTime.now()).build();

  private @Autowired AccountRepository accountRepository;
  private @Autowired SessionRepository sessionRepository;
  private @Autowired UserRepository userRepository;

  private Account savedAccount;

  @BeforeEach
  void setUp() {
    accountRepository.deleteAll();
    sessionRepository.deleteAll();
    userRepository.deleteAll();
    savedAccount = accountRepository.save(SAMPLE_ACCOUNT);
  }

  @Test
  @DisplayName("Should cascade on save")
  void shouldCascadeOnSave() {
    final User savedUser = savedAccount.getUser();
    final Optional<Session> savedSession = savedAccount.getSessions().stream().findAny();

    final String userId = savedUser.getKey();
    assertThat(userRepository.findById(userId))
        .hasValueSatisfying(user -> assertThat(user).isEqualToIgnoringGivenFields(SAMPLE_USER, "key"));

    if (savedSession.isPresent()) {
      final String sessionId = savedSession.get().getKey();
      assertThat(sessionRepository.findById(sessionId)).isNotEmpty()
          .hasValueSatisfying(session -> assertThat(session).isEqualToIgnoringGivenFields(SAMPLE_SESSION, "key"));
    }

    savedUser.setLocale(Locale.CANADA);
    savedAccount.setUser(savedUser);
    accountRepository.save(savedAccount);
    assertThat(userRepository.findById(userId))
        .hasValueSatisfying(user -> assertThat(user.getLocale()).isEqualTo(Locale.CANADA));

    if (savedSession.isPresent()) {
      final Session modifiedSession = savedSession.get();
      modifiedSession.setCity("Nice");
      savedAccount.setSessions(Set.of(modifiedSession, Session.builder().city("Lyon").locale(Locale.FRANCE).build()));
      Account modifiedAccount = accountRepository.save(savedAccount);
      assertThat(sessionRepository.findById(modifiedSession.getKey())).isNotEmpty()
          .hasValueSatisfying(session -> assertThat(session.getCity()).isEqualTo("Nice"));
      assertThat(modifiedAccount.getSessions().stream().filter(s -> s.getCity().equals("Lyon")).findAny())
          .hasValueSatisfying(session -> assertThat(sessionRepository.findById(session.getKey())).isNotEmpty()
              .hasValueSatisfying(matchedSession -> assertThat(matchedSession.getCity()).isEqualTo("Lyon")));
    }
  }

  @Test
  @DisplayName("Should not cascade on fetch")
  void shouldNotCascadeOnFetch() {
    final String userId = savedAccount.getUser().getKey();
    final Set<Session> sessions = savedAccount.getSessions();
    accountRepository.findById(savedAccount.getKey());

    assertThat(userRepository.findById(userId)).isNotEmpty();
    assertThat(sessions).allSatisfy(session ->
        assertThat(sessionRepository.findById(session.getKey())).isNotEmpty());
  }

  @Test
  @DisplayName("Should cascade on delete")
  void shouldCascadeOnDelete() {
    final Optional<Account> fetchedAccount = accountRepository.findById(savedAccount.getKey());
    accountRepository.deleteById(savedAccount.getKey());

    assertThat(fetchedAccount)
        .hasValueSatisfying(account -> {
          assertThat(userRepository.findById(account.getUser().getKey())).isEmpty();
          assertThat(account.getSessions())
              .allSatisfy(session -> assertThat(sessionRepository.findById(session.getKey())).isEmpty());
        });
  }
}
```

In this test class,

- we define some test data - `SAMPLE_USER`, `SAMPLE_SESSION` and `SAMPLE_ACCOUNT`.
- we implement a `setup` method that removes all the documents from the repositories and saves the `SAMPLE_ACCOUNT` before each test is run.
- the test `shouldCascadeOnSave` verifies if the `@DBRef` annotation correctly persists the `SAMPLE_USER` and `SAMPLE_SESSION` documents when the `SAMPLE_ACCOUNT` is saved. Then it updates the `User` document in the `SAMPLE_ACCOUNT` and checks if the same update appears in the document of the `User` collection for the given `id`. The same thing is done for the `Session` document.
- the test `shouldNotCascadeOnFetch` verifies that the cascade doesn't happen when a document is fetched from the database.
- the test `shouldCascadeOnDelete` verifies that once the `SAMPLE_ACCOUNT` has been deleted, the corresponding `User` and `Session` documents have also been deleted.

---

**Source code**

- [spring-data-mongo-repository](https://github.com/Microflash/guides/tree/main/spring/spring-data-mongo-repository)

**Corrections**

- Thanks [@CyberpunkPerson](https://github.com/CyberpunkPerson) for [pointing out](https://github.com/Microflash/spring-guides/issues/1) that `onAfterConvert` can delete objects not only when the parent is deleted but also when the parent is fetched 🤦‍♀️! I've patched the code and updated the article with a fix.
