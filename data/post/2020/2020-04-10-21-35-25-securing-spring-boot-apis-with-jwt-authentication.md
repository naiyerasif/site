---
slug: "2020/04/10/securing-spring-boot-apis-with-jwt-authentication"
title: "Securing Spring Boot APIs with JWT Authentication"
description: "Implement stateless authentication with JWTs in Spring Security, customize user management, and add support for alternative signing algorithms."
date: 2020-04-10 21:35:25
update: 2025-07-13 15:00:40
type: "guide"
---

JSON Web Token (JWT) is an [open standard](https://datatracker.ietf.org/doc/html/rfc7519) to send information (known as _claims_) as a JSON object. When digitally signed using a secret key or a public/private key pair, the recipient can verify and trust the claims.

JWTs are compact and self-contained, making them well-suited for authentication and authorization. It's no surprise that industry standards like OAuth 2.0 and OpenID Connect (OIDC) use them to send identity and access information across systems.

JWT-based authentication typically begins with a login using credentials (such as a username and password). The application verifies them against the information stored in a database or an Identity and Access Management (IAM) system. If the login is successful, the server issues a JWT and sends it to the client. To access protected endpoints, the client includes this token in the Authorization header. The server then validates the token before allowing access.

:::figure{.popout.popout-image}
![Private endpoint access without authentication: Client to Server: GET /private. Server: Verify JWT (failed). Server to Client: 401 Unauthorized. Login with credentials: Client to Server: POST /token with Authorization: Basic base64 of username and password. Server: Verify credentials (success). Server: Generate JWT. Server to Client: 200 OK: token. Client: Store token. Private endpoint access with authentication: Client to Server: GET /private with Authorization: Bearer token. Server: Verify JWT (success). Server to Client: 200 OK: private data. Done.](./images/2020-04-10-21-35-25-securing-spring-boot-apis-with-jwt-authentication-01.svg)

::caption[JWT-based authentication sequence]
:::

Let's implement this flow using Spring Boot and Spring Security.

:::note{.setup}
The examples in this post use

- Spring Boot 3.5.0
- Java JWT 0.12.6
- Java 21
- Maven 3.9.10
:::

## JWT-based authentication flow

Create a Maven project using the following `pom.xml`.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.5.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>spring-security-jwt-auth</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>21</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-configuration-processor</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
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

### Implementing the endpoints

Let's implement two endpoints:

- `/public` will be accessible without authentication and return a generic greeting
- `/private` will be accessible only to authenticated users. It will return a personalized greeting that includes the name of the logged-in user.

```java
package com.example.jwt.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {

	public static final String PUBLIC_ENDPOINT = "/public";
	public static final String PRIVATE_ENDPOINT = "/private";

	@GetMapping(PUBLIC_ENDPOINT)
	public String greetPublic() {
		return "Hello, World!";
	}

	@GetMapping(PRIVATE_ENDPOINT)
	public String greetPrivate(Authentication authentication) {
		return "Hello, " + authentication.getName() + "!";
	}
}
```

### Configuring public/private key pair

To sign the JWT, we'll use an [RSA](https://en.wikipedia.org/wiki/RSA_cryptosystem) public/private key pair. First, generate the keys by running the following utility.

```java
package com.example.jwt;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;

public class RSAKeyGenerator {

	static final KeyPairGenerator KEY_PAIR_GENERATOR;
	static final PEMEncoder PEM_ENCODER = PEMEncoder.of();

	static {
		try {
			KEY_PAIR_GENERATOR = KeyPairGenerator.getInstance("RSA");
			KEY_PAIR_GENERATOR.initialize(2048);
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e);
		}
	}

	public static void main(String[] args) throws IOException {
		var keyPair = KEY_PAIR_GENERATOR.generateKeyPair();
		writeKeyPair(keyPair, Paths.get("src/main/resources"));
	}

	static void writeKeyPair(KeyPair keyPair, Path parent) throws IOException {
		var publicKeyPath = Paths.get(parent.toString(), "public.pem");
		Files.writeString(publicKeyPath, PEM_ENCODER.encodeToString(keyPair.getPublic()));
		var privateKeyPath = Paths.get(parent.toString(), "private.pem");
		Files.writeString(privateKeyPath, PEM_ENCODER.encodeToString(keyPair.getPrivate()));
	}
}
```

In `RSAKeyGenerator` utility,

- we initialize a 2048-bit RSA `KeyPairGenerator`. The `main` method uses it to create an RSA key pair.
- the `writeKeyPair` method writes the public and private keys in the corresponding `public.pem` and `private.pem` files under the specified directory (it is `src/main/resources` here).

We're using the following implementation of `PEMENcoder` to convert the keys to [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format.

```java
package com.example.jwt;

import java.security.Key;
import java.security.PublicKey;
import java.util.Base64;

public final class PEMEncoder {

	private PEMEncoder() {}

	public static PEMEncoder of() {
		return new PEMEncoder();
	}

	public String encodeToString(Key key) {
		var marker = key instanceof PublicKey ? "PUBLIC KEY" : "PRIVATE KEY";
		String base64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(key.getEncoded());
		return "-----BEGIN " + marker + "-----\n" + base64 + "\n-----END " + marker + "-----";
	}
}
```

Alternatively, you can use [`openssl`](https://openssl-library.org/) to generate the keys.

```sh
openssl genpkey -algorithm rsa -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl pkey -in private.pem -pubout -out public.pem
```

To sign the tokens, the application needs access to the generated RSA keys. Specify the paths to the `.pem` files in the `src/main/resources/application.yml` configuration file.

```yml
jwt:
  private-key: classpath:private.pem
  public-key: classpath:public.pem
```

Next, use Spring's configuration processor to automatically parse the RSA public and private keys. Additionally, configure the token expiration duration to 1 hour (3600 seconds) as default.

```java
package com.example.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@ConfigurationProperties("jwt")
public record JwtProperties(
		RSAPublicKey publicKey,
		RSAPrivateKey privateKey,
		@DefaultValue("3600") long expiry) {
}
```

Enable this configuration in the application launcher.

```java {8}
package com.example.jwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class Launcher {

	public static void main(String[] args) {
		SpringApplication.run(Launcher.class, args);
	}
}
```

### Configuring the JWT encoder and decoder

With the prerequisites in place, let's proceed to configure Spring Security as follows.

```java
package com.example.jwt;

import com.example.jwt.web.GreetingController;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {

	private final JwtProperties jwtProperties;

	SecurityConfiguration(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.GET, GreetingController.PUBLIC_ENDPOINT).permitAll()
						.anyRequest().authenticated()
				)
				.csrf((csrf) -> csrf.ignoringRequestMatchers("/token"))
				.httpBasic(Customizer.withDefaults())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling((exceptions) -> exceptions
						.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
						.accessDeniedHandler(new BearerTokenAccessDeniedHandler())
				);
		return http.build();
	}

	@Bean
	UserDetailsService users() {
		return new InMemoryUserDetailsManager(
				User.withUsername("user")
						.password("{noop}password")
						.authorities("app")
						.build()
		);
	}

	@Bean
	JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withPublicKey(jwtProperties.publicKey()).build();
	}

	@Bean
	JwtEncoder jwtEncoder() {
		JWK jwk = new RSAKey.Builder(jwtProperties.publicKey()).privateKey(jwtProperties.privateKey()).build();
		JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
		return new NimbusJwtEncoder(jwks);
	}
}
```

Let's walk through what this configuration is doing.

- We inject the `JwtProperties` containing the RSA public and private keys. We use the public key to configure the `JwtDecoder` bean for validating and parsing the incoming tokens. Further, we convert the key pair to a [JSON Web Key](https://datatracker.ietf.org/doc/html/rfc7517) (JWK) and wrap it in a JWK Set, which we use to initialize the `JwtEncoder` bean for generating signed tokens. Spring Security picks up these beans with the default OAuth 2.0 resource server configuration provided through `oauth2 -> oauth2.jwt(Customizer.withDefaults())`.
- We configure the `/public` endpoint to be accessible without authentication; all other endpoints will require authentication.
- We also disable [CSRF](https://owasp.org/www-community/attacks/csrf) protection for the `/token` endpoint, which issues new tokens, since this interaction is entirely stateless and does not rely on cookies or sessions.
- Since this application only exposes REST APIs, we disable session creation by setting the session management policy to `STATELESS`.
- To return appropriate 401 and 403 responses, we configure the error handling through Spring's BearerToken exception handlers.
- We also configure a `UserDetailsService` with a single in-memory user. Spring uses `PasswordEncoder` prefixes to interpret the password formats. If we don't specify a prefix or configure a default encoder, Spring throws an exception at runtime. Prefixing the password with `{noop}` supresses this exception. It also tells Spring to treat this password as plaintext.

	:::deter
	This `UserDetailsService` implementation is **not secure** and should be used only for testing and demonstration purposes.
	:::

### Implementing the token endpoint

Now, let's implement the `/token` endpoint that issues new tokens.

```java
package com.example.jwt.web;

import com.example.jwt.JwtProperties;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.stream.Collectors;

@RestController
public record TokenController(JwtProperties jwtProperties, JwtEncoder jwtEncoder) {

	public static final String TOKEN_ENDPOINT = "/token";

	@PostMapping(TOKEN_ENDPOINT)
	public String token(Authentication authentication) {
		Instant now = Instant.now();
		String scope = authentication.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(" "));
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("self")
				.issuedAt(now)
				.expiresAt(now.plusSeconds(jwtProperties.expiry()))
				.subject(authentication.getName())
				.claim("scope", scope)
				.build();
		return this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
	}
}
```

To generate a token, we first define a set of claims using `JwtClaimsSet`. In this case, we include authenticated user's name, token issuance and expiration times, and so on. We then use the `JwtEncoder` bean, which we configured earlier, to encode and sign the claims into a JWT.

### Testing the application

Launch the application and use the following commands to test the authentication flow.

```sh prompt{2,6,10} output{3,7,11}
# access private endpoint without authentication
curl localhost:8080/private -v
< HTTP/1.1 401

# generate a new token
curl -X POST localhost:8080/token -u user:password
eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoidXNlciIsImV4cCI6MTc1MDQyNTE4MSwiaWF0IjoxNzUwNDIxNTgxLCJzY29wZSI6ImFwcCJ9.pAl3hp3OpP5WV9LgwpuA-lNzCjxT300Vkp0VI-XfTJet9IuZgOEQiHR2s07my-6DNjvN18K4zHWPypQRhTbCe54N0v33KQtvBf8x1E8d_YQVEHhtPRGa_wna4eVHESEeL4p8DC1kivfKDXAvhKf3LNhLRpbdjfjpD9rz8yEJ3KPKJku_jDRlD55LxVX4ywQ-4NTup_QoPyGwlUD2m_5_w3PJ70ZlpJrxTRhj_IiSHOCbRiiihKJxG9X8eQE3QVqeIRtsNgW5hcqIwEoM5h2n_qRoaCkN99VneKIyIoTLYHEE2w4XhBbRR8bhFsGal_nbkk5cnuKf_xAuQRuLNeeShw

# access private endpoint with token
curl localhost:8080/private -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoidXNlciIsImV4cCI6MTc1MDQyNTE4MSwiaWF0IjoxNzUwNDIxNTgxLCJzY29wZSI6ImFwcCJ9.pAl3hp3OpP5WV9LgwpuA-lNzCjxT300Vkp0VI-XfTJet9IuZgOEQiHR2s07my-6DNjvN18K4zHWPypQRhTbCe54N0v33KQtvBf8x1E8d_YQVEHhtPRGa_wna4eVHESEeL4p8DC1kivfKDXAvhKf3LNhLRpbdjfjpD9rz8yEJ3KPKJku_jDRlD55LxVX4ywQ-4NTup_QoPyGwlUD2m_5_w3PJ70ZlpJrxTRhj_IiSHOCbRiiihKJxG9X8eQE3QVqeIRtsNgW5hcqIwEoM5h2n_qRoaCkN99VneKIyIoTLYHEE2w4XhBbRR8bhFsGal_nbkk5cnuKf_xAuQRuLNeeShw'
Hello, user!
```

Let's write integration tests to verify different behaviors as follows.

```java
package com.example.jwt.web;

import com.example.jwt.SecurityConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ GreetingController.class, TokenController.class })
@Import(SecurityConfiguration.class)
public class GreetingControllerTest {

	@Autowired
	private MockMvc mvc;

	@Test
	@DisplayName("Should greet user on public endpoint")
	void shouldGreetUserOnPublicEndpoint() throws Exception {
		this.mvc.perform(get(GreetingController.PUBLIC_ENDPOINT))
				.andExpect(content().string("Hello, World!"));
	}

	@Test
	@DisplayName("Should greet user when authenticated")
	void shouldGreetUserWhenAuthenticated() throws Exception {
		MvcResult result = this.mvc.perform(post(TokenController.TOKEN_ENDPOINT)
						.with(httpBasic("user", "password")))
				.andExpect(status().isOk())
				.andReturn();

		String token = result.getResponse().getContentAsString();

		this.mvc.perform(get(GreetingController.PRIVATE_ENDPOINT)
						.header("Authorization", "Bearer " + token))
				.andExpect(content().string("Hello, user!"));
	}

	@Test
	@DisplayName("Should deny access when unauthenticated")
	void shouldDenyAccessWhenUnauthenticated() throws Exception {
		this.mvc.perform(get(TokenController.TOKEN_ENDPOINT))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("Should deny access for invalid token")
	void shouldDenyAccessForInvalidToken() throws Exception {
		String token = "fake.token.attempt";

		this.mvc.perform(get(GreetingController.PRIVATE_ENDPOINT)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isUnauthorized());
	}
}
```

- We start by loading the required controllers through `@WebMvcTest` and importing the `SecurityConfiguration`.
- `shouldGreetUserOnPublicEndpoint` checks if the `/public` endpoint is accessible without authentication.
- `shouldGreetUserWhenAuthenticated` verifies the complete flow of token generation and access to the `/private` endpoint.
- `shouldDenyAccessWhenUnauthenticated` checks if the token generation fails in absence of credentials.
- `shouldDenyAccessForInvalidToken` validates that access is denied for invalid token.

## Verifying credentials using a database

Let's try a more realistic scenario where user details are stored in a database. In this case, the application should authenticate users by validating their credentials against records in the database before issuing the token.

To start, update the `pom.xml` to include the dependencies for Spring Data JDBC and H2 in-memory database.

```xml title="pom.xml" ins{32..40}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.5.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>spring-security-jwt-auth</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>21</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
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
			<artifactId>spring-boot-configuration-processor</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
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

Add the database configuration in the `application.yml` file.

```yml title="application.yml" ins{5,6}
jwt:
  private-key: classpath:private.pem
  public-key: classpath:public.pem

spring.datasource:
  url: jdbc:h2:mem:sa
```

Spring Security uses a `UserDetailsService` to load user-specific data during the authentication process. To integrate with a custom database, we can implement a custom `UserDetailsService` to load user details.

### Implementing a custom `UserDetailsService`

Say, we have a `custom_user` table that stores usernames and passwords.

```sql title="data.sql"
create table if not exists custom_user (
	id uuid default random_uuid() primary key,
	username varchar(50) not null unique,
	password varchar(500) not null
);
```

:::commend
Put this SQL statement in `src/main/resources/data.sql` and Spring Boot will automatically use it during application startup as part of the [database initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-basic-sql-scripts) process.
:::

Let's define a `CustomUser` record to map the entries from the `custom_user` table.

```java
package com.example.jwt.userdetails;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import org.springframework.data.annotation.Id;

import java.util.UUID;

@JsonIgnoreProperties(value = { "id" })
public record CustomUser(@Id UUID id, String username, @JsonProperty(access = Access.WRITE_ONLY) String password) {

	public CustomUser(String username, String password) {
		this(null, username, password);
	}
}
```

Next, create a `Repository` to read the data from the database.

```java
package com.example.jwt.userdetails;

import org.springframework.data.repository.CrudRepository;

public interface CustomUserRepository extends CrudRepository<CustomUser, String> {

	CustomUser findByUsername(String username);
}
```

Finally, implement a custom `UserDetailsService` as follows.

```java
package com.example.jwt.userdetails;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
public record CustomUserDetailsService(CustomUserRepository userRepository) implements UserDetailsService {

	private static final PasswordEncoder PASSWORD_ENCODER = PasswordEncoderFactories.createDelegatingPasswordEncoder();

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		CustomUser customUser = this.userRepository.findByUsername(username);
		if (customUser == null) {
			throw new UsernameNotFoundException("username " + username + " is not found");
		}
		return new CustomUserDetails(customUser);
	}

	public void saveUser(CustomUser newUser) {
		this.userRepository.save(new CustomUser(newUser.username(), PASSWORD_ENCODER.encode(newUser.password())));
	}

	record CustomUserDetails(CustomUser customUser) implements UserDetails {

		private static final List<GrantedAuthority> ROLE_USER = Collections
				.unmodifiableList(AuthorityUtils.createAuthorityList("ROLE_USER"));

		@Override
		public Collection<? extends GrantedAuthority> getAuthorities() {
			return ROLE_USER;
		}

		@Override
		public String getPassword() {
			return customUser.password();
		}

		@Override
		public String getUsername() {
			return customUser.username();
		}
	}
}
```

- We use a `CustomUserDetails` record to map the `CustomUser` as a `UserDetails` object. This allows us to implement the `loadUserByUsername` method which Spring Security calls during authentication to validate user credentials.
- We also define a `saveUser` method to persist new user records in the database. Note that we don't store passwords in plaintext; they're encoded by a `PasswordEncoder`.

### Configuring user registration endpoint

To support user registration, let's expose a `/user` endpoint as follows.

```java
package com.example.jwt.web;

import com.example.jwt.userdetails.CustomUser;
import com.example.jwt.userdetails.CustomUserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public record UserController(CustomUserDetailsService customUserDetailsService) {

	public static final String USER_ENDPOINT = "/user";

	@PostMapping(USER_ENDPOINT)
	public String register(@RequestBody CustomUser newUser) {
		customUserDetailsService.saveUser(newUser);
		return "User '%s' registered successfully".formatted(newUser.username());
	}
}
```

We're using the `CustomUserDetailsService.saveUser` method here to save the user details in the database.

### Updating the security configuration

Now that we've integrated database-backed user management, we can remove the `InMemoryUserDetailsManager` bean from the security configuration. Additionally, we need to make the user registration endpoint publicly accessible so that new users can create an account without authentication. Since this endpoint is completely stateless, we can disable the CSRF protection for it.


```java ins{5,43,46} del{18,19,26,57..65}
package com.example.jwt;

import com.example.jwt.web.GreetingController;
import com.example.jwt.web.TokenController;
import com.example.jwt.web.UserController;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {

	private final JwtProperties jwtProperties;

	SecurityConfiguration(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.GET, GreetingController.PUBLIC_ENDPOINT).permitAll()
						.requestMatchers(UserController.USER_ENDPOINT).permitAll()
						.anyRequest().authenticated()
				)
				.csrf((csrf) -> csrf.ignoringRequestMatchers(TokenController.TOKEN_ENDPOINT, UserController.USER_ENDPOINT))
				.httpBasic(Customizer.withDefaults())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling((exceptions) -> exceptions
						.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
						.accessDeniedHandler(new BearerTokenAccessDeniedHandler())
				);
		return http.build();
	}

	@Bean
	UserDetailsService users() {
		return new InMemoryUserDetailsManager(
				User.withUsername("user")
						.password("{noop}password")
						.authorities("app")
						.build()
		);
	}

	@Bean
	JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withPublicKey(jwtProperties.publicKey()).build();
	}

	@Bean
	JwtEncoder jwtEncoder() {
		JWK jwk = new RSAKey.Builder(jwtProperties.publicKey()).privateKey(jwtProperties.privateKey()).build();
		JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
		return new NimbusJwtEncoder(jwks);
	}
}
```

### Testing the application

Launch the application and use the following commands to test the changes.

```sh prompt{2,6,10,14} output{3,7,11,15}
# access private endpoint without authentication
curl localhost:8080/private -v
< HTTP/1.1 401

