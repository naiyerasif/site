---
slug: "2020/07/26/error-handling-for-a-spring-based-rest-api"
title: "Error handling for a Spring-based REST API"
description: "Spring Boot provides useful defaults to handle exceptions and formulate a helpful response. However, in many cases, some customization might be needed. Learn how to customize error responses returned by a REST API with some usecases when Spring Security comes into the picture."
date: "2020-07-26 00:35:25"
update: "2020-07-26 00:35:25"
category: "guide"
tags: ["spring", "security", "rest"]
---

Spring Boot provides pretty nifty defaults to handle exceptions and formulate a helpful response in case anything goes wrong. Still, for any number of reasons, an exception can be thrown at runtime and the consumers of your API may get a garbled exception message (or worse, no message at all) with a `500 Internal Server Error` response.

Such a scenario is undesirable, because of the
- **usability concerns** Although relevant, the default exception message may not be helpful to the consumers of your API.
- **security concerns** The exception message may expose the internal details of your application to anyone using the API.

This is a pretty common occurrence and customizing the error response so that it is easy to comprehend is often one of the requirements of the API design. Like many other niceties, Spring Boot does a lot of heavy lifting for you; it does not send binding errors (due to validation failure), exceptions, or stacktrace in a response unless you configure them otherwise (see `server.error` keys under [Server Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html#server-properties) available for a Spring application).

In this post, we'll explore some of the ways to customize error responses returned by a REST API. We'll also cover some usecases when Spring Security comes into the picture.

:::setup
The code written for this post uses:

- Java 14
- Spring Boot 2.3.2
- Postgres 13
- Maven 3.6.3
:::

You can launch an instance of Postgres with Docker using the following `Compose` file.

```yaml
version: '3'

services:
  db:
    image: postgres:13-alpine
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
## Configure the project

Generate a Spring Boot project with [Spring Initializr](https://start.spring.io/), and add `spring-boot-starter-web`, `spring-boot-starter-data-jdbc`, and `postgresql` as dependencies.

Your `pom.xml` would look like this.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.2.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>spring-rest-error-handling</artifactId>
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

Rename `application.properties` to `application.yml`, open the file, and add the following database configuration.

```yaml
# src/main/resources/application.yml

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/spring
    username: erin
    password: richards
```

## Create an API

Say, you want to save a `Book` object, described by the following entity.

```java
// src/main/java/dev/mflash/guides/resterror/domain/Book.java

public class Book {

  private @Id long id;
  private String title;
  private String author;
  private Genre genre;

  // getters, setters, etc.
}
```

The `id` will be of type `SERIAL` in Postgres which will be automatically incremented by the database.

Create the required table using the following SQL statement.

```sql
CREATE TABLE book (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	genre TEXT NOT NULL
);
```

**Note** that the `genre` field is backed by an enum described as follows.

```java
public enum Genre {
  fantasy,
  thriller,
  scifi
}
```

Define a `BookRepository` to perform database operations.

```java
// src/main/java/dev/mflash/guides/resterror/persistence/BookRepository.java

public interface BookRepository extends CrudRepository<Book, Long> {

}
```

Create a `BookController` to expose some endpoints.

```java
// src/main/java/dev/mflash/guides/resterror/controller/BookController.java

@RequestMapping("/book")
public @RestController class BookController {

  private final BookRepository repository;

  public BookController(BookRepository repository) {
    this.repository = repository;
  }

  @PutMapping
  public Map<String, String> addBook(Book newBook) {
    repository.save(newBook);
    return Map.of("message", String.format("Save successful for %s", newBook.getTitle()));
  }

  @GetMapping
  public List<Book> getAllBooks() {
    List<Book> allBooks = List.of();
    repository.findAll().forEach(allBooks::add);
    return allBooks;
  }

  @GetMapping("/{id}")
  public Book getBookById(@PathVariable long id) {
    Optional<Book> book = repository.findById(id);

    if (book.isEmpty()) {
      throw new DataAccessResourceFailureException(String.format("No resource found for id (%s)", id));
    }

    return book.get();
  }

  @PatchMapping("/{id}")
  public Map<String, String> editBook(@PathVariable long id, Book editedBook) {
    final Optional<Book> saved = repository.findById(id);

    if (saved.isPresent()) {
      final Book savedBook = saved.get();
      final Book patchedBook = new Book();
      patchedBook.setId(savedBook.getId());
      patchedBook.setTitle(
          !editedBook.getTitle().equals(savedBook.getTitle()) ? editedBook.getTitle() : savedBook.getTitle());
      patchedBook.setAuthor(
          !editedBook.getAuthor().equals(savedBook.getAuthor()) ? editedBook.getAuthor() : savedBook.getAuthor());
      patchedBook.setGenre(
          !editedBook.getGenre().equals(savedBook.getGenre()) ? editedBook.getGenre() : savedBook.getGenre());
      repository.save(patchedBook);
    } else {
      throw new InvalidDataAccessApiUsageException("Couldn't patch unrelated or non-existent records");
    }

    return Map.of("message", String.format("Patch successful for %s", editedBook.getTitle()));
  }

  @DeleteMapping("/{id}")
  public Map<String, String> deleteBook(@PathVariable long id) {
    if (repository.deleteById(id) < 1) {
      throw new InvalidDataAccessApiUsageException("Couldn't delete a non-existent record");
    }

    return Map.of("message", String.format("Deletion successful for book with id: %s", id));
  }
}
```

Launch the application and try to access a non-existent book.

```sh
$ curl --location --request GET 'http://localhost:8080/book/0'
{
  "timestamp": "2020-07-25T15:54:09.567+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "",
  "path": "/book/0"
}
```

The operation failed, obviously, and you received a JSON response with some useful fields. These fields are managed by [`DefaultErrorAttributes`](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/web/servlet/error/DefaultErrorAttributes.html) class and the response is formed by an implementation of `HandlerExceptionResolver`. However, we can already see what is amiss here.

- There is no message clarifying what exactly went wrong.
- It is the client that passed the incorrect id but the status code indicates it is a server error.
- Since the record was not found, a `404 Not found` would've been the accurate status.

## Send the correct status using `ResponseStatusException`

The fastest way to address the issue with status is to throw Spring provided `ResponseStatusException` which accepts an `HttpStatus`.

```java {13,26,35}
// src/main/java/dev/mflash/guides/resterror/controller/BookController.java

@RequestMapping("/book")
public @RestController class BookController {

  // Rest of the controller

  @GetMapping("/{id}")
  public Book getBookById(@PathVariable long id) {
    Optional<Book> book = repository.findById(id);

    if (book.isEmpty()) {
      throw new ResponseStatusException(NOT_FOUND, String.format("No resource found for id (%s)", id));
    }

    return book.get();
  }

  @PatchMapping("/{id}")
  public Map<String, String> editBook(@PathVariable long id, Book editedBook) {
    final Optional<Book> saved = repository.findById(id);

    if (saved.isPresent()) {
      // logic for patch
    } else {
      throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Couldn't patch unrelated or non-existent records");
    }

    return Map.of("message", String.format("Patch successful for %s", editedBook.getTitle()));
  }

  @DeleteMapping("/{id}")
  public Map<String, String> deleteBook(@PathVariable long id) {
    if (repository.deleteById(id) < 1) {
      throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Couldn't delete a non-existent record");
    }

    return Map.of("message", String.format("Deletion successful for book with id: %s", id));
  }
}
```

Launch the application and try the request again.

```sh
$ curl --location --request GET 'http://localhost:8080/book/0'
{
  "timestamp": "2020-07-26T07:07:30.313+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "",
  "path": "/book/0"
}
```

We are getting the correct status now but it'd be useful to let the client know the cause of this issue. Also, it'd be useful to throw relevant custom exceptions instead of the same exception everywhere.

## Exception handling with `@ControllerAdvice` and `@ExceptionHandler`

If you examine `ResponseStatusException`, you'd notice that it saves the message in a variable `reason`. We'd prefer to map this to the `message` key in the response above. Let's create a class `RestResponse` that can hold this response.

```java
// src/main/java/dev/mflash/guides/resterror/exception/RestResponse.java

public class RestResponse {

  private final LocalDateTime timestamp = LocalDateTime.now();
  private int status;
  private String error;
  private String message;
  private String path;

  // getters, setters, etc.

  public static RestResponseBuilder builder() {
    return new RestResponseBuilder();
  }
}
```

Let's also create a `RestResponseBuilder` that can provide a fluent API to create `RestResponse` objects from a variety of inputs.

```java
// src/main/java/dev/mflash/guides/resterror/exception/RestResponseBuilder.java

public class RestResponseBuilder {

  private int status;
  private String error;
  private String message;
  private String path;

  public RestResponseBuilder status(int status) {
    this.status = status;
    return this;
  }

  public RestResponseBuilder status(HttpStatus status) {
    this.status = status.value();

    if (status.isError()) {
      this.error = status.getReasonPhrase();
    }

    return this;
  }

  public RestResponseBuilder error(String error) {
    this.error = error;
    return this;
  }

  public RestResponseBuilder exception(ResponseStatusException exception) {
    HttpStatus status = exception.getStatus();
    this.status = status.value();
    
    if (!Objects.requireNonNull(exception.getReason()).isBlank()) {
      this.message = exception.getReason();
    }
    

    if (status.isError()) {
      this.error = status.getReasonPhrase();
    }

    return this;
  }

  public RestResponseBuilder message(String message) {
    this.message = message;
    return this;
  }

  public RestResponseBuilder path(String path) {
    this.path = path;
    return this;
  }

  public RestResponse build() {
    RestResponse response = new RestResponse();
    response.setStatus(status);
    response.setError(error);
    response.setMessage(message);
    response.setPath(path);
    return response;
  }

  public ResponseEntity<RestResponse> entity() {
    return ResponseEntity.status(status).headers(HttpHeaders.EMPTY).body(build());
  }
}
```

We can configure a `@ControllerAdvice` that can trigger methods to handle `ResponseStatusException`. This method has to be annotated by `@ExceptionHandler` which specifies what type of exceptions a method can handle.

```java
// src/main/java/dev/mflash/guides/resterror/exception/RestErrorHandler.java

@RestControllerAdvice
public class RestErrorHandler {

  private static final Logger logger = LoggerFactory.getLogger(RestErrorHandler.class);

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<?> handleStatusException(ResponseStatusException ex, WebRequest request) {
    logger.error(ex.getReason(), ex);
    return RestResponse.builder()
        .exception(ex)
        .path(request.getDescription(false).substring(4))
        .entity();
  }
}
```

In the above codeblock, `handleStatusException` will be invoked whenever a `ResponseStatusException` is thrown and instead of the boilerplate Spring response, an instance of `RestResponse` would be returned with the reason.

```sh
$ curl --location --request GET 'http://localhost:8080/book/0'
{
  "timestamp": "2020-07-26T15:24:38.0644948",
  "status": 404,
  "error": "Not Found",
  "message": "No resource found for id (0)",
  "path": "/book/0"
}
```

Note that we're also injecting a `WebRequest` instance to get the `path`. Besides `path`, a `WebRequest` can provide a whole lot of [other details](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/context/request/WebRequest.html) about the request and client. Also, you may want to log the exceptions in the handler method, else Spring will not print them on the logs.

At this point, you may continue to throw `ResponseStatusException` throughout your application or you can choose to extend it to define custom exceptions with specific `HttpStatus`. But what about exceptions that are thrown by a third-party?

## Handling Exceptions thrown by a third-party

One approach is to rethrow such exceptions as `ResponseStatusException`; this can be done wherever you encounter them. Another way is to write handler methods to intercept them in the `@RestControllerAdvice` above. It makes things a bit cleaner, but you can't handle every exception out there. To deal with this, you can write a generic exception handler that may handle `Exception` class.

To get you started, Spring offers a [`ResponseEntityExceptionHandler`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html) class that provides a huge number of handlers for the exceptions thrown by Spring. You can extend this class and implement your handlers on top of it. Even better, you can override the existing handlers to customize their behavior. Let's modify `RestErrorHandler` as follows.

```java
// src/main/java/dev/mflash/guides/resterror/exception/RestErrorHandler.java

@RestControllerAdvice
public class RestErrorHandler extends ResponseEntityExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(RestErrorHandler.class);

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<?> handleStatusException(ResponseStatusException ex, WebRequest request) {
    logger.error(ex.getReason(), ex);
    return handleResponseStatusException(ex, request);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<?> handleAllExceptions(Exception ex, WebRequest request) {
    logger.error(ex.getLocalizedMessage(), ex);
    return handleEveryException(ex, request);
  }

  @SuppressWarnings("unchecked")
  protected @Override ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
      HttpStatus status, WebRequest request) {

    ResponseEntity<?> responseEntity;

    if (!status.isError()) {
      responseEntity = handleStatusException(ex, status, request);
    } else if (INTERNAL_SERVER_ERROR.equals(status)) {
      request.setAttribute("javax.servlet.error.exception", ex, 0);
      responseEntity = handleEveryException(ex, request);
    } else {
      responseEntity = handleEveryException(ex, request);
    }

    return (ResponseEntity<Object>) responseEntity;
  }

  protected ResponseEntity<RestResponse> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
    return RestResponse.builder()
        .exception(ex)
        .path(getPath(request))
        .entity();
  }

  protected ResponseEntity<RestResponse> handleStatusException(Exception ex, HttpStatus status, WebRequest request) {
    return RestResponse.builder()
        .status(status)
        .message("Execution halted")
        .path(getPath(request))
        .entity();
  }

  protected ResponseEntity<RestResponse> handleEveryException(Exception ex, WebRequest request) {
    return RestResponse.builder()
        .status(INTERNAL_SERVER_ERROR)
        .message("Server encountered an error")
        .path(getPath(request))
        .entity();
  }

  private String getPath(WebRequest request) {
    return request.getDescription(false).substring(4);
  }
}
```

A lot of things are going on here.

- `handleResponseStatusException` method specifically handles `ResponseStatusException`
- `handleStatusException` method handles exceptions when the status is not an error status (the statuses in 1xx, 2xx and 3xx series)
- `handleEveryException` method handles all other exceptions and sets their status as `500 Internal Server Error`
- we're also overriding `handleExceptionInternal` to translate the exceptions thrown by Spring to return `RestResponse`
-  finally, we've defined `handleAllExceptions` handler that serves as a catch-all. If no specific error handler is found for an exception, this method will be invoked.

To test this, launch the application and try to put a new book with `genre` as `kids`.

```sh
$ curl --location --request PUT 'http://localhost:8080/book' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "The Land of Roar",
  "author": "Jenny McLachlan",
  "genre": "kids"
}'

