---
title: 'Securing Spring Boot APIs with JWT Authentication'
date: 2020-04-10 21:35:25
updated: 2020-07-27 12:14:55
authors: [naiyer]
topics: [spring, security, jwt]
---

JSON Web Tokens (JWTs) are stateless, compact and self-contained [standard](https://tools.ietf.org/html/rfc7519) to transmit information as a JSON object. This object is usually encoded and encrypted to ensure the authenticity of the message. JWTs are small enough to be sent through URLs. Since they are self-contained, applications can glean sufficient authentication information from them, saving trips to the database. Being stateless, JWTs are particularly suitable to work with REST and HTTP (which are also stateless).

So, how does this work?

- When an application is secured using a JWT-based authentication, it requires a user to login with their credentials. These credentials can be backed by a database, a dedicated Identity and Access Management (IAM) system, etc. 
- Once the login is successful, the application returns a JWT token. This token can be saved on the client side (using localStorage, cookie, etc.). 
- When a subsequent request is made to the application, the token should be sent with it in an `Authorization` header, often using a [Bearer schema](https://tools.ietf.org/html/rfc6750).

![JWT-based authentication flow](./images/2020-04-10-securing-spring-boot-apis-with-jwt-authentication-01.svg)

In this post, we'll create a simple Spring Boot API and secure it using Spring Security and JWT-based authentication.

:::note Setup
The code written for this post uses

- Java 14
- Spring Boot 2.3.2
- Java JWT 0.11.2
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

Generate a Spring Boot project with [Spring Initializr](https://start.spring.io/), and add `spring-boot-starter-web`, `spring-boot-starter-data-jdbc` and `postgresql` as dependencies.

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
  <artifactId>spring-security-jwt-auth</artifactId>
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

Rename `application.properties` to `application.yml`, open the file and add the following database configuration.

```yaml
# src/main/resources/application.yml

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/spring
    username: erin
    password: richards
```

## Define the domain

Say, you want to save a `Book` object, described by the following entity.

```java
// src/main/java/dev/mflash/guides/jwtauth/domain/Book.java

public class Book {

  private @Id long id;
  private String title;
  private String author;
  private Genre genre;

  // getters, setters, etc.
}
```

The `id` will be of type `SERIAL` in Postgres which'll be automatically incremented by the database.

Create the required table using the following SQL statement.

```sql
CREATE TABLE book (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	genre TEXT NOT NULL
);
```

**Note** that the `genre` is an enum described as follows.

```java
public enum Genre {
  fantasy,
  thriller,
  scifi
}
```

## Create the Book API

Define a `BookRepository` to perform database operations.

```java
// src/main/java/dev/mflash/guides/jwtauth/persistence/BookRepository.java

public interface BookRepository extends CrudRepository<Book, Long> {

  @Modifying
  @Query("delete from book where id = :id")
  int deleteById(@Param("id") long id);
}
```

Create a controller to expose CRUD operations for `Book`. With Spring 5.2, a new functional way of writing controllers has been introduced (called [`WebMvc.fn`](https://spring.io/blog/2019/04/03/spring-tips-webmvc-fn-the-functional-dsl-for-spring-mvc)). `WebMvc.fn` introduces the following key concepts.

- **HandlerFunction** which accepts a `ServerRequest` and provides a `ServerResponse`. A `ServerRequest` object encapsulates all kinds of requests, including path variables, request body, etc, which were traditionally parsed using annotations. A `ServerResponse` is analogous to a response wrapped in a `ResponseEntity`.
- **RouterFunction** which configures the endpoints and their content-type. Traditionally, this was handled using annotations; now it's done through functions. After defining the routes, the request is sent to a handler function which provides the expected response.

Using `WebMvc.fn`, your `BookController` will look like this.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/BookController.java

public @Controller class BookController {

  private final BookRepository repository;

  public BookController(BookRepository repository) {
    this.repository = repository;
  }

  private ServerResponse addBook(ServerRequest request) throws ServletException, IOException {
    final Book newBook = request.body(Book.class);
    repository.save(newBook);
    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", String.format("Save successful for %s", newBook.getTitle())));
  }

  private ServerResponse getAllBooks(ServerRequest request) {
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(repository.findAll());
  }

  private ServerResponse editBook(ServerRequest request) throws ServletException, IOException {
    long id = Long.parseLong(request.pathVariable("id"));
    final Book editedBook = request.body(Book.class);
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

    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", String.format("Patch successful for %s", editedBook.getTitle())));
  }

  private ServerResponse deleteBook(ServerRequest request) {
    long id = Long.parseLong(request.pathVariable("id"));

    if (repository.deleteById(id) < 1) {
      throw new InvalidDataAccessApiUsageException("Couldn't delete a non-existent record");
    }

    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", String.format("Deletion successful for book with id: %s", id)));
  }

  public @Bean RouterFunction<ServerResponse> bookRoutes() {
    return route()
        .nest(path("/book"),
            builder -> builder
                .GET("/", this::getAllBooks)
                .PUT("/", this::addBook)
                .PATCH("/{id}", this::editBook)
                .DELETE("/{id}", this::deleteBook))
        .build();
  }
}
```

Launch the application and you'd be able to hit the APIs without any authentication.

```sh
$ curl --location --request PUT 'http://localhost:8080/book' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "Kill Orbit",
  "author": "Joel Dane",
  "genre": "scifi"
}'

$ curl --location --request GET 'http://localhost:8080/book'

$ curl --location --request PATCH 'http://localhost:8080/book/1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "title": "Cry Pilot",
    "author": "Joel Dane",
    "genre": "scifi"
}'

$ curl --location --request DELETE 'http://localhost:8080/book/1'
```

## Enable User registration with Spring Security

Spring Security's `AuthenticationManager` works with a `UserDetails` object to handle the authentication. For a custom user, say `CustomUser`, we'll have to provide corresponding `UserDetails`. This can be done by

- defining a `CustomUser` and `CustomUserRepository`
- extending `UserDetailsService` interface and overriding its `loadUserByUsername` method to return details from `CustomUser`
- providing this service to `AuthenticationManager` through a configuration.

> In our case, we're saving the `CustomUser` in a Postgres database. There are other solutions to save and fetch this user, like LDAP, OIDC, etc., which are out of the scope of this article.

### Create an API to save `CustomUser`

To begin with, create the following table to store user information in the database.

```sql
CREATE TABLE custom_user (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL,
	name TEXT NOT NULL,
	password TEXT NOT NULL
);
```

Define an entity corresponding to this table.

```java
// src/main/java/dev/mflash/guides/jwtauth/domain/CustomUser.java

public class CustomUser {

  private @Id int id;
  private String email;
  private String name;
  private String password;

  // getters, setters, etc.
}
```

Define a repository to save and fetch the user. For this application, we'll treat the `email` as the username of a `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/persistence/CustomUserRepository.java

public interface CustomUserRepository extends CrudRepository<CustomUser, Long> {

  Optional<CustomUser> findByEmail(String email);
}
```

To let a user register on the application, expose an endpoint to create a new `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/CustomUserController.java

public @Controller class CustomUserController {

  public static final String REGISTRATION_URL = "/user/register";

  private final CustomUserRepository repository;
  private final PasswordEncoder passwordEncoder;

  public CustomUserController(CustomUserRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

  private ServerResponse register(ServerRequest request) throws ServletException, IOException {
    final CustomUser newUser = request.body(CustomUser.class);
    newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
    repository.save(newUser);
    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", String.format("Registration successful for %s", newUser.getName())));
  }

  public @Bean RouterFunction<ServerResponse> userRoutes() {
    return route()
        .POST(REGISTRATION_URL, this::register)
        .build();
  }
}
```

**Note** that we're encoding the plaintext password sent by the user before saving it into the database. `PasswordEncoder` is not provided by default; we'll have to inject it through a configuration. 

### Integrate the user management with Spring Security

Add the following dependency in `pom.xml` for Spring Security.

```xml
<!-- Rest of the POM file -->

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
  </dependencies>
```

Implement the `UserDetailsService` which provides `loadUserByUsername` method to convert `CustomUser` for Spring Security by specifying that the `email` is the username field.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/CustomUserDetailsService.java

public @Service class CustomUserDetailsService implements UserDetailsService {

  private static final String PLACEHOLDER = UUID.randomUUID().toString();
  private static final User DEFAULT_USER = new User(PLACEHOLDER, PLACEHOLDER, List.of());
  private final CustomUserRepository repository;

  public CustomUserDetailsService(CustomUserRepository repository) {
    this.repository = repository;
  }

  public @Override UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    return repository.findByEmail(email)
        .map(CustomUserConverter::toUser)
        .orElse(DEFAULT_USER);
  }
}
```

`CustomUserConverter` is a utility class that provides methods to convert `CustomUser` into other objects.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/CustomUserConverter.java

public class CustomUserConverter {

  public static User toUser(CustomUser user) {
    return new User(user.getEmail(), user.getPassword(), List.of());
  }

  public static UsernamePasswordAuthenticationToken toAuthenticationToken(CustomUser user) {
    return new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword(), List.of());
  }
}
```

Now, we can inject `CustomUserDetailsService` into Spring Security's `AuthenticationManager` to complete the integration of `CustomUser`.

```java{16-18}
// src/main/java/dev/mflash/guides/jwtauth/configuration/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  public @Bean PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  protected @Override void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
  }
}
```

> **About `PasswordEncoder`**
> If you're starting afresh, you can choose a `PasswordEncoder` of your choosing, say `BCryptPasswordEncoder` and things will work fine. However, there are chances that your application is using multiple encoders to store the passwords. A typical password record may look like this (a prefix enclosed in braces followed by the actual hash): `{bcrypt}$2a$10$LYB29GePiC3/ieDvmqCfL.Y6GEk9vEoZVZR2/EQ9nacnY43aQ4LO6`
>
> The `createDelegatingPasswordEncoder` comes to rescue here. It figures out the correct password encoding algorithm by reading the prefix and performs encoding and decoding operations.

Note that the same `PasswordEncoder` is used by `CustomUserController` to encode the password of a new user.

## Add Authentication and Authorization filters

To work with JWT, add the following dependencies in `pom.xml`.

```xml
<!-- Rest of the POM file -->

  <dependencies>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-api</artifactId>
      <version>0.11.2</version>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-impl</artifactId>
      <version>0.11.2</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-jackson</artifactId>
      <version>0.11.2</version>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
```

Create a `TokenManager` class that'll generate and parse the JWT tokens.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/TokenManager.java

public class TokenManager {

  private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);
  public static final String TOKEN_PREFIX = "Bearer ";
  private static final int TOKEN_EXPIRY_DURATION = 10; // in days

  public static String generateToken(String subject) {
    return Jwts.builder()
        .setSubject(subject)
        .setExpiration(Date.from(ZonedDateTime.now().plusDays(TOKEN_EXPIRY_DURATION).toInstant()))
        .signWith(SECRET_KEY)
        .compact();
  }

  public static String parseToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(SECRET_KEY)
        .build()
        .parseClaimsJws(token.replace(TOKEN_PREFIX, ""))
        .getBody()
        .getSubject();
  }
}
```

`SECRET_KEY` is randomly-generated key using `HS512` algorithm (there are [other algorithms](https://github.com/jwtk/jjwt#signature-algorithms-keys), as well). This key is used for signing the tokens by `generateToken` method and subsequently to read them by `parseToken` method. We've also set the tokens to expire after 10 days (through `TOKEN_EXPIRY_DURATION` constant).

Now, define an `AuthenticationFilter` to verify the correct user.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/CustomAuthenticationFilter.java

public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

  public static final String AUTH_HEADER_KEY = "Authorization";

  private final AuthenticationManager authenticationManager;

  public CustomAuthenticationFilter(AuthenticationManager authenticationManager) {
    this.authenticationManager = authenticationManager;
  }

  public @Override Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
    try {
      var user = new ObjectMapper().readValue(request.getInputStream(), CustomUser.class);
      return authenticationManager.authenticate(CustomUserConverter.toAuthenticationToken(user));
    } catch (IOException e) {
      throw new AuthenticationCredentialsNotFoundException("Failed to resolve authentication credentials", e);
    }
  }

  protected @Override void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain, Authentication authResult) throws IOException, ServletException {
    response.addHeader(AUTH_HEADER_KEY,
        TOKEN_PREFIX + generateToken(((User) authResult.getPrincipal()).getUsername()));
  }
}
```

Here, 

- the `attemptAuthentication` method extracts the user from the request and tries to authenticate them with the help of `AuthenticationManager`. 
- On successful authentication, a token is generated by `TokenManager` and attached to the header of the response (see `successfulAuthentication` method). This token will be used for subsequent requests and will be checked every time a request arrives. 
  
On successful verification of the token, access to the application will be enabled with the help of `doFilterInternal` method of `CustomAuthorizationFilter`.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/CustomAuthorizationFilter.java

public class CustomAuthorizationFilter extends BasicAuthenticationFilter {

  public CustomAuthorizationFilter(AuthenticationManager authenticationManager) {
    super(authenticationManager);
  }

  protected @Override void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    String header = request.getHeader(AUTH_HEADER_KEY);

    if (Objects.isNull(header) || !header.startsWith(TOKEN_PREFIX)) {
      chain.doFilter(request, response);
      return;
    }

    UsernamePasswordAuthenticationToken authentication = getAuthentication(request);
    SecurityContextHolder.getContext().setAuthentication(authentication);
    chain.doFilter(request, response);
  }

  private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request) {
    String header = request.getHeader(AUTH_HEADER_KEY);

    if (Objects.nonNull(header) && header.startsWith(TOKEN_PREFIX)) {
      try {
        String username = parseToken(header);
        return new UsernamePasswordAuthenticationToken(username, null, List.of());
      } catch (ExpiredJwtException e) {
        throw new AccessDeniedException("Expired token");
      } catch (UnsupportedJwtException | MalformedJwtException e) {
        throw new AccessDeniedException("Unsupported token");
      } catch (Exception e) {
        throw new AccessDeniedException("User authorization not resolved");
      }
    } else {
      throw new AccessDeniedException("Authorization token not found");
    }
  }
}
```

