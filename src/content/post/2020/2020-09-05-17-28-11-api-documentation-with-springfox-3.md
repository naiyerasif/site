---
slug: "2020/09/05/api-documentation-with-springfox-3"
title: "API Documentation with Springfox 3"
description: "Springfox v3 added support for OpenAPI 3 and Spring 5. It also comes with a ready-to-use Spring Boot starter which replaces a host of dependencies that were required in earlier versions. Learn how to use Springfox with a reactive Spring Boot project."
date: "2020-09-05 17:28:11"
update: "2020-09-05 17:28:11"
category: "guide"
tags: ["spring", "springfox", "openapi", "swagger"]
---

Recently, the popular [Springfox](https://github.com/springfox/springfox) project released the long-awaited v3 of their library with support for [OpenAPI 3](https://www.openapis.org/) and Spring 5 (only annotation-based API is supported). It also comes with a ready-to-use Spring Boot starter which replaces a host of dependencies that were required in earlier versions. This version fills a lot of gaps that another project [springdoc-openapi](https://springdoc.org/) had addressed for a while.

In this post, we'll explore similar usecases that we'd covered in an [earlier post on springdoc-openapi](/post/2020/06/27/api-documentation-with-springdoc-openapi/).

:::setup
The code written for this post uses:

- Java 14
- Spring Boot 2.3.3
- Springfox Boot Starter 3.0.0
- Postgres 13 running in a Docker container
- Maven 3.6.3
:::

To run Postgres in a Docker container, use the following `Compose` file.

```yaml
version: '3'

services:
  db:
    image: postgres:13-alpine
    container_name: pg13
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: erin
      POSTGRES_PASSWORD: richards
```

Execute the following command to launch the container.

```sh
docker-compose up -d
```

## Springfox 3 with Spring WebMvc

Generate a Spring Boot project using [Spring Initializr](https://start.spring.io/), and add `spring-boot-starter-web`, `spring-boot-starter-data-jdbc`, `postgresql`, and `spring-boot-starter-actuator` dependencies. Your `pom.xml` would look like this.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.3.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>springfox3-integration</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>14</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
      <exclusions>
        <exclusion>
          <groupId>org.junit.vintage</groupId>
          <artifactId>junit-vintage-engine</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>

</project>
```

Rename `application.properties` to `application.yml`, open it in an editor, and add the following configuration (change it wherever required).

```yml
# src/main/resources/application.yml

spring:
  datasource:
    platform: postgres
    url: jdbc:postgresql://localhost:5432/spring
    username: erin
    password: richards
```

### Create some endpoints

Let's create some endpoints that we can show in the documentation. Say, we want to create a CRUD API for a `Note` object in a Postgres relation defined by the following statement.

```sql
CREATE TABLE note (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT
);
```

Define an entity for this relation as follows.

```java
// src/main/java/dev/mflash/guides/springfox3/Note.java

public class Note {

  private @Id long id;
  private String title;
  private String content;

  // getters, setters, etc
}
```

Postgres will generate the `id` automatically when a `save` operation is performed since the `id` field is of `SERIAL` type.

Declare a repository to perform CRUD operations with the `Note` entity.

```java
// src/main/java/dev/mflash/guides/springfox3/NoteRepository.java

public interface NoteRepository extends CrudRepository<Note, Long> {

}
```

Expose some of the CRUD operations through a controller.

```java
// src/main/java/dev/mflash/guides/springfox3/NoteController.java

@RestController
@RequestMapping("/note")
public class NoteController {

  private final NoteRepository repository;

  public NoteController(NoteRepository repository) {
    this.repository = repository;
  }

  @PutMapping
  public List<Note> save(@RequestBody List<Note> notes) {
    List<Note> savedNotes = new ArrayList<>();
    repository.saveAll(notes).forEach(savedNotes::add);
    return savedNotes;
  }

  @GetMapping
  public List<Note> findAll() {
    List<Note> savedNotes = new ArrayList<>();
    repository.findAll().forEach(savedNotes::add);
    return savedNotes;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public List<Note> upload(@RequestParam("data") MultipartFile csv) throws IOException {
    List<Note> savedNotes = new ArrayList<>();
    List<Note> notes = new BufferedReader(
        new InputStreamReader(Objects.requireNonNull(csv).getInputStream(), StandardCharsets.UTF_8)).lines()
        .map(Note::parseNote).collect(Collectors.toList());
    repository.saveAll(notes).forEach(savedNotes::add);
    return savedNotes;
  }

  @DeleteMapping("/{id}")
  public boolean delete(@PathVariable("id") long id) {
    repository.deleteById(id);
    return true;
  }
}
```

Here, apart from other endpoints, we've exposed an endpoint, through the `upload` method, to upload a CSV of notes and persist them in the database.

### Integrating Springfox 3

Add the Springfox Boot Starter in the `pom.xml`.

```xml
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-boot-starter</artifactId>
  <version>3.0.0</version>
</dependency>
```

Annotate the `NoteController` with a `@Tag` annotation. This is not required but using a tag, we can provide a description for the controller with the `Docket` API later.

```java
// src/main/java/dev/mflash/guides/springfox3/NoteController.java

@Api(tags = "Note")
public class NoteController {

  // rest of the code
}
```

Customize the metadata and the description of the above controller by injecting a `Docket` bean.

```java
// src/main/java/dev/mflash/guides/springfox3/Launcher.java

public @SpringBootApplication class Launcher {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  @Bean
  public Docket docket() {
    return new Docket(DocumentationType.OAS_30)
        .apiInfo(new ApiInfoBuilder()
            .title("Note API")
            .description("A CRUD API to demonstrate Springfox 3 integration")
            .version("0.0.1-SNAPSHOT")
            .license("MIT")
            .licenseUrl("https://opensource.org/licenses/MIT")
            .build())
        .tags(new Tag("Note", "Endpoints for CRUD operations on notes"))
        .select().apis(RequestHandlerSelectors.withClassAnnotation(RestController.class))
        .build();
  }
}
```

Launch the application and visit <http://localhost:8080/swagger-ui/> where you'll see the documentation on the endpoints exposed by `NoteController`.

![Swagger UI powered by Springfox 3](/images/post/2020/2020-09-05-17-28-11-api-documentation-with-springfox-3-01.png)

You can access the OpenAPI docs at <http://localhost:8080/v3/api-docs> which can be imported into compatible tools, like Postman, Insomnia, etc.

---

**Source code**

- [springfox3-webmvc-integration](https://github.com/Microflash/guides/tree/main/spring/springfox3-webmvc-integration)