{
  "timestamp": "2020-07-26T16:30:51.3444858",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Server encountered an error",
  "path": "/book"
}
```

Since we've not configured any constant named `kids` in the `Genre` enum, Jackson will serialize the `genre` field as null which would violate `NOT NULL` constraint in the database. The application will throw a `DataAccessException` as a result. Since there's no handler defined for this exception in `RestErrorHandler` class, the `handleAllExceptions` handler method will be invoked, sending the response seen above.

## Error Handling for Spring Security

What happens if you add Spring Security in our application? After adding the JWT-based authentication (from the post [Securing Spring Boot APIs with JWT Authentication](/post/2020/04/10/securing-spring-boot-apis-with-jwt-authentication/)) in our application, try to hit any `BookController` endpoint.

```sh
$ curl --location --request GET 'http://localhost:8080/book'
{
  "timestamp": "2020-07-26T11:36:58.225+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "",
  "path": "/book"
}
```

You'd notice that the exception handler that we configured earlier is not being invoked and we're getting the default response. This happens because our custom advice is invoked *after* Spring Security's servlet filters have verified the user. Since the user authentication failed, the handlers were never invoked.

### Handle Authentication failure with `AuthenticationEntryPoint`

`AuthenticationEntryPoint`'s `commence` method is called when an `AuthenticationException` is thrown. You can implement this interface to return a customized response.

```java
// src/main/java/dev/mflash/guides/resterror/security/CustomAuthenticationEntryPoint.java