Here, the `doFilterInternal` method extracts the `Authorization` header, fetches the authentication status and updates the `SecurityContext`. If the authentication fails, the request to the application is denied by the filter.

We need to register these filters and specify which endpoints are protected and which are accessible publicly in the `SecurityConfiguration`.

```java{12-20, 30-34}
// src/main/java/dev/mflash/guides/jwtauth/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

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
        .addFilter(new CustomAuthorizationFilter(authenticationManager()))
        .sessionManagement().sessionCreationPolicy(STATELESS);
  }

  public @Bean PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  protected @Override void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
  }

  public @Bean CorsConfigurationSource corsConfigurationSource() {
    final var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", new CorsConfiguration().applyPermitDefaultValues());
    return source;
  }
}
```

Here, we've
- allowed only the user registration endpoint to be accessible publicly, and restricted all other URLs to be accessible only after authentication.
- disabled the session management of Spring Security by setting the `SessionCreationPolicy` to be `STATELESS` since JWT authentication is stateless.

## Testing the application

Launch the application, and try to hit the <http://localhost:8080/book> endpoint.

```sh
$ curl --location --request GET 'http://localhost:8080/book'
{
  "timestamp": "2020-07-25T14:01:20.130+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "",
  "path": "/book"
}
```

The response `403 Forbidden` is expected, since this endpoint is no longer accessible publicly. Now, register as a new user.

