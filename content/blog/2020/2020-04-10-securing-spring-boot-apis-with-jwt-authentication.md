---
title: 'Securing Spring Boot APIs with JWT Authentication'
date: 2020-04-10 21:35:25
authors: [naiyer]
labels: [spring, jwt, postgres]
---

JSON Web Tokens (JWTs) are stateless, compact and self-contained [standard](https://tools.ietf.org/html/rfc7519) to transmit information as a JSON object. This object is usually encoded and encrypted to ensure the authenticity of the message. JWTs are small enough to be sent through URLs. Since they are self-contained, applications can glean sufficient authentication information from them, saving trips to the database. Being stateless, JWTs are particularly suitable to work with REST and HTTP (which are also stateless).

So, how does this work?

- When an application is secured using a JWT-based authentication, it requires a user to login with their credentials. These credentials can be backed by a database, a dedicated Identity and Access Management (IAM) system, etc. 
- Once the login is successful, the application returns a JWT token. This token can be saved on the client side (using localStorage, cookie, etc.). 
- When a subsequent request is made to the application, the token should be sent with it in an `Authorization` header, often using a [Bearer schema](https://tools.ietf.org/html/rfc6750).

![JWT-based authentication flow](./images/2020-04-10-securing-spring-boot-apis-with-jwt-authentication-01.svg)

In this post, we'll create a simple Spring Boot API and secure it using Spring Security and JWT-based authentication.

##### Setup

The code written for this post uses

- Java 14
- Spring Boot 2.2.6
- Java JWT 0.9.1
- Postgres 12.2
- Gradle 6.3

You can create an instance of Postgres using the following `Compose` file.

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

## Configure the project

Generate a Spring Boot project with [Spring Initializr](https://start.spring.io/), and add `spring-boot-starter-web`, `spring-boot-starter-data-jpa` and `postgresql` as dependencies.

Your `build.gradle` would look like this.

```groovy
plugins {
  id 'org.springframework.boot' version '2.2.6.RELEASE'
  id 'io.spring.dependency-management' version '1.0.9.RELEASE'
  id 'java'
}

group = 'dev.mflash.guides'
version = '0.0.1'
sourceCompatibility = JavaVersion.VERSION_14

repositories {
  jcenter()
}

dependencies {
  implementation('org.springframework.boot:spring-boot-starter-web')
  implementation('org.springframework.boot:spring-boot-starter-data-jpa')
  runtimeOnly('org.postgresql:postgresql')
}
```

Open `application.yml` file and add the following database configuration.

```yaml
# src/main/resources/application.yml

spring:
  datasource:
    platform: postgres
    url: jdbc:postgresql://localhost:5432/spring-guides
    username: postgres
    password: example
```

## Define the domain

Say, you want to save a `Note` object, described by the following entity.

```java
// src/main/java/dev/mflash/guides/jwtauth/domain/Note.java

public @Entity class Note {

  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Id int id;
  private String title;
  private String content;
  private OffsetDateTime lastUpdate;

  // getters, setters, etc.
}
```

The `id` will be of type `SERIAL` in Postgres which'll be automatically incremented by the database. That's why we're delegating the generation to Postgres through `IDENTITY` generation strategy.

Create the required table using the following SQL statement.

```sql
CREATE TABLE note (
	id SERIAL PRIMARY KEY,
	title TEXT,
	content TEXT,
	last_update TIMESTAMP WITH TIME ZONE DEFAULT (current_timestamp AT TIME ZONE 'UTC')
);
```

**Note** that the `last_update` field will save the timestamp with `UTC` timezone.

## Create the Notes API

Define a `NoteRepository` to perform database operations.

```java
// src/main/java/dev/mflash/guides/jwtauth/repository/NoteRepository.java

public interface NoteRepository extends JpaRepository<Note, Integer> {

}
```

Create a controller to expose CRUD operations for `Note`. With Spring 5.2, a new functional way of writing controllers has been introduced (called [`WebMvc.fn`](https://spring.io/blog/2019/04/03/spring-tips-webmvc-fn-the-functional-dsl-for-spring-mvc)). `WebMvc.fn` introduces the following key concepts.

- **HandlerFunction** which accepts a `ServerRequest` and provides a `ServerResponse`. A `ServerRequest` object encapsulates all kinds of requests, including path variables, request body, etc, which were traditionally parsed using annotations. A `ServerResponse` is analogous to a response wrapped in a `ResponseEntity`.
- **RouterFunction** which configures the endpoints and their content-type. Traditionally, this was handled using annotations; now it's done through functions. After defining the routes, the request is sent to a handler function which provides the expected response.

Using `WebMvc.fn`, your `NoteController` will look like this.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/NoteController.java

public @Controller class NoteController {

  private final NoteRepository repository;

  public NoteController(NoteRepository repository) {
    this.repository = repository;
  }

  private ServerResponse addNote(ServerRequest request) throws ServletException, IOException {
    final Note note = request.body(Note.class);
    note.setLastUpdate(OffsetDateTime.now());
    final int id = repository.save(note).getId();
    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", "Saved '" + note.getTitle() + "' with id: " + id));
  }

  private ServerResponse getNotes(ServerRequest request) {
    final List<Note> notes = repository.findAll();
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(notes);
  }

  private ServerResponse editNote(ServerRequest request) throws ServletException, IOException {
    final int id = Integer.parseInt(request.pathVariable("id"));
    final Note editedNote = request.body(Note.class);
    repository.findById(id).ifPresent(note -> {
      final Note newNote = new Note();
      newNote.setId(id);
      newNote.setTitle(!editedNote.getTitle().equals(note.getTitle()) ? editedNote.getTitle() : note.getTitle());
      newNote
          .setContent(!editedNote.getContent().equals(note.getContent()) ? editedNote.getContent() : note.getContent());
      newNote.setLastUpdate(OffsetDateTime.now());

      repository.save(newNote);
    });

    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", "Saved edits for '" + editedNote.getTitle() + "'"));
  }

  private ServerResponse deleteNote(ServerRequest request) {
    final int id = Integer.parseInt(request.pathVariable("id"));
    repository.deleteById(id);
    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", "Successfully deleted note with id: " + id));
  }

  public @Bean RouterFunction<ServerResponse> notesRouter() {
    return route()
        .nest(RequestPredicates.path("/notes"),
            builder -> builder.POST("/", this::addNote)
              .GET("/", this::getNotes)
              .PUT("/{id}", this::editNote)
              .DELETE("/{id}", this::deleteNote).build())
        .build();
  }
}
```

### Converters for `OffsetDateTime`

Spring doesn't provide converters to convert `OffsetDateTime` into `Timestamp` and vice versa. You'll have to write `CustomConversions` to provide this information to Spring Data.

Implement a `CustomConversions` class to conveniently define JPA-compatible conversions.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/converter/JpaCustomConversions.java

public class JpaCustomConversions extends CustomConversions {

  private static final List<Object> STORE_CONVERTERS = Collections.emptyList();
  private static final StoreConversions STORE_CONVERSIONS = StoreConversions
      .of(new SimpleTypeHolder(Collections.emptySet(), true), STORE_CONVERTERS);

  public JpaCustomConversions() {
    this(Collections.emptyList());
  }

  public JpaCustomConversions(Collection<?> converters) {
    super(STORE_CONVERSIONS, converters);
  }
}
```

Now, implement `Converter` interface to define converters for `OffsetDateTime` and `Timestamp`, as follows.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/converter/OffsetDateTimeToTimestampConverter.java

@WritingConverter
public enum OffsetDateTimeToTimestampConverter implements Converter<OffsetDateTime, Timestamp> {
  INSTANCE;

  public @Override Timestamp convert(OffsetDateTime source) {
    return Timestamp.from(Instant.from(source));
  }
}

// src/main/java/dev/mflash/guides/jwtauth/configuration/converter/TimestampToOffsetDateTimeConverter.java

@ReadingConverter
public enum TimestampToOffsetDateTimeConverter implements Converter<Timestamp, OffsetDateTime> {
  INSTANCE;

  public @Override OffsetDateTime convert(Timestamp source) {
    return source.toInstant().atOffset(ZoneOffset.UTC);
  }
}
```

Inject these converters through a configuration.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/DatabaseConfiguration.java

@EnableJpaRepositories("dev.mflash.guides.jwtauth.repository")
public class DatabaseConfiguration {

  @Primary
  public @Bean JpaCustomConversions customConversions() {
    final var converters = new ArrayList<Converter<?, ?>>();
    converters.add(TimestampToOffsetDateTimeConverter.INSTANCE);
    converters.add(OffsetDateTimeToTimestampConverter.INSTANCE);
    return new JpaCustomConversions(converters);
  }
}
```

Launch the application and you'd be able to hit the APIs without any authentication.

```sh
curl --location --request POST 'http://localhost:8080/notes' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "An example note",
  "content": "Some content"
}'

curl --location --request GET 'http://localhost:8080:8080/notes'

curl --location --request PUT 'http://localhost:8080:8080/notes/1' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "An example note",
  "content": "With some changes in content"
}'

curl --location --request DELETE 'http://localhost:8080:8080/notes/1'
```

## Enable User registration with Spring Security

Spring Security's `AuthenticationManager` works with a `UserDetails` object to handle the authentication. For a custom user, say `CustomUser`, we'll have to provide corresponding `UserDetails`. This can be done by

- defining a `CustomUser` and `CustomUserRepository`
- extending `UserDetailsService` interface and overriding its `loadUserByUsername` method to return details from `CustomUser`
- providing this service to `AuthenticationManager` through a configuration.

### Create an API to save `CustomUser`

To begin with, create the following table to store user information in the database.

```sql
CREATE TABLE custom_user (
	id SERIAL PRIMARY KEY,
	email TEXT,
	name TEXT,
	password TEXT
);
```

Define an entity corresponding to this table.

```java
// src/main/java/dev/mflash/guides/jwtauth/domain/CustomUser.java

public @Entity class CustomUser {

  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Id int id;
  private String email;
  private String name;
  private String password;

  // getters, setters, etc.
}
```

Define a repository to save and fetch the user. For this application, we'll treat the `email` as the username of a `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/repository/CustomUserRepository.java

public interface CustomUserRepository extends JpaRepository<CustomUser, Integer> {

  CustomUser findByEmail(String email);
}
```

To let a user register on the application, expose an endpoint to create a new `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/CustomUserController.java

public @Controller class CustomUserController {

  private final CustomUserRepository repository;
  private final PasswordEncoder passwordEncoder;

  public CustomUserController(CustomUserRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

  private ServerResponse register(ServerRequest request) throws ServletException, IOException {
    final CustomUser customUser = request.body(CustomUser.class);
    customUser.setPassword(passwordEncoder.encode(customUser.getPassword()));
    repository.save(customUser);
    return ServerResponse.ok().contentType(APPLICATION_JSON)
        .body(Map.of("message", "Successfully saved " + customUser.getName()));
  }

  public @Bean RouterFunction<ServerResponse> customUserRouter() {
    return route()
        .POST("/users/register", this::register)
        .build();
  }
}
```

**Note** that we're encoding the plaintext password sent by the user before saving it into the database. `PasswordEncoder` is not provided by default; we'll have to inject it through a configuration. 

### Integrate the user management with Spring Security

Add the following dependency in `build.gradle` for Spring Security.

```groovy
// Rest of the build file

dependencies {
  // Other dependencies
  implementation('org.springframework.boot:spring-boot-starter-security')
}
```

Implement the `UserDetailsService` which provides `loadUserByUsername` method to convert `CustomUser` for Spring Security by specifying that the `email` is the username field.

```java
// src/main/java/dev/mflash/guides/jwtauth/service/CustomUserDetailsService.java

public @Service class CustomUserDetailsService implements UserDetailsService {

  private final CustomUserRepository repository;

  public CustomUserDetailsService(CustomUserRepository repository) {
    this.repository = repository;
  }

  public @Override UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    CustomUser customUser = Objects.requireNonNull(repository.findByEmail(email), () -> {
      throw new UsernameNotFoundException(email);
    });

    return new User(customUser.getEmail(), customUser.getPassword(), Collections.emptyList());
  }
}
```

Now, we can inject this service into Spring Security's `AuthenticationManager` to complete the integration of `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  public @Bean PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  protected @Override void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
  }
}
```

**Note** that we've injected `BCryptPasswordEncoder` through this configuration to encode the user data; this `PasswordEncoder` will be used by `CustomUserController` while saving a new user.

## Add Authentication and Authorization filters

To work with JWT, add the following dependency in `build.gradle`.

```groovy
// Rest of the build file

dependencies {
  // Other dependencies
  implementation('io.jsonwebtoken:jjwt:0.9.1')
}
```

Create a `TokenManager` class that'll generate and parse the JWT tokens.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/security/TokenManager.java

public class TokenManager {

  private static final String SECRET = "U3ByaW5nQm9vdFN1cGVyU2VjcmV0";
  private static final long EXPIRATION_TIME = 10; // 10 days
  static final String TOKEN_PREFIX = "Bearer ";
  static final String HEADER_STRING = "Authorization";
  public static final String SIGN_UP_URL = "/users/register";

  static String generateToken(String subject) {
    return Jwts.builder()
        .setSubject(subject)
        .setExpiration(Date.from(ZonedDateTime.now().plusDays(EXPIRATION_TIME).toInstant()))
        .signWith(SignatureAlgorithm.HS512, SECRET.getBytes())
        .compact();
  }

  static String parseToken(String token) {
    return Jwts.parser()
        .setSigningKey(SECRET.getBytes())
        .parseClaimsJws(token.replace(TOKEN_PREFIX, ""))
        .getBody()
        .getSubject();
  }
}
```

`SECRET` is a client-generated string used for signing the token. We've set the tokens to expire after 10 days (through `EXPIRATION_TIME` constant).

Now, define an `AuthenticationFilter` to verify the correct user.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/security/JWTAuthenticationFilter.java

public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

  private final AuthenticationManager authenticationManager;

  public JWTAuthenticationFilter(AuthenticationManager authenticationManager) {
    this.authenticationManager = authenticationManager;
  }

  public @Override Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
    try {
      CustomUser customUser = new ObjectMapper().readValue(request.getInputStream(), CustomUser.class);

      return authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(customUser.getEmail(), customUser.getPassword(), Collections.emptyList()));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  protected @Override void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain, Authentication authResult) throws IOException, ServletException {
    response.addHeader(HEADER_STRING, TOKEN_PREFIX + generateToken(((User) authResult.getPrincipal()).getUsername()));
  }
}
```

Here, 

- the `attemptAuthentication` method extracts the user from the request and tries to authenticate them with the help of `AuthenticationManager`. 
- On successful authentication, a token is generated by `TokenManager` and attached to the header of the response (see `successfulAuthentication` method). This token will be used for subsequent requests and will be checked every time. 
  
On successful verification of the token, access to the application will be enabled with the help of `doFilterInternal` method of `JWTAuthorizationFilter`.

```java
// src/main/java/dev/mflash/guides/jwtauth/configuration/security/JWTAuthorizationFilter.java

public class JWTAuthorizationFilter extends BasicAuthenticationFilter {

  public JWTAuthorizationFilter(AuthenticationManager authenticationManager) {
    super(authenticationManager);
  }

  private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request) {
    String token = Objects.requireNonNull(request.getHeader(HEADER_STRING));
    String user = Objects.requireNonNull(parseToken(token));
    return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
  }

  protected @Override void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    String header = request.getHeader(HEADER_STRING);

    if (Objects.isNull(header) || !header.startsWith(TOKEN_PREFIX)) {
      chain.doFilter(request, response);
      return;
    }

    UsernamePasswordAuthenticationToken authentication = getAuthentication(request);

    SecurityContextHolder.getContext().setAuthentication(authentication);
    chain.doFilter(request, response);
  }
}
```

Here, the `doFilterInternal` method extracts the `Authorization` header, fetches the authentication status and updates the `SecurityContext`. If the authentication fails, the request to the application is denied by the filter.

We need to register these filters and specify which endpoints are protected and which are accessible publicly in the `SecurityConfiguration`.

```java{16-25, 31-35}
// src/main/java/dev/mflash/guides/jwtauth/configuration/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  public @Bean PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.cors().and()
        .csrf().disable()
        .authorizeRequests()
          .antMatchers(HttpMethod.POST, TokenManager.SIGN_UP_URL).permitAll()
        .anyRequest().authenticated().and()
        .addFilter(new JWTAuthenticationFilter(authenticationManager()))
        .addFilter(new JWTAuthorizationFilter(authenticationManager()))
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
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