# register a new user
curl localhost:8080/user -d '{"username": "victoria", "password": "roth"}' -H "Content-Type: application/json"
User 'victoria' registered successfully

# generate a new token
curl -X POST localhost:8080/token -u victoria:roth
eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoidmljdG9yaWEiLCJleHAiOjE3NTA0NDI0MDQsImlhdCI6MTc1MDQzODgwNCwic2NvcGUiOiJST0xFX1VTRVIifQ.iviW7HrK_VhUetpUYSxQnFJ5IrOTngE9e8JGGLZGK_F5ZGsj_oVO9GakNp2-qPSr3iPEScj8XNDlDG0WvA-Qr_QtZXsTX1BwtH4ocy0YhJvPofRGHi3j4Wj_MfGk0UVrv9gawZu684UflqsounsEgdI-CelwQeYKIUqaaXnFyqt5D9swdS8VbPrYFkxu1CWDtkVRzx7Zf1iutLN6jHxD7jaDsFf2arE3ojuoP4UB1tGhGdzLUoEN9mhR7Q6aJfrgTN7RhY7szbuY67QD-_q3AH5g8TK1JWpHNsg33QfIDZKgdnNPJg_nMm-xFDHAnVSoN_amm09b3xQWxJ3vl-G95g

# access private endpoint with token
curl localhost:8080/private -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoidmljdG9yaWEiLCJleHAiOjE3NTA0NDI0MDQsImlhdCI6MTc1MDQzODgwNCwic2NvcGUiOiJST0xFX1VTRVIifQ.iviW7HrK_VhUetpUYSxQnFJ5IrOTngE9e8JGGLZGK_F5ZGsj_oVO9GakNp2-qPSr3iPEScj8XNDlDG0WvA-Qr_QtZXsTX1BwtH4ocy0YhJvPofRGHi3j4Wj_MfGk0UVrv9gawZu684UflqsounsEgdI-CelwQeYKIUqaaXnFyqt5D9swdS8VbPrYFkxu1CWDtkVRzx7Zf1iutLN6jHxD7jaDsFf2arE3ojuoP4UB1tGhGdzLUoEN9mhR7Q6aJfrgTN7RhY7szbuY67QD-_q3AH5g8TK1JWpHNsg33QfIDZKgdnNPJg_nMm-xFDHAnVSoN_amm09b3xQWxJ3vl-G95g'
Hello, victoria!
```


Let's also update the integration tests.

```java ins{9..11,23,24,40..53,57,66} del{3,7,8,21,22,56,65}
package com.example.jwt.web;