public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationEntryPoint.class);

  public @Override void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
      throws IOException {
    logger.error(e.getLocalizedMessage(), e);

    String message = RestResponse.builder()
        .status(UNAUTHORIZED)
        .error("Unauthenticated")
        .message("Insufficient authentication details")
        .path(request.getRequestURI())
        .json();

    response.setStatus(UNAUTHORIZED.value());
    response.setContentType(APPLICATION_JSON_VALUE);
    response.getWriter().write(message);
  }
}
```

You can be as generic or versatile in handling different types of `AuthenticationException`s as you need. Configure this entrypoint in the security configuration as follows.

```java {19}
// src/main/java/dev/mflash/guides/resterror/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private static final String LOGIN_URL = "/user/login";
  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.cors().and()
        .csrf().disable()
        .authorizeRequests().antMatchers(POST, REGISTRATION_URL).permitAll()
        .anyRequest().authenticated().and()
        .addFilter(new CustomAuthenticationFilter(authenticationManager()))
        .exceptionHandling().authenticationEntryPoint(new CustomAuthenticationEntryPoint()).and()
        .addFilter(new CustomAuthorizationFilter(authenticationManager()))
        .sessionManagement().sessionCreationPolicy(STATELESS);
  }

  // other configurations
}
```

### Handle Authorization failure with `AccessDeniedHandler`

To handle authorization failures, you can implement the `AccessDeniedHandler` interface. 

```java
// src/main/java/dev/mflash/guides/resterror/security/CustomAccessDeniedHandler.java