```sh
$ curl --location --request POST 'http://localhost:8080/user/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Arya Antrix",
  "email": "arya.antrix@example.com",
  "password": "pa55word"
}'
```

and login with this user.

```sh
$ curl --location --request POST 'http://localhost:8080/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "arya.antrix@example.com",
  "password": "pa55word"
}'
```

You'll receive a response `200 OK` with an `Authorization` header that contains a token,

```sh
Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseS5icm9udGVAZXhhbXBsZS5jb20iLCJleHAiOjE1OTY1NDc2NDR9.ynoidjJ9b-42XO3nSiMzUcoF2wKWc3zGsCC9xObF4ymCJPcugAzx6Hd6NmUF342xnHoGqY2qXESqlKZ0HC9P2g
```

Use this token and hit the <http://localhost:8080/book> endpoint, again. This time, you'll get a successful response. Play with the other endpoints to create, edit and delete a book, using the same token.

```sh{1,2}
$ curl --location --request GET 'http://localhost:8080/book' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseS5icm9udGVAZXhhbXBsZS5jb20iLCJleHAiOjE1OTY1NDc2NDR9.ynoidjJ9b-42XO3nSiMzUcoF2wKWc3zGsCC9xObF4ymCJPcugAzx6Hd6NmUF342xnHoGqY2qXESqlKZ0HC9P2g'

[
  {
    "id": 1,
    "title": "Kill Orbit",
    "author": "Joel Dane",
    "genre": "scifi"
  }
]
```

## References

**Source Code** &mdash; [spring-security-jwt-auth](https://gitlab.com/mflash/spring-guides/-/tree/master/spring-security-jwt-auth)

**Related**
- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [Verify Access Tokens for Custom APIs](https://auth0.com/docs/api-auth/tutorials/verify-access-token)
