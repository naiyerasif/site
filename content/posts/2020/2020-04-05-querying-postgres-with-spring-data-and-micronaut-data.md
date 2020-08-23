---
title: 'Querying Postgres with Spring Data and Micronaut Data'
date: 2020-04-05 16:29:09
authors: [naiyer]
topics: [spring, micronaut, postgres]
---

`Repository` API of Spring Data is one of the most elegant and compelling features of Spring framework. It generates runtime implementations of the repositories. But what if those implementations can be generated at compile-time with type-checks that fail during compilation, rather than at runtime.

Micronaut Data is one of the projects under [Micronaut Framework](https://micronaut.io/). It provides database toolkit that 
- doesn't use reflection or proxies, 
- generates the code at compile-time, and 
- provides compile-time type checks to ensure the repository methods fail early when incorrectly implemented

It works with multiple backends (including JPA and JDBC), provides a traditional synchronous API as well as reactive APIs for RxJava and Project Reactor, and integrates nicely with Spring Data and Spring Data JPA. In this post, we'll learn how to use its JDBC backend with a Spring Data `Repository`.

:::note Setup
The examples in this post use

- Java 11
- Spring Boot 2.2.6
- Micronaut 1.3.4
- Postgres 12.2
- Gradle 6.3
:::

You can spin an instance of Postgres using the following `Compose` file.

```yaml
version: "3.1"

services:
  db:
    image: postgres:12.2-alpine
    container_name: postgres_12.2
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: example
```

Execute the following command to launch the container.

```sh
docker-compose up -d
```

## Create the project

Generate a Gradle project and add the following in the `build.gradle` file.

```groovy
plugins {
  id 'java'
  id 'org.springframework.boot' version '2.2.6.RELEASE'
  id 'io.spring.dependency-management' version '1.0.9.RELEASE'
  id 'net.ltgt.apt' version '0.19'
}

group = 'dev.mflash.guides'
version = '0.0.1'
sourceCompatibility = JavaVersion.VERSION_11

repositories {
  jcenter()
}

dependencyManagement {
  imports {
    mavenBom 'io.micronaut:micronaut-bom:1.3.4'
  }
}

dependencies {
  annotationProcessor('io.micronaut:micronaut-inject-java')
  annotationProcessor('io.micronaut:micronaut-validation')
  annotationProcessor('io.micronaut.spring:micronaut-spring-annotation')
  annotationProcessor('io.micronaut.spring:micronaut-spring-web-annotation')
  annotationProcessor('io.micronaut.spring:micronaut-spring-boot-annotation')
  annotationProcessor('io.micronaut.data:micronaut-data-processor')

  implementation('io.micronaut:micronaut-inject')
  implementation('io.micronaut:micronaut-validation')
  implementation('io.micronaut:micronaut-runtime')
  implementation('io.micronaut:micronaut-http-client')
  implementation('io.micronaut:micronaut-http-server')
  implementation('io.micronaut.data:micronaut-data-jdbc')
  implementation('org.springframework.data:spring-data-commons')
  implementation('org.springframework.boot:spring-boot-starter-web')
  implementation('jakarta.persistence:jakarta.persistence-api')

  runtime('io.micronaut.spring:micronaut-spring-web')
  runtime('io.micronaut.configuration:micronaut-jdbc-tomcat')
  runtime('io.micronaut:micronaut-http-server-netty')
  runtimeOnly('org.postgresql:postgresql')
}
```

These dependencies allow Micronaut to map Spring annotations to Micronaut annotations at compile time. This allows us to use the familiar Spring annotations and still take advantage of AOT compilation offered by Micronaut. A more comprehensive explanation about the relevance of these dependencies is available [here](https://micronaut-projects.github.io/micronaut-spring/latest/guide/index.html).

Open `application.yml` file and add the following database configuration.

```yaml
# src/main/resources/application.yml

datasources:
  default:
    url: jdbc:postgresql://localhost:5432/spring-guides
    driverClassName: org.postgresql.Driver
    username: postgres
    password: example
    schema-generate: CREATE_DROP
    dialect: POSTGRES
```

Note that this is not a Spring Boot specific configuration; instead this configuration will be used by Micronaut Data to build the datasources.

## Define the domain

Create an entity, say `Customer`, as follows.

```java
// src/main/java/dev/mflash/guides/customer/Customer.java

public @Entity class Customer {

  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Id long customerId;
  private String firstName;
  private String lastName;

  // constructors, getters, setters, etc.
}
```

The `customerId` field is of type `SERIAL` which Postgres autoincrements for every new record. That's why we're delegating the ID generation to Postgres with `GenerationType.IDENTITY` strategy.

## Create a repository

Define a `CustomerRepository` interface and add the following code.

```java
// src/main/java/dev/mflash/guides/customer/CustomerRepository.java;

@JdbcRepository
public interface CustomerRepository extends PagingAndSortingRepository<Customer, Long> {

  @Override
  Set<Customer> findAll();

  default Optional<Customer> persist(Customer customer) {
    Customer saved = findById(customer.getCustomerId()).get();
    BeanUtils.copyProperties(customer, saved, getNullPropertyNames(customer));
    update(saved.getCustomerId(), saved.getFirstName(), saved.getLastName());
    return findById(customer.getCustomerId());
  }

  @Query("UPDATE Customer SET first_name = :firstName, last_name = :lastName WHERE customer_id = :id")
  void update(long id, String firstName, String lastName);

  static String[] getNullPropertyNames (Object source) {
    final BeanWrapper src = new BeanWrapperImpl(source);
    PropertyDescriptor[] pds = src.getPropertyDescriptors();

    Set<String> emptyNames = new HashSet<>();
    for(PropertyDescriptor pd : pds) {
      Object srcValue = src.getPropertyValue(pd.getName());
      if (srcValue == null) emptyNames.add(pd.getName());
    }

    String[] result = new String[emptyNames.size()];
    return emptyNames.toArray(result);
  }

  Set<Customer> findByLastName(String lastName);

  Set<Customer> findByFirstName(String firstName);

  Set<Customer> findByFirstNameAndLastName(String firstName, String lastName);
}
```

This repository is pretty familiar Spring `PagingAndSortingRepository` with some filter methods to get customers by their `firstName`, `lastName`, etc. Also, note that the `persist` method provides an update facility for `Customer` objects using an `UPDATE` operation. The `@JdbcRepository` annotation configures this interface as a Micronaut-managed `@Repository`, enabling Micronaut to build necessary datasources and `JdbcRepositoryOperations` for the associated entity.

## Implement the controller

Create a `CustomerController` to use this repository and provide a bunch of CRUD operations, as follows.

```java
// src/main/java/dev/mflash/guides/customer/CustomerController.java;

@RequestMapping("/customers")
public @RestController class CustomerController {

  private final CustomerRepository repository;

  public CustomerController(CustomerRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  Set<Customer> get(@RequestParam(required = false) String firstName, @RequestParam(required = false) String lastName) {
    Set<Customer> result;

    if (Objects.nonNull(firstName) && Objects.nonNull(lastName)) {
      result = repository.findByFirstNameAndLastName(firstName, lastName);
    } else if (Objects.nonNull(firstName)) {
      result = repository.findByFirstName(firstName);
    } else if (Objects.nonNull(lastName)) {
      result = repository.findByLastName(lastName);
    } else {
      result = repository.findAll();
    }

    return result;
  }

  @PostMapping
  Customer save(Customer customer) {
    return repository.save(customer);
  }

  @PatchMapping
  Optional<Customer> patch(Customer customer) {
    return repository.persist(customer);
  }

  @DeleteMapping("/{id}")
  void delete(@PathVariable("id") @NotBlank Long id) {
    repository.deleteById(id);
  }
}
```

To launch this application, create a `Launcher` as follows.

```java
// src/main/java/dev/mflash/guides/customer/Launcher.java

public @SpringBootApplication class Launcher {

  public static void main(String... args) {
    Micronaut.run(Launcher.class);
  }
}
```

Note that we're not launching this application as `SpringApplication`; instead we're launching it with Micronaut. This is necessary so that Micronaut can manage the repository we created earlier.

## Test the application

Try the following `curl` requests to test-drive the application.

```sh
# Add some entries for Customer
curl --location --request POST 'http://localhost:8080/customers' \
--header 'Content-Type: application/json' \
--data-raw '{ 
  "firstName": "Tamara",
  "lastName": "May"
}'

curl --location --request POST 'http://localhost:8080/customers' \
--header 'Content-Type: application/json' \
--data-raw '{ 
  "firstName": "Lorna",
  "lastName": "Jones"
}'

curl --location --request POST 'http://localhost:8080/customers' \
--header 'Content-Type: application/json' \
--data-raw '{ 
  "firstName": "Delores",
  "lastName": "Jones"
}'

# Fetch all customers
curl --location --request GET 'http://localhost:8080/customers'

# Fetch by filtering firstName, lastName
curl --location --request GET 'http://localhost:8080/customers?firstName=Lorna'
curl --location --request GET 'http://localhost:8080/customers?lastName=Jones'
curl --location --request GET 'http://localhost:8080/customers?firstName=Delores&lastName=Jones'

# Patch a Customer record
curl --location --request PATCH 'http://localhost:8080/customers' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customerId": 1,
    "firstName": "Robyn"
}'

# Delete a Customer record
curl --location --request DELETE 'http://localhost:8080/customers/2'
```

## References

**Source Code** &mdash; [spring-data-micronaut-data](https://gitlab.com/mflash/spring-guides/-/tree/master/spring-data-micronaut-data)

**Related**
- [Micronaut Data](https://micronaut-projects.github.io/micronaut-data/latest/guide/)
- [Micronaut for Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/index.html)