public class CustomAccessDeniedHandler implements AccessDeniedHandler {

  private static final Logger logger = LoggerFactory.getLogger(CustomAccessDeniedHandler.class);

  public @Override void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e)
      throws IOException {
    logger.error(e.getLocalizedMessage(), e);

    String message = RestResponse.builder()
        .status(FORBIDDEN)
        .message("Invalid Authorization token")
        .path(request.getRequestURI())
        .json();

    response.setStatus(FORBIDDEN.value());
    response.setContentType(APPLICATION_JSON_VALUE);
    response.getWriter().write(message);
  }
}
```

Similar to the `AuthenticationEntryPoint` approach, you can handle different scenarios that can lead to authorization failure. Call the `handle` method implemented above whenever such scenarios are encountered. An example is given below.

```java {28}
// src/main/java/dev/mflash/guides/resterror/security/CustomAuthorizationFilter.java

public class CustomAuthorizationFilter extends BasicAuthenticationFilter {

  private final AccessDeniedHandler accessDeniedHandler;

  public CustomAuthorizationFilter(AuthenticationManager authenticationManager, AccessDeniedHandler accessDeniedHandler) {
    super(authenticationManager);
    this.accessDeniedHandler = accessDeniedHandler;
  }

  protected @Override void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    String header = request.getHeader(AUTH_HEADER_KEY);