import com.example.jwt.SecurityConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ GreetingController.class, TokenController.class })
@Import(SecurityConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
public class GreetingControllerTest {

	@Autowired
	private MockMvc mvc;

	@Test
	@DisplayName("Should greet user on public endpoint")
	void shouldGreetUserOnPublicEndpoint() throws Exception {
		this.mvc.perform(get(GreetingController.PUBLIC_ENDPOINT))
				.andExpect(content().string("Hello, World!"));
	}

	@Test
	@DisplayName("Should greet user when authenticated")
	void shouldGreetUserWhenAuthenticated() throws Exception {
		String username = "victoria";
		String password = "secret";
		String userRegistrationRequest = /* language=json */ """
				{
				  "username": "%s",
				  "password": "%s"
				}
				""".formatted(username, password);

		this.mvc.perform(post(UserController.USER_ENDPOINT)
						.contentType(MediaType.APPLICATION_JSON)
						.content(userRegistrationRequest))
				.andExpect(status().isOk())
				.andReturn();

		MvcResult result = this.mvc.perform(post(TokenController.TOKEN_ENDPOINT)
						.with(httpBasic("user", "password")))
						.with(httpBasic(username, password)))
				.andExpect(status().isOk())
				.andReturn();

		String token = result.getResponse().getContentAsString();

		this.mvc.perform(get(GreetingController.PRIVATE_ENDPOINT)
						.header("Authorization", "Bearer " + token))
				.andExpect(content().string("Hello, user!"));
				.andExpect(content().string("Hello, victoria!"));
	}

	@Test
	@DisplayName("Should deny access when unauthenticated")
	void shouldDenyAccessWhenUnauthenticated() throws Exception {
		this.mvc.perform(get(TokenController.TOKEN_ENDPOINT))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("Should deny access for invalid token")
	void shouldDenyAccessForInvalidToken() throws Exception {
		String token = "fake.token.attempt";

		this.mvc.perform(get(GreetingController.PRIVATE_ENDPOINT)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isUnauthorized());
	}
}
```

Note that we can no longer use `@WebMvcTest` since our tests rely on the database layer as well. At this point, it is more appropriate to use `@SpringBootTest` along with `@AutoConfigureMockMvc` to start the full application context, and test credential verification and token issuance for accessing the `/private` endpoint.

## Customizing signature algorithm

Depending on your requirement, you may want to use a different signature algorithm, such as [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm), instead of RSA to sign the JWTs. Since [ECDSA is not supported](https://bitbucket.org/connect2id/nimbus-jose-jwt/issues/555/support-for-ed25519-verifier-into) by Spring Boot out of the box, it requires custom implementation. Let's see how we can do that.

To get started, we need a Java library that supports ECDSA, such as `jjwt`. Let's add its dependencies in the `pom.xml`.

```xml title="pom.xml" ins{20,32..48}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.5.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>spring-security-jwt-auth</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>21</java.version>
		<jjwt.version>0.12.6</jjwt.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-api</artifactId>
			<version>${jjwt.version}</version>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-impl</artifactId>
			<version>${jjwt.version}</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-jackson</artifactId>
			<version>${jjwt.version}</version>
			<scope>runtime</scope>
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
			<artifactId>spring-boot-configuration-processor</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
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

### Configuring public/private ECDSA key pair

First, generate the keys by running the following `EdDSAKeyGenerator` utility.

```java {16}
package com.example.jwt;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;

public class EdDSAKeyGenerator {

	static final KeyPairGenerator KEY_PAIR_GENERATOR;
	static final PEMEncoder PEM_ENCODER = PEMEncoder.of();

	static {
		try {
			KEY_PAIR_GENERATOR = KeyPairGenerator.getInstance("Ed25519");
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e);
		}
	}

	public static void main(String[] args) throws IOException {
		var keyPair = KEY_PAIR_GENERATOR.generateKeyPair();
		writeKeyPair(keyPair, Paths.get("src/main/resources"));
	}

	static void writeKeyPair(KeyPair keyPair, Path parent) throws IOException {
		var publicKeyPath = Paths.get(parent.toString(), "public.pem");
		Files.writeString(publicKeyPath, PEM_ENCODER.encodeToString(keyPair.getPublic()));
		var privateKeyPath = Paths.get(parent.toString(), "private.pem");
		Files.writeString(privateKeyPath, PEM_ENCODER.encodeToString(keyPair.getPrivate()));
	}
}
```

This utility is identical to `RSAKeyGenerator` utility we used earlier to generate RSA key pair, except for the algorithm name.

Alternatively, you can use `openssl` to generate the keys.

```sh
openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
```

Spring does not support loading the ECDSA key pair out of box. We'll have to implement a utility to read the keys from the PEM files, as follows.

```java
package com.example.jwt;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.EdECPrivateKey;
import java.security.interfaces.EdECPublicKey;
import java.security.spec.InvalidKeySpecException;

public class EdDSAKeyReader {

	static final PEMDecoder PEM_DECODER;

	static {
		try {
			PEM_DECODER = PEMDecoder.withFactory(KeyFactory.getInstance("Ed25519"));
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e);
		}
	}

	public static EdECPublicKey publicKey(String pem) {
		try {
			return PEM_DECODER.decode(pem, EdECPublicKey.class);
		} catch (InvalidKeySpecException e) {
			throw new RuntimeException(e);
		}
	}

	public static EdECPrivateKey privateKey(String pem) {
		try {
			return PEM_DECODER.decode(pem, EdECPrivateKey.class);
		} catch (InvalidKeySpecException e) {
			throw new RuntimeException(e);
		}
	}
}
```

Note that `EdDSAKeyReader` is not doing much on its own; it just initializes the `PEMDecoder` with a `KeyFactory` that supports ECDSA algorithm. `PEMDecoder` uses an appropriate `EncodedKeySpec` to load the keys and cast them to expected types.

```java
package com.example.jwt;

import java.security.Key;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class PEMDecoder {

	private final KeyFactory keyFactory;

	private PEMDecoder(KeyFactory keyFactory) {
		this.keyFactory = keyFactory;
	}

	public static PEMDecoder withFactory(KeyFactory keyFactory) {
		return new PEMDecoder(keyFactory);
	}

	public <K extends Key> K decode(String str, Class<K> keyClazz) throws InvalidKeySpecException {
		var isPublicKey = PublicKey.class.isAssignableFrom(keyClazz);
		var marker = isPublicKey ? "PUBLIC KEY" : "PRIVATE KEY";
		String base64 = str
				.replaceAll("-----BEGIN " + marker + "-----", "")
				.replaceAll("-----END " + marker + "-----", "")
				.replaceAll("\\s", "");
		var key = Base64.getDecoder().decode(base64);
		return (K) (
				isPublicKey ?
					keyFactory.generatePublic(new X509EncodedKeySpec(key)) :
					keyFactory.generatePrivate(new PKCS8EncodedKeySpec(key))
		);
	}
}
```

We can now use Spring Configuration Processor to load an ECDSA key pair as follows.

```java {26,27}
package com.example.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.interfaces.EdECPrivateKey;
import java.security.interfaces.EdECPublicKey;
import java.util.Set;

@ConfigurationProperties("jwt")
public final class JwtProperties {
	static final Set<String> REGISTERED_NAMES = Set.of("iss", "sub", "aud", "exp", "nbf", "iat", "jti");

	private final EdECPublicKey publicKey;
	private final EdECPrivateKey privateKey;
	private final long expiry;

	@ConstructorBinding
	public JwtProperties(Path publicKey, Path privateKey, @DefaultValue("3600") long expiry) throws IOException {
		var pub = Files.readString(publicKey);
		var priv = Files.readString(privateKey);
		this.publicKey = EdDSAKeyReader.publicKey(pub);
		this.privateKey = EdDSAKeyReader.privateKey(priv);
		this.expiry = expiry;
	}

	public EdECPublicKey publicKey() {
		return this.publicKey;
	}

	public EdECPrivateKey privateKey() {
		return this.privateKey;
	}

	public long expiry() {
		return this.expiry;
	}
}
```

Note that we've also declared a set called `REGISTERED_NAMES`. These are the names of standard JWT claims that we'll use later to encode and decode the JWTs signed by the keys we've just configured.

### Implementing custom ECDSA JWT encoder

To issue a JWT signed with ECDSA, let's implement a custom encoder as follows.

```java
package com.example.jwt;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Jwk;
import io.jsonwebtoken.security.JwkSet;
import org.springframework.security.oauth2.jose.jws.JwsAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.security.Key;
import java.security.PublicKey;
import java.time.Instant;
import java.util.*;

public record CustomJwtEncoder(JwkSet jwkSet, JwsAlgorithm defaultAlgorithm) implements JwtEncoder {

	public CustomJwtEncoder(JwkSet jwkSet) {
		this(jwkSet, CustomJwsAlgorithm.EdDSA);
	}

	enum CustomJwsAlgorithm implements JwsAlgorithm {
		RSA("RSA"),
		EdDSA("EdDSA");

		private final String name;

		CustomJwsAlgorithm(String name) {
			this.name = name;
		}

		@Override
		public String getName() {
			return this.name;
		}
	}

	@Override
	public Jwt encode(JwtEncoderParameters parameters) throws JwtEncodingException {
		try {
			JwsHeader headers = Objects.requireNonNullElse(parameters.getJwsHeader(), JwsHeader.with(defaultAlgorithm).build());
			JwtClaimsSet claims = parameters.getClaims();
			Key signingKey = this.jwkSet.getKeys().stream()
					.filter(jwk -> jwk.getAlgorithm().equals(headers.getAlgorithm().getName()))
					.findAny()
					.map(Jwk::toKey)
					.orElseThrow();
			var jws = convert(claims, signingKey);
			return new Jwt(jws, claims.getIssuedAt(), claims.getExpiresAt(), headers.getHeaders(), claims.getClaims());
		} catch (Exception e) {
			throw new JwtEncodingException("Failed to encode JWT", e);
		}
	}

	private static String convert(JwtClaimsSet claims, Key signingKey) {
		if (signingKey instanceof PublicKey) {
			throw new IllegalArgumentException("Signing token with public key is not supported");
		}

		JwtBuilder builder = Jwts.builder();
		Object issuer = claims.getClaim("iss");
		if (issuer != null) {
			builder.issuer(issuer.toString());
		}

		String subject = claims.getSubject();
		if (StringUtils.hasText(subject)) {
			builder.subject(subject);
		}

		List<String> audience = claims.getAudience();
		if (!CollectionUtils.isEmpty(audience)) {
			builder.audience().add(audience);
		}

		Instant expiresAt = claims.getExpiresAt();
		if (expiresAt != null) {
			builder.expiration(Date.from(expiresAt));
		}

		Instant notBefore = claims.getNotBefore();
		if (notBefore != null) {
			builder.notBefore(Date.from(notBefore));
		}

		Instant issuedAt = claims.getIssuedAt();
		if (issuedAt != null) {
			builder.issuedAt(Date.from(issuedAt));
		}

		String jwtId = claims.getId();
		if (StringUtils.hasText(jwtId)) {
			builder.id(jwtId);
		}

		Map<String, Object> customClaims = new HashMap<>();
		claims.getClaims().forEach((name, value) -> {
			if (!JwtProperties.REGISTERED_NAMES.contains(name)) {
				customClaims.put(name, value);
			}
		});

		if (!customClaims.isEmpty()) {
			Objects.requireNonNull(builder);
			customClaims.forEach(builder::claim);
		}

		return builder.signWith(signingKey).compact();
	}
}
```

- This encoder accepts a `JwsAlgorithm`; we're setting `CustomJwsAlgorithm.EdDSA` as the default value here.
- The `encode` method accepts the encoding parameters and parses all the claims to build a JWT. Finally, it signs the JWT with the configured `JwsAlgorithm` and returns it.
- Note that we're using the `REGISTERED_NAMES` from `JwtProperties` to identify the custom claims.

### Implementing custom ECDSA JWT decoder

To verify the claims, Spring Security also needs a decoder. Let's implement a custom decoder that supports ECDSA as follows.

```java
package com.example.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.security.PublicKey;
import java.util.*;

public record CustomJwtDecoder(JwtParser parser) implements JwtDecoder {

	public CustomJwtDecoder(PublicKey publicKey) {
		this(Jwts.parser().verifyWith(publicKey).build());
	}

	@Override
	public Jwt decode(String token) throws JwtException {
		try {
			var jws = parser.parseSignedClaims(token);
			return convert(token, jws);
		} catch (Exception e) {
			throw new BadJwtException("Failed to decode token", e);
		}
	}

	private static Jwt convert(String token, Jws<Claims> jws) {
		var builder = Jwt.withTokenValue(token)
				.headers((h) -> h.putAll(jws.getHeader()));

		var claims = jws.getPayload();

		String issuer = claims.getIssuer();
		if (StringUtils.hasText(issuer)) {
			builder.issuer(issuer);
		}

		String subject = claims.getSubject();
		if (StringUtils.hasText(subject)) {
			builder.subject(subject);
		}

		Set<String> audience = claims.getAudience();
		if (!CollectionUtils.isEmpty(audience)) {
			builder.audience(audience);
		}

		Date expiresAt = claims.getExpiration();
		if (expiresAt != null) {
			builder.expiresAt(expiresAt.toInstant());
		}

		Date notBefore = claims.getNotBefore();
		if (notBefore != null) {
			builder.notBefore(notBefore.toInstant());
		}

		Date issuedAt = claims.getIssuedAt();
		if (issuedAt != null) {
			builder.issuedAt(issuedAt.toInstant());
		}

		String jwtId = claims.getId();
		if (StringUtils.hasText(jwtId)) {
			builder.jti(jwtId);
		}

		Map<String, Object> customClaims = new HashMap<>();
		claims.forEach((name, value) -> {
			if (!JwtProperties.REGISTERED_NAMES.contains(name)) {
				customClaims.put(name, value);
			}
		});

		if (!customClaims.isEmpty()) {
			Objects.requireNonNull(builder);
			customClaims.forEach(builder::claim);
		}

		return builder.build();
	}
}
```

This decoder uses the `PublicKey` to decode the token. It parses all the claims and returns the JWT. Once again, we're using the `REGISTERED_NAMES` from `JwtProperties` to identify the custom claims.

### Updating the security configuration

Now that we've implemented the encoder and decoder, let's use them in the security configuration like this.

```java ins{12,13,28..30,63,71..76} del{6..11,22,23,62,68..70}
package com.example.jwt;

import com.example.jwt.web.GreetingController;
import com.example.jwt.web.TokenController;
import com.example.jwt.web.UserController;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import io.jsonwebtoken.security.Jwks;
import io.jsonwebtoken.security.PrivateJwk;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;

import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;

@Configuration
public class SecurityConfiguration {

	private final JwtProperties jwtProperties;

	SecurityConfiguration(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.GET, GreetingController.PUBLIC_ENDPOINT).permitAll()
						.requestMatchers(UserController.USER_ENDPOINT).permitAll()
						.anyRequest().authenticated()
				)
				.csrf((csrf) -> csrf.ignoringRequestMatchers(TokenController.TOKEN_ENDPOINT, UserController.USER_ENDPOINT))
				.httpBasic(Customizer.withDefaults())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
						.accessDeniedHandler(new BearerTokenAccessDeniedHandler())
				);
		return http.build();
	}

	@Bean
	JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withPublicKey(jwtProperties.publicKey()).build();
		return new CustomJwtDecoder(jwtProperties.publicKey());
	}

	@Bean
	JwtEncoder jwtEncoder() {
		JWK jwk = new RSAKey.Builder(jwtProperties.publicKey()).privateKey(jwtProperties.privateKey()).build();
		JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
		return new NimbusJwtEncoder(jwks);
		PrivateJwk<PrivateKey, PublicKey, ?> jwk = Jwks.builder()
				.keyPair(new KeyPair(jwtProperties.publicKey(), jwtProperties.privateKey()))
				.algorithm(jwtProperties.privateKey().getAlgorithm())
				.build();
		var jwkSet = Jwks.set().add(jwk).build();
		return new CustomJwtEncoder(jwkSet);
	}
}
```

We're just replacing the previous encoder and decoder with our custom implementations. You can launch the application and [rerun the existing tests](#testing-the-application-2).

---

**Source code**

- [spring-security-jwt-auth](https://github.com/Microflash/guides/tree/main/spring/spring-security-jwt-auth)
- [spring-security-jwt-auth-custom-user](https://github.com/Microflash/guides/tree/main/spring/spring-security-jwt-auth-custom-user)
- [spring-security-jwt-auth-eddsa](https://github.com/Microflash/guides/tree/main/spring/spring-security-jwt-auth-eddsa)

**Related**

- [Introduction to JSON Web Tokens](https://jwt.io/introduction)
