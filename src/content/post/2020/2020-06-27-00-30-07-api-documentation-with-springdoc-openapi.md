---
slug: "2020/06/27/api-documentation-with-springdoc-openapi"
title: "API Documentation with springdoc-openapi"
description: "Springdoc is an open-source project that adds support for OpenAPI Specification 3 (OAS 3) in a Spring Boot application. Learn how to use Springdoc with a reactive Spring Boot project."
date: "2020-06-27 00:30:07"
update: "2020-06-27 00:30:07"
category: "guide"
tags: ["spring", "springdoc", "openapi", "documentation"]
---

[OpenAPI Initiative](https://www.openapis.org/) is a widely adopted industry standard to describe and document APIs, with [Swagger](https://swagger.io/) being one of its most well-known implementations. For years, [Springfox](https://github.com/springfox/springfox), using Swagger, has provided a well-adopted toolchain for Spring projects to generate OpenAPI documentation and provide a UI on the top of it. Unfortunately, the Springfox project is not frequently maintained; its latest release v2.9.2 at the timing of writing this post was in 2018. This is where [springdoc-openapi](https://springdoc.org/) comes into the picture.

Springdoc is a relatively young [open-source](https://github.com/springdoc/springdoc-openapi) project that adds several new features not available in Springfox at the moment, including the support for OpenAPI Specification 3 (OAS 3) and functional and reactive Spring APIs to create REST endpoints. In this post, we'll explore how we can use Springdoc with a Spring Boot project.

:::setup
The code written for this post uses:

- Java 14
- Spring Boot 2.3.1
- Springdoc 1.4.3
- Postgres 13 running in a Docker container
- Maven 3.6.3
:::

You can run an instance of Postgres by installing it on your machine or in the cloud. For a Docker container, use the following `Compose` file.

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

## Springdoc with Spring WebMvc

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
    <version>2.3.1.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>springdoc-integration</artifactId>
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

Let's quickly create some endpoints. Say we want to save a `Note` object in a Postgres relation defined by the following statement.

```sql
CREATE TABLE note (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT
);
```

Define an entity for this relation as follows.

```java
// src/main/java/dev/mflash/guides/springdoc/Note.java

public class Note {

  private @Id long id;
  private String title;
  private String content;

  // getters, setters, etc
}
```

The `id` will be automatically generated by a Postgres sequence that gets created with the `CREATE` statement above which specifies the `id` field to be of `SERIAL` type.

Create a repository to perform CRUD operations with the `Note` entity.

```java
// src/main/java/dev/mflash/guides/springdoc/NoteRepository.java

public interface NoteRepository extends CrudRepository<Note, Long> {

}
```

Expose some of the CRUD operations through a controller.

```java
// src/main/java/dev/mflash/guides/springdoc/NoteController.java

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

Here, apart from the usual endpoints, we also want to upload a CSV of notes and persist them in the database; a functionality exposed through the `upload` method.

### Integrating Springdoc

Add the following dependency in the `pom.xml`.

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-ui</artifactId>
  <version>1.4.3</version>
</dependency>
```

Add a `@Tag` to `NoteController` to describe it.

```java
// src/main/java/dev/mflash/guides/springdoc/NoteController.java

@Tag(name = "Note", description = "Endpoints for CRUD operations on notes")
public class NoteController {

  // rest of the code
}
```

To add some metadata, inject a bean returning an `OpenAPI` object.

```java
// src/main/java/dev/mflash/guides/springdoc/Launcher.java

public @SpringBootApplication class Launcher {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  public @Bean OpenAPI noteAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Note API")
                .description("A CRUD API to demonstrate Springdoc integration")
                .version("0.0.1-SNAPSHOT")
                .license(
                    new License().name("MIT").url("https://opensource.org/licenses/MIT")
                )
        );
  }
}
```

Launch the application and open <http://localhost:8080/swagger-ui.html>. You'd see the Swagger UI with the endpoints exposed by `NoteController`. 

![Swagger UI powered by Springdoc](/images/post/2020/2020-06-27-00-30-07-api-documentation-with-springdoc-openapi-01.png)

You can also access the OpenAPI docs at <http://localhost:8080/v3/api-docs> which can be imported in tools like Postman, Insomnia, etc.

## Springdoc with Spring WebMvc.fn

To work with Spring's [functional endpoint API](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#webmvc-fn), some refactoring is required so that Springdoc can infer the API contracts. Create a `NoteService` and the following code.

```java
// src/main/java/dev/mflash/guides/springdoc/NoteService.java

@Tag(name = "Note", description = "Endpoints for CRUD operations on notes")
public @Service class NoteService {

  private final NoteRepository repository;

  public NoteService(NoteRepository repository) {
    this.repository = repository;
  }

  public List<Note> save(List<Note> notes) {
    List<Note> savedNotes = new ArrayList<>();
    repository.saveAll(notes).forEach(savedNotes::add);
    return savedNotes;
  }

  public List<Note> findAll() {
    List<Note> savedNotes = new ArrayList<>();
    repository.findAll().forEach(savedNotes::add);
    return savedNotes;
  }

  public List<Note> upload(Part csv) throws IOException {
    List<Note> savedNotes = new ArrayList<>();
    List<Note> notes = new BufferedReader(
        new InputStreamReader(csv.getInputStream(), StandardCharsets.UTF_8)).lines()
        .map(Note::parseNote).collect(Collectors.toList());
    repository.saveAll(notes).forEach(savedNotes::add);
    return savedNotes;
  }

  public boolean delete(@Parameter(in = ParameterIn.PATH) long id) {
    repository.deleteById(id);
    return true;
  }
}
```

Note that
- the `@Tag` annotation is now applied on the service
- a Swagger-specific `@Parameter` annotation is used to specify that `id` is a path variable to the `delete` method

Refactor the controller using Spring's functional API.

```java
// src/main/java/dev/mflash/guides/springdoc/NoteController.java

public @Controller class NoteController {

  private final NoteService service;

  public NoteController(NoteService service) {
    this.service = service;
  }

  public ServerResponse save(ServerRequest request) throws ServletException, IOException {
    final List<Note> newNotes = request.body(new ParameterizedTypeReference<>() {});
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(service.save(newNotes));
  }

  public ServerResponse findAll(ServerRequest request) {
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(service.findAll());
  }

  public ServerResponse upload(ServerRequest request) throws IOException, ServletException {
    Part csv = request.servletRequest().getPart("data");
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(service.upload(csv));
  }

  public ServerResponse delete(ServerRequest request) {
    long id = Long.parseLong(request.pathVariable("id"));
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(service.delete(id));
  }

  @RouterOperations({
    @RouterOperation(path = "/note", method = PUT, beanClass = NoteService.class, beanMethod = "save"),
    @RouterOperation(path = "/note", method = GET, beanClass = NoteService.class, beanMethod = "findAll"),
    @RouterOperation(path = "/note", method = POST,
        operation = @Operation(
            operationId = "multipart-upload",
            requestBody = @RequestBody(required = true, description = "Upload a csv of notes"),
            responses = @ApiResponse()
        ),
        beanClass = NoteService.class, beanMethod = "upload"),
    @RouterOperation(path = "/note/{id}", method = DELETE, beanClass = NoteService.class, beanMethod = "delete")
  })
  public @Bean RouterFunction<ServerResponse> routes() {
    return route()
        .nest(RequestPredicates.path("/note"),
            builder -> builder.PUT("/", this::save)
                .GET("/", this::findAll)
                .POST("/", RequestPredicates.accept(MULTIPART_FORM_DATA), this::upload)
                .DELETE("/{id}", this::delete).build())
        .build();
  }
}
```

Note that the controller is annotated with `@Controller`, instead of `@RestController` (why? 🤔). The interesting part is at the router configuration method `routes`.

Springdoc provides `@RouterOperation` annotation for a single-route configuration and `@RouterOperations` annotation for multiple-route configuration (which is the case for the above example). Note that the `beanClass` and `beanMethod` are necessary to allow Springdoc inspect `NoteService` and resolve the API contracts. Furthermore, for a multipart upload, we need to specify an `@Operation` with a unique id and provide a customization to let Springdoc know that it is a multipart upload operation. This can be done by injecting an `OpenApiCustomiser` bean as follows.

```java
// src/main/java/dev/mflash/guides/springdoc/Launcher.java

public @SpringBootApplication class Launcher {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  public @Bean OpenAPI noteAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Note API")
                .description("A CRUD API to demonstrate Springdoc integration")
                .version("0.0.1-SNAPSHOT")
                .license(
                    new License().name("MIT").url("https://opensource.org/licenses/MIT")
                )
        );
  }

  public @Bean OpenApiCustomiser openApiCustomiser() {
    return openApi -> openApi.getPaths()
        .values().stream().flatMap(pathItem -> pathItem.readOperations().stream())
        .forEach(operation -> {
          if ("multipart-upload".equals(operation.getOperationId())) {
            operation.getRequestBody()
                .setContent(
                    new Content().addMediaType(
                        MediaType.MULTIPART_FORM_DATA_VALUE,
                        new io.swagger.v3.oas.models.media.MediaType()
                            .schema(new ObjectSchema().addProperties("data", new FileSchema()))
                    )
                );
          }
        });
  }
}
```

Once again, launch the application and open <http://localhost:8080/swagger-ui.html> to access the Swagger UI.

---

**Source code**

- [springdoc-webmvc-integration](https://github.com/Microflash/guides/tree/main/spring/springdoc-webmvc-integration)
- [springdoc-webmvcfn-integration](https://github.com/Microflash/guides/tree/main/spring/springdoc-webmvcfn-integration)

**Related**

- [Springdoc documentation](https://springdoc.org/)