    if (Objects.isNull(header) || !header.startsWith(TOKEN_PREFIX)) {
      chain.doFilter(request, response);
      return;
    }

    if (header.startsWith(TOKEN_PREFIX)) {
      try {
        var authentication = getAuthentication(header);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
      } catch (Exception e) {
        accessDeniedHandler.handle(request, response, new AccessDeniedException(e.getLocalizedMessage(), e));
      }
    }
  }

  private UsernamePasswordAuthenticationToken getAuthentication(String header) {

    if (header.startsWith(TOKEN_PREFIX)) {
      String username = parseToken(header);
      return new UsernamePasswordAuthenticationToken(username, null, List.of());
    } else {
      throw new AccessDeniedException("Failed to parse authentication token");
    }
  }
}
```

For this to work, you'll have to inject the `CustomAccessDeniedHandler` in `CustomAuthorizationFilter` through the security configuration, as follows.

```java {20}
// src/main/java/dev/mflash/guides/resterror/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private static final String LOGIN_URL = "/user/login";
  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.cors().and()
        .csrf().disable()
        .authorizeRequests().antMatchers(POST, REGISTRATION_URL).permitAll()
        .anyRequest().authenticated().and()
        .addFilter(new CustomAuthenticationFilter(authenticationManager()))
        .exceptionHandling().authenticationEntryPoint(new CustomAuthenticationEntryPoint()).and()
        .addFilter(new CustomAuthorizationFilter(authenticationManager(), new CustomAccessDeniedHandler()))
        .sessionManagement().sessionCreationPolicy(STATELESS);
  }

  // other configurations
}
```

Launch the application again and try accessing an endpoint without any authentication details.

```sh
$ curl --location --request GET 'http://localhost:8080/book'
{
  "timestamp": "2020-07-26T20:38:10.166004300",
  "status": 401,
  "error": "Unauthenticated",
  "message": "Insufficient authentication details",
  "path": "/book"
}
```

A `401 Unauthenticated` error was sent, informing that authentication details were not sufficient for this request. Now, add an expired Bearer token in an `Authorization` header and send the request again.

```sh
$ curl --location --request GET 'http://localhost:8080/book' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseS5icm9udGVAZXhhbXBsZS5jb20iLCJleHAiOjE1OTY1NTI0MTZ9.utTGxu-CTJglYQku9GMZPsOl-J8rni363nBaGbodNiP7D0J66Znf-fZZ-Hz_iVCO7CHj_s4E6Xuw68HCwyTZig'