Launch the application, and try to hit the <http://localhost:8080/notes> endpoint.

```sh
$ curl --location --request GET 'localhost:8080/notes'
{
  "timestamp": "2020-04-10T17:58:03.858+0000",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/notes"
}
```

The response `403 Forbidden` is expected, since this endpoint is no longer accessible publicly. Now, register as a new user.

```sh
curl --location --request POST 'localhost:8080/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Emily",
    "email": "emily@example.com",
    "password": "m4kEY&QU8I_."
}'
```

and login with this user.

```sh
curl --location --request POST 'localhost:8080/login' \
--header 'Content-Type: application/json' \
--header 'Content-Type: text/plain' \
--data-raw '{
  "email": "emily@example.com",
  "password": "m4kEY&QU8I_."
}'
```

You'll receive a response `200 OK` with an `Authorization` header that contains a token,

```sh
Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseUBleGFtcGxlLmNvbSIsImV4cCI6MTU4NzQwNTcwMn0.-gKb3XHD18ego96v4ObI211oihi4kfLmG68rJ_7aa_7ClNpoEpkjJTP9LjxoRnrGAcF3GQrhqOiOIWAJIbU1YQ
```

Use this token and hit the <http://localhost:8080/notes> endpoint, again. This time, you'll get a successful response. Play with other endpoints to create, edit and delete a note, using the same token.

```sh{1,2}
$ curl --location --request GET 'localhost:8080/notes' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbWlseUBleGFtcGxlLmNvbSIsImV4cCI6MTU4NzQwNTcwMn0.-gKb3XHD18ego96v4ObI211oihi4kfLmG68rJ_7aa_7ClNpoEpkjJTP9LjxoRnrGAcF3GQrhqOiOIWAJIbU1YQ'

[
  {
    "id": 1,
    "title": "An example note",
    "content": "Some content",
    "lastUpdate": "2020-04-10T23:35:26.216324+05:30"
  }
]
```

## References

**Source Code** &mdash; [spring-security-jwt-auth](https://gitlab.com/mflash/spring-guides/-/tree/master/spring-security-jwt-auth)

**Related**
- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [Verify Access Tokens for Custom APIs](https://auth0.com/docs/api-auth/tutorials/verify-access-token)
