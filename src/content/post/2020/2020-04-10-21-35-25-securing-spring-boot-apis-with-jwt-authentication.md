---
slug: "2020/04/10/securing-spring-boot-apis-with-jwt-authentication"
title: "Securing Spring Boot APIs with JWT Authentication"
description: "JSON Web Tokens (JWTs) are a standard to transmit the information as a JSON object. An application can glean sufficient authentication information from them, saving trips to the database. Learn how to create a Spring Boot API and secure it using Spring Security and JWT-based authentication."
date: "2020-04-10 21:35:25"
update: "2020-11-05 19:31:55"
category: "guide"
tags: ["spring", "security", "jwt", "auth"]
---

JSON Web Tokens (JWTs) are stateless, compact, and self-contained [standard](https://tools.ietf.org/html/rfc7519) to transmit the information as a JSON object. This object is usually encoded and encrypted to ensure the authenticity of the message. JWTs are small enough to be sent through URLs. Since they are self-contained, applications can glean sufficient authentication information from them, saving trips to the database. Being stateless, JWTs are particularly suitable to work with REST and HTTP (which are also stateless).

So, how does this work?

- When an application is secured using a JWT-based authentication, it requires a user to login with their credentials. These credentials can be backed by a database, a dedicated Identity and Access Management (IAM) system, etc. 
- Once the login is successful, the application returns a JWT token. This token can be saved on the client-side (using localStorage, cookie, etc.). 
- When a subsequent request is made to the application, the token should be sent with it in an `Authorization` header, often using a [Bearer schema](https://tools.ietf.org/html/rfc6750).

![JWT-based authentication flow](/images/post/2020/2020-04-10-21-35-25-securing-spring-boot-apis-with-jwt-authentication-01.svg)

In this post, we'll create a Spring Boot API and secure it using Spring Security and JWT-based authentication.

:::setup
The code written for this post uses

- Java 15
- Spring Boot 2.3.5
- Java JWT 0.11.2
- H2 database (in-memory)
- httpie 2.3.0
- Maven 3.6.3
:::

[httpie](https://httpie.io/) is a user-friendly HTTP client with first-class JSON support and many other features. We'll use it to send requests to our APIs.

## Configure the project

Generate a Spring Boot project with [Spring Initializr](https://start.spring.io/), and add the `spring-boot-starter-web` as a dependency.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.5.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>spring-security-jwt-auth</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>15</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
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

## Create some endpoints

Let's create some endpoints to begin with. Here's a `GenericController` that exposes a GET endpoint which returns a message. This is the functional way of implementing a controller.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/GenericController.java

public @Controller class GenericController {

  public static final String PUBLIC_ENDPOINT_URL = "/jwt/public";

  private ServerResponse publicEndpoint(ServerRequest request) {
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(messageMap("public"));
  }

  private Map<String, String> messageMap(String type) {
    return Map.of("message", String.format("Hello, world! This is a %s endpoint", type));
  }

  public @Bean RouterFunction<ServerResponse> genericRoutes() {
    return route()
        .GET(PUBLIC_ENDPOINT_URL, this::publicEndpoint)
        .build();
  }
}
```

:::note{title=WebMvc.fn}
With Spring 5.2, a new functional way of writing controllers has been introduced (called [`WebMvc.fn`](https://spring.io/blog/2019/04/03/spring-tips-webmvc-fn-the-functional-dsl-for-spring-mvc)). `WebMvc.fn` introduces the following key concepts.

- **HandlerFunction** which accepts a `ServerRequest` and provides a `ServerResponse`. A `ServerRequest` object encapsulates all kinds of requests, including path variables, request body, etc, which were traditionally parsed using annotations. A `ServerResponse` is analogous to a response wrapped in a `ResponseEntity`.
- **RouterFunction** which configures the endpoints and their content-type. Traditionally, this was handled using annotations; now it's done through functions. After defining the routes, the request is sent to a handler function which provides the expected response.
:::

Launch the application and send the request to the endpoint.

```sh
$ http :8080/jwt/public
HTTP/1.1 200 
# other headers
{
  "message": "Hello, world! This is a public endpoint"
}
```

## Enable User registration with Spring Security

Spring Security's `AuthenticationManager` works with a `UserDetails` object to handle the authentication. For a custom user, say `CustomUser`, we'll have to provide a corresponding `UserDetails` object. This can be done by

- defining a `CustomUser` and `CustomUserRepository`
- extending `UserDetailsService` interface and overriding its `loadUserByUsername` method to return the details for a `CustomUser`, and
- adding this service to the `AuthenticationManager` through a configuration.

> In our case, we're going to save the `CustomUser` in an in-memory H2 database. You can use other databases (such as Postgres or MongoDB) to do the same. You can even integrate `UserDetailsService` with solutions like LDAP, OIDC, etc., if needed.

Add `spring-boot-starter-data-jdbc`, `h2` and `spring-boot-starter-security` in the `pom.xml`.

```xml {28-41,54-58}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.5.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>spring-security-jwt-auth</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>15</java.version>
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
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
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
    <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
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

### Create an API to save `CustomUser`

Since we would need a table to save the `CustomUser` objects, let's create a `schema.sql` file to initialize it.

```sql
-- src/main/resources/schema.sql

DROP TABLE IF EXISTS custom_user;

CREATE TABLE custom_user (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(250) NOT NULL,
	name VARCHAR(250) NOT NULL,
	password VARCHAR(250) NOT NULL
);
```

> Spring provides multiple ways to initialize a database schema through scripts available on the classpath. Check out the [docs](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto-database-initialization) for more details.

In this case, Spring will read the `schema.sql` file and execute the statements specified in it whenever the application is launched.

Define an entity corresponding to this table.

```java
// src/main/java/dev/mflash/guides/jwtauth/security/CustomUser.java

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
// src/main/java/dev/mflash/guides/jwtauth/security/CustomUserRepository.java

public interface CustomUserRepository extends CrudRepository<CustomUser, Long> {

  Optional<CustomUser> findByEmail(String email);
}
```

To let a user register on the application, expose an endpoint to create a new `CustomUser`.

```java
// src/main/java/dev/mflash/guides/jwtauth/controller/UserRegistrationController.java

public @Controller class UserRegistrationController {

  public static final String REGISTRATION_URL = "/user/register";

  private final CustomUserRepository repository;
  private final PasswordEncoder passwordEncoder;

  public UserRegistrationController(CustomUserRepository repository, PasswordEncoder passwordEncoder) {
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

  public @Bean RouterFunction<ServerResponse> registrationRoutes() {
    return route()
        .POST(REGISTRATION_URL, this::register)
        .build();
  }
}
```

**Note** that we're encoding the plaintext password sent by the user before saving it into the database. `PasswordEncoder` is not provided by default; we'll have to inject it through a configuration.

### Integrate the user management with Spring Security

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

```java {16-18}
// src/main/java/dev/mflash/guides/jwtauth/security/SecurityConfiguration.java

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

:::note{title=PasswordEncoder}
If you're starting afresh, you can choose a `PasswordEncoder` of your choosing, say `BCryptPasswordEncoder`, and things will work fine. However, there are chances that your application is using multiple encoders to store the passwords. A typical password record may look like this (a prefix enclosed in braces followed by the actual hash): `{bcrypt}$2a$10$LYB29GePiC3/ieDvmqCfL.Y6GEk9vEoZVZR2/EQ9nacnY43aQ4LO6`

The `createDelegatingPasswordEncoder` comes to rescue here. It figures out the correct password encoding algorithm by reading the prefix and performs the corresponding encoding and decoding operations.
:::

Note that the same `PasswordEncoder` is used by `UserRegistrationController` to encode the password of a new user.

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

`SECRET_KEY` is a randomly-generated key using the `HS512` algorithm (there are [other algorithms](https://github.com/jwtk/jjwt#signature-algorithms-keys), as well). This key is used for signing the tokens by `generateToken` method and subsequently to read them by `parseToken` method. We've also set the tokens to expire after 10 days (through `TOKEN_EXPIRY_DURATION` constant).

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
  
On successful verification of the token, access to the application will be enabled with the help of the `doFilterInternal` method of the `CustomAuthorizationFilter`.

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

Here, the `doFilterInternal` method extracts the `Authorization` header, fetches the authentication status, and updates the `SecurityContext`. If the authentication fails, the request to the application is denied by the filter.

We need to register these filters and specify which endpoints are protected and which are accessible publicly in the `SecurityConfiguration`.

```java {12-22,32-36}
// src/main/java/dev/mflash/guides/jwtauth/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final CustomUserDetailsService userDetailsService;

  public SecurityConfiguration(CustomUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.cors().and()
        .csrf().disable()
        .authorizeRequests()
        .antMatchers(PUBLIC_ENDPOINT_URL).permitAll()
        .antMatchers(POST, REGISTRATION_URL).permitAll()
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
- allowed the user registration endpoint and an endpoint from `GenericController` to be accessible publicly, and restricted all other URLs to be accessible only after authentication.
- disabled the session management of Spring Security by setting the `SessionCreationPolicy` to be `STATELESS` since JWT authentication is stateless.

Let's create a sample endpoint in `GenericController` that is secured with this implementation.

```java {6,12-14,23}
// src/main/java/dev/mflash/guides/jwtauth/controller/GenericController.java

public @Controller class GenericController {

  public static final String PUBLIC_ENDPOINT_URL = "/jwt/public";
  public static final String PRIVATE_ENDPOINT_URL = "/jwt/private";

  private ServerResponse publicEndpoint(ServerRequest request) {
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(messageMap("public"));
  }

  private ServerResponse privateEndpoint(ServerRequest request) {
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(messageMap("private"));
  }

  private Map<String, String> messageMap(String type) {
    return Map.of("message", String.format("Hello, world! This is a %s endpoint", type));
  }

  public @Bean RouterFunction<ServerResponse> genericRoutes() {
    return route()
        .GET(PUBLIC_ENDPOINT_URL, this::publicEndpoint)
        .GET(PRIVATE_ENDPOINT_URL, this::privateEndpoint)
        .build();
  }
}
```

## Testing the application

Launch the application, and try to hit the <http://localhost:8080/jwt/private> endpoint.

```sh
$ http :8080/jwt/private
HTTP/1.1 403
# other headers
{
    "error": "Forbidden",
    "message": "",
    "path": "/jwt/private",
    "status": 403,
    "timestamp": "2020-11-05T11:32:30.771+00:00"
}
```

The response `403 Forbidden` is expected, since this endpoint is no longer accessible publicly. Now, register as a new user.

```sh
$ http POST :8080/user/register name='Arya Antrix' email=arya.antrix@example.com password=pa55word
HTTP/1.1 200
# other headers
{
    "message": "Registration successful for Arya Antrix"
}
```

and login with this user.

```sh
$ http POST :8080/login email=arya.antrix@example.com password=pa55word
HTTP/1.1 200
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhcnlhLmFudHJpeEBleGFtcGxlLmNvbSIsImV4cCI6MTYwNTQ0NjUyNn0.lxeHhzdaDxa_PEF3zzhIsft6M3qexjJA2CyrPzAFrAZOP7zgP1slec5w41v08R_9LC7Bnbb7loIwNGn5GlVohg
# other headers
```

You'll receive a response `200 OK` with an `Authorization` header that contains a `Bearer` token. Use this token and hit the <http://localhost:8080/jwt/private> endpoint, again. This time, you'll get a successful response.

```sh {1}
$ http :8080/jwt/private 'Authorization:Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhcnlhLmFudHJpeEBleGFtcGxlLmNvbSIsImV4cCI6MTYwNTQ0NjUyNn0.lxeHhzdaDxa_PEF3zzhIsft6M3qexjJA2CyrPzAFrAZOP7zgP1slec5w41v08R_9LC7Bnbb7loIwNGn5GlVohg'
HTTP/1.1 200
# other headers
{
    "message": "Hello, world! This is a private endpoint"
}
```

You can use the above scenarios to write some unit tests (using Spring's [`MockMvc`](https://spring.io/guides/gs/testing-web/) and [AssertJ](https://assertj.github.io/doc/) assertions).

```java
// src/test/java/dev/mflash/guides/jwtauth/controller/GenericControllerTest.java

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class GenericControllerTest {

  private @Autowired MockMvc mvc;

  @Test
  @DisplayName("Should be able to access public endpoint without auth")
  void shouldBeAbleToAccessPublicEndpointWithoutAuth() throws Exception {
    MockHttpServletResponse response = mvc.perform(get(PUBLIC_ENDPOINT_URL))
        .andExpect(status().isOk())
        .andReturn().getResponse();

    assertThat(response.getContentAsString()).isNotEmpty();
  }

  @Test
  @DisplayName("Should get forbidden on private endpoint without auth")
  void shouldGetForbiddenOnPrivateEndpointWithoutAuth() throws Exception {
    mvc.perform(get(PRIVATE_ENDPOINT_URL))
        .andExpect(status().isForbidden())
        .andReturn();
  }

  @Test
  @DisplayName("Should be able to access private endpoint with auth")
  @WithMockUser(username = "jwtUser")
  void shouldBeAbleToAccessPrivateEndpointWithAuth() throws Exception {
    MockHttpServletResponse response = mvc.perform(get(PRIVATE_ENDPOINT_URL))
        .andExpect(status().isOk())
        .andReturn().getResponse();

    assertThat(response.getContentAsString()).isNotEmpty();
  }
}
```

Here,

- the first test verifies that the public endpoint is accessible without any authentication
- the second test verifies that the application returns a proper error status (403 Forbidden) when the private endpoint receives a request without any authentication, and
- the final test verifies that once a user has been authenticated successfully, they're able to access the private endpoint.

---

**Source code**

- [spring-security-jwt-auth](https://github.com/Microflash/guides/tree/main/spring/spring-security-jwt-auth)

**Related**

- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [Verify Access Tokens for Custom APIs](https://auth0.com/docs/api-auth/tutorials/verify-access-token)
- [Database Initialization](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto-database-initialization)