{
  "timestamp": "2020-07-26T20:57:27.164265300",
  "status": 403,
  "error": "Forbidden",
  "message": "Invalid Authorization token",
  "path": "/book"
}
```

This time, a `403 Forbidden` error was sent indicating that even though the authentication was successful, the token was invalid. Generate a new token by sending a login request.

```sh
$ curl --location --request POST 'http://localhost:8080/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "arya.antrix@example.com",
  "password": "pa55word"
}'
```

You'll receive a response `200 OK` with an `Authorization` header that contains a token.

```sh
Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseS5icm9udGVAZXhhbXBsZS5jb20iLCJleHAiOjE1OTY2NDE0MjJ9.xK9KvbdlPN_r_rJzwfaidYY2r83pvGsXgIw8LQokvMbVXCyF9fZnV1CgnVc1pjQeswFq8rOGhmgEdCHp7DbR8w
```

Using this token, try sending the request again.

```sh
$ curl --location --request GET 'http://localhost:8080/book' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseS5icm9udGVAZXhhbXBsZS5jb20iLCJleHAiOjE1OTY2NDE0MjJ9.xK9KvbdlPN_r_rJzwfaidYY2r83pvGsXgIw8LQokvMbVXCyF9fZnV1CgnVc1pjQeswFq8rOGhmgEdCHp7DbR8w'

[
  {
    "id": 1,
    "title": "Kill Orbit",
    "author": "Joel Dane",
    "genre": "scifi"
  }
]
```

You'll receive a `200 OK` with a list of books saved in the database, as expected.

---

**Source code**

- [spring-rest-error-handling](https://github.com/Microflash/guides/tree/main/spring/spring-rest-error-handling)

**Related**

- [Securing Spring Boot APIs with JWT Authentication](/post/2020/04/10/securing-spring-boot-apis-with-jwt-authentication/)
- [Spring Security: Authentication and Authorization In-Depth](https://www.marcobehler.com/guides/spring-security)
