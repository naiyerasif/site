---
slug: "2020/11/15/protecting-endpoints-with-spring-security-resource-server"
title: "Protecting endpoints with Spring Security Resource Server"
description: "OAuth2 is the industry standard for providing authorization. Spring Security provides an OAuth2 Resource Server starter to implement an authorization layer. Learn how to implement a service-to-service authorization flow using client-credentials grant type and audience claim."
date: "2020-11-15 11:38:57"
update: "2020-11-15 11:38:57"
category: "guide"
tags: ["spring", "security", "oauth2", "introspection"]
---

In any modern application, you'll encounter multiple services talking to each other and even communicating with third-party services to provide useful functionalities. Some of these services may expose endpoints (also called *resources*) to serve data and perform actions of varying risk, cost and criticality. Therefore, it becomes prudent to protect the endpoints to provide appropriate access to the clients to reduce the chances of misuse and security breaches. [OAuth2](https://oauth.net/2/) is the industry standard for providing authorization. Spring Security provides an [OAuth2 Resource Server](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#oauth2resourceserver) starter that we can use to implement an authorization layer.

If you're looking for an introduction on OAuth2 and OpenID Connect, please review the following video.

::youtube[Explain it to Me Like I’m 5: Oauth2 and OpenID]{#5th6CSQTdpM}

In this post, we'll discuss how to implement a service-to-service authorization flow using [client-credentials](https://oauth.net/2/grant-types/client-credentials/) grant type and [audience](https://tools.ietf.org/html/rfc7519#section-4.1.3) claim.

:::note{title='Client Credentials'}
This is a grant type when a client tries to access their own resources (rather than a user's). Such clients are implicitly trusted through a *client_id* and *client_secret*, using which they obtain an *access token*. The access token is used in the subsequent requests to access the resources. The extent of access is determined by one or more *scopes*.
:::

:::note{title='Audience claim'}
The `aud` claim is an optional claim that becomes useful when multiple clients are accessing a resource. It identifies which token is intended for which client and can be used by the application to prevent a resource access when an access token meant for one audience is sent by another or when an access token without an audience is sent by a client.
:::

We'll discuss multiple ways of validating a token through Spring Security and the scenarios where one approach makes sense over the other.

:::setup
The examples in this post use

- Java 15
- Spring Boot 2.4.0
- httpie 2.3.0
- Maven 3.6.3
:::

> [httpie](https://httpie.io/) is a user-friendly HTTP client with first-class JSON support and many other features. We'll use it to send requests to our APIs.

We'll use [Okta](https://okta.com) as the identity provider (IdP) but you can use any other provider that supports the `aud` claim and introspection.

## Okta setup

To get started with Okta, create a developer account and login to your dashboard. Open the *Application* tab and click on the *Add Application* button.

![Okta Applications screen](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-01.png)

On the *Create New Application* screen, select *Web* and press *Next*.

![Okta Create New Application platform selection screen](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-02.png)

On the next screen, provide a name for the app, scroll down till *Grant type allowed* section, and check *Client Credentials* and *Implicit (Hybrid)* options. Press *Done*.

![Okta Create New Application settings screen](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-03.png)

Open the newly created application. You should find the *Client ID* and *Client Secret* under the *General* tab. Copy these values somewhere; you'd need them later.

![Okta Application details screen](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-04.png)

Open *Authorization Servers* (available under the *API* tab). Under the *Settings* tab , you'll find the audience configured for the server and the issuer URL. Copy these values somewhere; you'd need them later.

Switch to the *Scopes* tab, and click on the *Add Scope* button. Add a scope with the name `read:messages` and check *Include in public metadata* option.

![Okta Add Scope screen](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-05.png)

Similarly, add another scope with the name `write:messages`. This finishes Okta setup.

## Generate Maven project

Generate a Maven project with the following `pom.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.4.0</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>spring-security-token-validation-hybrid</artifactId>
  <version>1.0-SNAPSHOT</version>

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
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
    <dependency>
      <groupId>com.nimbusds</groupId>
      <artifactId>oauth2-oidc-sdk</artifactId>
      <version>8.26</version>
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

Create a configuration file `application.yml` in the `src/main/resources` directory.

## Local token validation

To validate a token locally, we need to decode it and write the validation logic based on the properties of the received token. Spring Security can initialize a decoder using the URL of the `issuer` of the token. You can obtain the issuer URL from the *Authorization Servers* > *default* > *Settings* tab from the Okta dashboard. Open the `application.yml` file and configure this URL as follows.

```yml
# src/main/resources/application.yml

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://dev-4273429.okta.com/oauth2/default
```

Create a `SecurityConfiguration` class and inject a `JwtDecoder` bean.

```java
// src/main/java/dev/mflash/guides/tokenval/local/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final String issuer;

  public SecurityConfiguration(OAuth2ResourceServerProperties resourceServerProps) {
    this.issuer = resourceServerProps.getJwt().getIssuerUri();
  }

  @Bean JwtDecoder jwtDecoder() {
    var jwtDecoder = (NimbusJwtDecoder) JwtDecoders.fromOidcIssuerLocation(issuer);
    OAuth2TokenValidator<Jwt> validatorWithIssuer = JwtValidators.createDefaultWithIssuer(issuer);
    var validator = new DelegatingOAuth2TokenValidator<>(validatorWithIssuer);
    jwtDecoder.setJwtValidator(validator);
    return jwtDecoder;
  }
}
```

Here, we initialized a decoder using the issuer URL and then we added some default token validators in the decoder using the `createDefaultWithIssuer` method. This method adds

- `JwtTimestampValidator` that verifies if the token has expired, and
- `JwtIssuerValidator` that checks the `iss` claim to ascertain if the issuer configured is the same as the one that issued the incoming token.

In addition to the above validations, we can implement custom validations based on the content of the token using the `OAuth2TokenValidator` interface, e.g., checking if an `aud` claim exists.

```java
// src/main/java/dev/mflash/guides/tokenval/local/security/CustomTokenValidator.java

public class CustomTokenValidator implements OAuth2TokenValidator<Jwt> {

  private static final OAuth2Error MISSING_AUDIENCE_ERROR = new OAuth2Error("invalid_token",
      "The required audience is missing", null);

  private final String audience;

  public CustomTokenValidator(String resource) {
    this.audience = resource;
  }

  public @Override OAuth2TokenValidatorResult validate(Jwt jwt) {
    boolean hasAudience = jwt.getAudience().contains(audience);

    if (hasAudience) {
      return OAuth2TokenValidatorResult.success();
    }

    return OAuth2TokenValidatorResult.failure(MISSING_AUDIENCE_ERROR);
  }
}
```

In the `CustomTokenValidator`, we're checking the existence of a valid audience; the logic can be as intricate as your specific needs. If the validation fails, we throw an `OAuth2Error` with a relevant message.

To integrate the `CustomTokenValidator` with the `JwtDecoder` bean, we'll need a reference value of the `audience` against which we can run our validation. You can obtain the value of audience from the *Authorization Servers* > *default* > *Settings* tab from the Okta dashboard. Lets configure it in the `application.yml` file.

```yml {3-4}
# src/main/resources/application.yml

auth:
  audience: api://default

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://dev-4273429.okta.com/oauth2/default
```

Read this configuration through [Spring Configuration Processor](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-configuration-metadata.html) using the following class.

```java
// src/main/java/dev/mflash/guides/tokenval/local/security/OidcProperties.java

@ConfigurationProperties("auth")
@ConstructorBinding
public class OidcProperties {

  private final String audience;

  public OidcProperties(String audience) {
    this.audience = audience;
  }

  public String getAudience() {
    return audience;
  }
}
```

Enable the configuration processor in the application launcher as follows.

```java {3}
// src/main/java/dev/mflash/guides/tokenval/local/Launcher.java

@EnableConfigurationProperties(OidcProperties.class)
public @SpringBootApplication class Launcher {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }
}
```

Now, modify the `JwtDecoder` as follows.

```java {6,9-10,15,17-19}
// src/main/java/dev/mflash/guides/tokenval/local/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final String audience;
  private final String issuer;

  public SecurityConfiguration(OidcProperties oidcProps, OAuth2ResourceServerProperties resourceServerProps) {
    this.audience = oidcProps.getAudience();
    this.issuer = resourceServerProps.getJwt().getIssuerUri();
  }

  @Bean JwtDecoder jwtDecoder() {
    var jwtDecoder = (NimbusJwtDecoder) JwtDecoders.fromOidcIssuerLocation(issuer);
    var audienceValidator = new CustomTokenValidator(audience);
    OAuth2TokenValidator<Jwt> validatorWithIssuer = JwtValidators.createDefaultWithIssuer(issuer);
    var validatorWithAudience = new DelegatingOAuth2TokenValidator<>(validatorWithIssuer, audienceValidator);
    jwtDecoder.setJwtValidator(validatorWithAudience);
    return jwtDecoder;
  }
}
```

Note that we can pass multiple validators using the `DelegatingOAuth2TokenValidator` constructor.

### Testing the local token validation

To test this implementation, let's create some sample endpoints in a controller, say `GenericController`.

```java
// src/main/java/dev/mflash/guides/tokenval/local/GenericController.java

@RestController
@RequestMapping(GenericController.CONTEXT)
public class GenericController {

  public static final String CONTEXT = "/spring-security-oidc";
  public static final String PUBLIC_ENDPOINT = "/public";
  public static final String PRIVATE_ENDPOINT = "/private";
  public static final String PRIVATE_SCOPED_ENDPOINT = "/private-scoped";

  private static final String MSG_TEMPLATE = "Hello, world! This is a %s endpoint";

  @GetMapping(PUBLIC_ENDPOINT)
  public Map<String, String> publicEndpoint() {
    return response("public");
  }

  @GetMapping(PRIVATE_ENDPOINT)
  public Map<String, String> privateEndpoint() {
    return response("private");
  }

  @GetMapping(PRIVATE_SCOPED_ENDPOINT)
  public Map<String, String> privateScopedEndpoint() {
    return response("private scoped");
  }

  private Map<String, String> response(String type) {
    return Map.of("message", String.format(MSG_TEMPLATE, type));
  }
}
```

Here, we've exposed three endpoints, one is public `/spring-security-oidc/public`, one is private `/spring-security-oidc/private`, and the other is private `/spring-security-oidc/private-scoped` but available only for a specific scope (say, `read:messages`).

We need to configure these protection rules in the `SecurityConfiguration` as follows.

```java {14-20}
// src/main/java/dev/mflash/guides/tokenval/local/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final String audience;
  private final String issuer;

  public SecurityConfiguration(OidcProperties oidcProps, OAuth2ResourceServerProperties resourceServerProps) {
    this.audience = oidcProps.getAudience();
    this.issuer = resourceServerProps.getJwt().getIssuerUri();
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .mvcMatchers(CONTEXT + PUBLIC_ENDPOINT).permitAll()
        .mvcMatchers(CONTEXT + PRIVATE_ENDPOINT).authenticated()
        .mvcMatchers(CONTEXT + PRIVATE_SCOPED_ENDPOINT).hasAuthority("SCOPE_read:messages")
        .and().oauth2ResourceServer().jwt();
  }

  @Bean JwtDecoder jwtDecoder() {
    var jwtDecoder = (NimbusJwtDecoder) JwtDecoders.fromOidcIssuerLocation(issuer);
    var audienceValidator = new CustomTokenValidator(audience);
    OAuth2TokenValidator<Jwt> validatorWithIssuer = JwtValidators.createDefaultWithIssuer(issuer);
    var validatorWithAudience = new DelegatingOAuth2TokenValidator<>(validatorWithIssuer, audienceValidator);
    jwtDecoder.setJwtValidator(validatorWithAudience);
    return jwtDecoder;
  }
}
```

![Local token validation flow](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-06.png)

Launch the application. Open a terminal and send the following request to the public endpoint using *httpie*.

```sh
$ http :8080/spring-security-oidc/public
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a public endpoint"
}
```

Try accessing the private endpoint.

```sh
$ http :8080/spring-security-oidc/private
HTTP/1.1 401
# other headers
```

As expected, you received a `401 Unauthorized` status. Generate a token (using the [Basic Authentication scheme](https://tools.ietf.org/html/rfc7617) by passing the *client_id* and *client_secret*),

```sh
$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=write:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldpcDNYZzNQSFRSYjgwX1M0dUZPbWNSOVhVaHQxbF95TGl1QVdzOVE5SnMiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTMzOCwiZXhwIjoxNjA1MzgyOTM4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.DbVQW0lDqPWpZ8RM6FBPI4N6ey9UKb9v3oMTNMifyF9rx7hfQb8YVFGeNVHMPCkYDUfCHFQPplAo0tubVjN-Fh5xzs4y0Wai58Ju-viMGSn-lo5G5Vz8_EjH47R0OQHWz-CqFr6NPNdarKs-KK_GuFYOxoOdcCJ1rwACtKdAHz8ihG69VKncYtkfWvvIRA270Wpo7_PAtnkdAxz-LVvLIkdT9OTQOg7oFfnI7k0EJhmg9BAEzWWmxprzVgfCTSLsCBz5nfHtQdv8aD3AauvY61s0M59rMRCO37P7EN7Fd1HRN0klYm-QycVYxYpXIAVbw5KDPWtKEs0rz-mpS_y9KQ",
  "expires_in": 3600,
  "scope": "write:messages",
  "token_type": "Bearer"
}
```

and use this token in the request to the private endpoint. You'll be able to access the endpoint this time.

```sh
$ http :8080/spring-security-oidc/private 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldpcDNYZzNQSFRSYjgwX1M0dUZPbWNSOVhVaHQxbF95TGl1QVdzOVE5SnMiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTMzOCwiZXhwIjoxNjA1MzgyOTM4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.DbVQW0lDqPWpZ8RM6FBPI4N6ey9UKb9v3oMTNMifyF9rx7hfQb8YVFGeNVHMPCkYDUfCHFQPplAo0tubVjN-Fh5xzs4y0Wai58Ju-viMGSn-lo5G5Vz8_EjH47R0OQHWz-CqFr6NPNdarKs-KK_GuFYOxoOdcCJ1rwACtKdAHz8ihG69VKncYtkfWvvIRA270Wpo7_PAtnkdAxz-LVvLIkdT9OTQOg7oFfnI7k0EJhmg9BAEzWWmxprzVgfCTSLsCBz5nfHtQdv8aD3AauvY61s0M59rMRCO37P7EN7Fd1HRN0klYm-QycVYxYpXIAVbw5KDPWtKEs0rz-mpS_y9KQ'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private endpoint"
}
```

Let's try to access the private scoped endpoint. Note that the previous token was generated for the `write:messages` scope; it should not work for the private scoped endpoint (which requires the `read:messages` scope).

```sh
$ http :8080/spring-security-oidc/private-scoped 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldpcDNYZzNQSFRSYjgwX1M0dUZPbWNSOVhVaHQxbF95TGl1QVdzOVE5SnMiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTMzOCwiZXhwIjoxNjA1MzgyOTM4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.DbVQW0lDqPWpZ8RM6FBPI4N6ey9UKb9v3oMTNMifyF9rx7hfQb8YVFGeNVHMPCkYDUfCHFQPplAo0tubVjN-Fh5xzs4y0Wai58Ju-viMGSn-lo5G5Vz8_EjH47R0OQHWz-CqFr6NPNdarKs-KK_GuFYOxoOdcCJ1rwACtKdAHz8ihG69VKncYtkfWvvIRA270Wpo7_PAtnkdAxz-LVvLIkdT9OTQOg7oFfnI7k0EJhmg9BAEzWWmxprzVgfCTSLsCBz5nfHtQdv8aD3AauvY61s0M59rMRCO37P7EN7Fd1HRN0klYm-QycVYxYpXIAVbw5KDPWtKEs0rz-mpS_y9KQ'
HTTP/1.1 403
WWW-Authenticate: Bearer error="insufficient_scope", error_description="The request requires higher privileges than provided by the access token.", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"
# other headers
```

Generate a new token for the `read:messages` scope,

```sh
$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=read:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlctdzdUVHJsM1VRQWk0bk5wOS01YzB0ZjB1eWJmem9FZmNfU0NRSU5iN2MiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTA5NSwiZXhwIjoxNjA1MzgyNjk1LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.RIgotpHIn2UCMTXx3rl7Kin756YsXXmcCj_DmfAtoLFCVZagB-SAp6jPhL8XSWJrCcBmZXOXClmoTiljMdvH4DWo4bVAYnESEFsMLgYujD4FkkZdeXHnNWQGfpp4u9nzHUsZSo2J777rBAWn0h9dRSUkFw9Wy-z_2wVTa3etreqQlHA9VkdqeW8Re7e1EB-jRezRW2pTe8ibfcJ23oHmv4AcB2eVu0SFgSHVYM_7i5xRsr-M0ta1ajwEkD7iAA1Ye0_1qRURrWZpM0qlx2LZw33hOgkoAAPUA4UJOq0yPbvSM8d6BKxIRCObqxHcDL63VZoLPc7_Jt8ez3eXO-TLoQ",
  "expires_in": 3600,
  "scope": "read:messages",
  "token_type": "Bearer"
}
```
 
and try accessing the endpoint with this token.

```sh
$ http :8080/spring-security-oidc/private-scoped 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlctdzdUVHJsM1VRQWk0bk5wOS01YzB0ZjB1eWJmem9FZmNfU0NRSU5iN2MiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTA5NSwiZXhwIjoxNjA1MzgyNjk1LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.RIgotpHIn2UCMTXx3rl7Kin756YsXXmcCj_DmfAtoLFCVZagB-SAp6jPhL8XSWJrCcBmZXOXClmoTiljMdvH4DWo4bVAYnESEFsMLgYujD4FkkZdeXHnNWQGfpp4u9nzHUsZSo2J777rBAWn0h9dRSUkFw9Wy-z_2wVTa3etreqQlHA9VkdqeW8Re7e1EB-jRezRW2pTe8ibfcJ23oHmv4AcB2eVu0SFgSHVYM_7i5xRsr-M0ta1ajwEkD7iAA1Ye0_1qRURrWZpM0qlx2LZw33hOgkoAAPUA4UJOq0yPbvSM8d6BKxIRCObqxHcDL63VZoLPc7_Jt8ez3eXO-TLoQ'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private scoped endpoint"
}
```

Since the `scope` matched this time, you were able to access the endpoint with this token.

Using the above scenarios, you can write some tests using Spring's [`MockMvc`](https://spring.io/guides/gs/testing-web/) and [AssertJ](https://assertj.github.io/doc/) assertions.

```java
// src/test/java/dev/mflash/guides/tokenval/local/GenericControllerTest.java

@WebMvcTest(GenericController.class)
@ExtendWith(SpringExtension.class)
class GenericControllerTest {

  private @Autowired MockMvc mvc;

  @Test
  @DisplayName("Should be able to access public endpoint without auth")
  void shouldBeAbleToAccessPublicEndpointWithoutAuth() throws Exception {
    MockHttpServletResponse response = mvc.perform(
        get(CONTEXT + PUBLIC_ENDPOINT))
        .andExpect(status().isOk())
        .andReturn().getResponse();

    assertThat(response.getContentAsString()).isNotEmpty();
  }

  @Test
  @DisplayName("Should get unauthorized on private endpoint without auth")
  void shouldGetUnauthorizedOnPrivateEndpointWithoutAuth() throws Exception {
    mvc.perform(get(CONTEXT + PRIVATE_ENDPOINT))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }

  @Test
  @DisplayName("Should be able to access private endpoint with auth")
  @WithMockUser(username = "oidcUser")
  void shouldBeAbleToAccessPrivateEndpointWithAuth() throws Exception {
    MockHttpServletResponse response = mvc.perform(
        get(CONTEXT + PRIVATE_ENDPOINT))
        .andExpect(status().isOk())
        .andReturn().getResponse();

    assertThat(response.getContentAsString()).isNotEmpty();
  }

  @Test
  @DisplayName("Should get unauthorized on private scoped endpoint without auth")
  void shouldGetUnauthorizedOnPrivateScopedEndpointWithoutAuth() throws Exception {
    mvc.perform(get(CONTEXT + PRIVATE_SCOPED_ENDPOINT))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }

  @Test
  @DisplayName("Should get forbidden on private scoped endpoint without scope")
  @WithMockUser(username = "oidcUser")
  void shouldGetForbiddenOnPrivateScopedEndpointWithoutScope() throws Exception {
    mvc.perform(get(CONTEXT + PRIVATE_SCOPED_ENDPOINT))
        .andExpect(status().isForbidden())
        .andReturn();
  }

  @Test
  @DisplayName("Should be able to access private scoped endpoint with proper scope")
  @WithMockUser(username = "oidcUser", authorities = { "SCOPE_read:messages" })
  void shouldBeAbleToAccessPrivateScopedEndpointWithProperScope() throws Exception {
    MockHttpServletResponse response = mvc.perform(
        get(CONTEXT + PRIVATE_SCOPED_ENDPOINT))
        .andExpect(status().isOk())
        .andReturn().getResponse();

    assertThat(response.getContentAsString()).isNotEmpty();
  }

  @Test
  @DisplayName("Should get forbidden on private scoped endpoint without proper scope")
  @WithMockUser(username = "oidcUser", authorities = { "SCOPE_write:messages" })
  void shouldGetForbiddenOnPrivateScopedEndpointWithoutProperScope() throws Exception {
    mvc.perform(get(CONTEXT + PRIVATE_SCOPED_ENDPOINT))
        .andExpect(status().isForbidden())
        .andReturn();
  }
}
```

Here,
- the first test checks if the public endpoint is accessible without any token,
- the second and fourth tests verify that the private and private scoped endpoints return unauthorized when accessed without token,
- the third test verifies that the private endpoint is accessible with proper authentication,
- the fifth and seventh tests verify that the private scoped endpoint returns forbidden when accessed without a scope or with an incorrect scope, and
- the sixth test verifies that the private scoped endpoint is accessible with proper authentication and correct scope.

## Token Introspection

Any tokens that you validate locally are, by definition, stale. This is because there will always be some time difference between the instance an Authorization Server generates a token and the instance a Resource Server receives a snapshot of that token. The longer a client uses that token, the higher is the chance that it is not valid. In low-risk scenarios, you may not care much about it. However, when a client requests a sensitive resource, you may want to make absolutely sure that the accompanying token is valid. In such scenarios, you may defer the token validation to your identity provider through a process called *introspection*. 

:::note{title=Introspection}
Token introspection is a method through which an OAuth2 Authorization Server ascertains the active state of a token and determines additional information about the token (such as `client_id`, `scope`, etc). This is done by sending a POST request to a standard *introspection* endpoint along with the token.
:::

Since we don't care about the content or structure of the token being introspected, it is called an **opaque token**. Spring Security provides an optional support for the introspection of opaque tokens through the resource server. The dependency `oauth2-oidc-sdk` in `pom.xml` is required to support this feature.

To start with, open the `application.yml` file, and add the following configuration.

```yml {12-15}
# src/main/resources/application.yml

auth:
  audience: api://default

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://dev-4273429.okta.com/oauth2/default
        opaque-token:
          introspection-uri: https://dev-4273429.okta.com/oauth2/default/v1/introspect
          client-id: 0oarle1cZ7n7esoqO5d5
          client-secret: i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S
```

Implement the `OpaqueTokenIntrospector` interface to use the above configuration.

```java
// src/main/java/dev/mflash/guides/tokenval/introspection/security/CustomOpaqueTokenIntrospector.java

public class CustomOpaqueTokenIntrospector implements OpaqueTokenIntrospector {

  private final OpaqueTokenIntrospector introspector;

  public CustomOpaqueTokenIntrospector(OAuth2ResourceServerProperties resourceServerProps) {
    var opaqueTokenProps = resourceServerProps.getOpaquetoken();
    this.introspector = new NimbusOpaqueTokenIntrospector(
        opaqueTokenProps.getIntrospectionUri(),
        opaqueTokenProps.getClientId(),
        opaqueTokenProps.getClientSecret()
    );
  }

  public @Override OAuth2AuthenticatedPrincipal introspect(String token) {
    return introspector.introspect(token);
  }
}
```

Modify the `SecurityConfiguration` to use the `CustomOpaqueTokenIntrospector` as follows.

```java {11,14-16}
// src/main/java/dev/mflash/guides/tokenval/introspection/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .mvcMatchers(CONTEXT + PUBLIC_ENDPOINT).permitAll()
        .mvcMatchers(CONTEXT + PRIVATE_ENDPOINT_LOCAL).authenticated()
        .mvcMatchers(CONTEXT + PRIVATE_SCOPED_ENDPOINT_REMOTE).hasAuthority("SCOPE_read:messages")
        .and().oauth2ResourceServer().opaqueToken();
  }

  @Bean OpaqueTokenIntrospector tokenIntrospector(OAuth2ResourceServerProperties resourceServerProps) {
    return new CustomOpaqueTokenIntrospector(resourceServerProps);
  }
}
```

Note that we are now calling the `opaqueToken` method on the `oauth2ResourceServer` instead of the `jwt` method earlier.

### Testing the token introspection

![Token introspection flow](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-07.png)

Rerun the previous scenarios with *httpie* to see the introspection in action.

```sh
$ http :8080/spring-security-oidc/public
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a public endpoint"
}

$ http :8080/spring-security-oidc/private
HTTP/1.1 401
# other headers

$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=write:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkwzb0dCZ3BWQkxDNXowUzdrV1QyRlNXUWtfUk9fbm16Y0NLOWl1Z2drVG8iLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM4MjgyOCwiZXhwIjoxNjA1Mzg2NDI4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.ENCqOdVf6NWt1zq5JaPqLi7zc-LvE3ffFrCJXZXl3ORONfkU2w_aGMWGTafn4miTMZsrZJZEe4fwckNCr5rg3hOtib-ohlOy0nzAHJWTDvRYMnDx0LxUFaCM_wP5Fgh1VP4cONBOO69106vKiaKNTao6NorIHeLBeqpcTCZbTiteZ5rTIBVR5qXabLT0ALpw3JWb9U7c_hnixVj1ecP9CW4Fv1BIFysN9srESrCofMrlP4Hf2YlC19KflYdFnTvpADTn-1owTNpbPOGnipltEQgd0DIQREi5Sf53Vx_6TYGi3sIGfOI7QEM8yf7dNJhaWgCxnUh0sAlPIxzw6jmJuA",
  "expires_in": 3600,
  "scope": "write:messages",
  "token_type": "Bearer"
}

$ http :8080/spring-security-oidc/private 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkwzb0dCZ3BWQkxDNXowUzdrV1QyRlNXUWtfUk9fbm16Y0NLOWl1Z2drVG8iLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM4MjgyOCwiZXhwIjoxNjA1Mzg2NDI4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.ENCqOdVf6NWt1zq5JaPqLi7zc-LvE3ffFrCJXZXl3ORONfkU2w_aGMWGTafn4miTMZsrZJZEe4fwckNCr5rg3hOtib-ohlOy0nzAHJWTDvRYMnDx0LxUFaCM_wP5Fgh1VP4cONBOO69106vKiaKNTao6NorIHeLBeqpcTCZbTiteZ5rTIBVR5qXabLT0ALpw3JWb9U7c_hnixVj1ecP9CW4Fv1BIFysN9srESrCofMrlP4Hf2YlC19KflYdFnTvpADTn-1owTNpbPOGnipltEQgd0DIQREi5Sf53Vx_6TYGi3sIGfOI7QEM8yf7dNJhaWgCxnUh0sAlPIxzw6jmJuA'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private endpoint"
}

$ http :8080/spring-security-oidc/private-scoped 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkwzb0dCZ3BWQkxDNXowUzdrV1QyRlNXUWtfUk9fbm16Y0NLOWl1Z2drVG8iLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM4MjgyOCwiZXhwIjoxNjA1Mzg2NDI4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.ENCqOdVf6NWt1zq5JaPqLi7zc-LvE3ffFrCJXZXl3ORONfkU2w_aGMWGTafn4miTMZsrZJZEe4fwckNCr5rg3hOtib-ohlOy0nzAHJWTDvRYMnDx0LxUFaCM_wP5Fgh1VP4cONBOO69106vKiaKNTao6NorIHeLBeqpcTCZbTiteZ5rTIBVR5qXabLT0ALpw3JWb9U7c_hnixVj1ecP9CW4Fv1BIFysN9srESrCofMrlP4Hf2YlC19KflYdFnTvpADTn-1owTNpbPOGnipltEQgd0DIQREi5Sf53Vx_6TYGi3sIGfOI7QEM8yf7dNJhaWgCxnUh0sAlPIxzw6jmJuA'
HTTP/1.1 403
WWW-Authenticate: Bearer error="insufficient_scope", error_description="The request requires higher privileges than provided by the access token.", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"
# other headers

$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=read:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmdhdVZEZmd5Y1A3Nm5QLVVKOUxOXzhmX2s3U2tNOUNiUXFidm01eWtNOWsiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM4MzE2OSwiZXhwIjoxNjA1Mzg2NzY5LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.A9jOuJbLYlSFr7mtoQwgIv2-53vSpolTW_ZWfGNH9NyRYuchGY4iCIOTUsfGzN3B7fOZnHjg0F2Iywk_Yo0XHvwGLnfFIyeAjtVB-FUd21HbbfUf-kUeyh0zSz0ixPq-K6kQBha08vPTqKPXuAcHUwhAUFHoA2cREvl2cx-WioDIZgjd_oodbEBzm2jQiREvi3mFHtlb_EVtSEWpD92tNuZdf_E31M0jUeISTdo7UnJarps5WHNIK6ZbLumllhwI7yrpCpb58AFKyeXBwzI2TPYdvXyVIvA9svuoIUnYu_MiLnW5rh4BbH_hh21OOI_2XIO6NJsLSQy19pTZGh4NzA",
  "expires_in": 3600,
  "scope": "read:messages",
  "token_type": "Bearer"
}

$ http :8080/spring-security-oidc/private-scoped 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmdhdVZEZmd5Y1A3Nm5QLVVKOUxOXzhmX2s3U2tNOUNiUXFidm01eWtNOWsiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM4MzE2OSwiZXhwIjoxNjA1Mzg2NzY5LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.A9jOuJbLYlSFr7mtoQwgIv2-53vSpolTW_ZWfGNH9NyRYuchGY4iCIOTUsfGzN3B7fOZnHjg0F2Iywk_Yo0XHvwGLnfFIyeAjtVB-FUd21HbbfUf-kUeyh0zSz0ixPq-K6kQBha08vPTqKPXuAcHUwhAUFHoA2cREvl2cx-WioDIZgjd_oodbEBzm2jQiREvi3mFHtlb_EVtSEWpD92tNuZdf_E31M0jUeISTdo7UnJarps5WHNIK6ZbLumllhwI7yrpCpb58AFKyeXBwzI2TPYdvXyVIvA9svuoIUnYu_MiLnW5rh4BbH_hh21OOI_2XIO6NJsLSQy19pTZGh4NzA'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private scoped endpoint"
}
```

## Mixing the local token validation and introspection

You may have already realized that introspecting every request is unnecessary, unless the resource is very sensitive. Also, keep in mind that your identity provider may charge you for a certain number of introspection requests; so cost may be another concern due to which you may want to avoid introspection until absolutely needed. You can mix the local token validation and introspection approaches to suit your needs: verify the tokens locally for the low-risk resources and introspect them for the high-risk resources.

To demonstrate, assume that the private scoped endpoint is a high-risk resource and the other endpoints are low-risk resources. We need to inform Spring Security to introspect in the former case and locally validate the token in the rest of the cases. Spring Security uses specific implementations of the `AuthenticationManager` to manage different types of authentication. An `AuthenticationManagerResolver` specifies which implementation of the `AuthenticationManager` needs to be applied to a request. At the time of writing this post, Spring Security does not provide an inbuilt `AuthenticationManagerResolver` to handle our usecase. Hence, we need to implement a custom `AuthenticationManagerResolver` as follows.

```java
// src/main/java/dev/mflash/guides/tokenval/hybrid/security/RequestMatchingAuthenticationManagerResolver.java

public class RequestMatchingAuthenticationManagerResolver implements AuthenticationManagerResolver<HttpServletRequest> {

  private final LinkedHashMap<RequestMatcher, AuthenticationManager> authenticationManagers;
  private AuthenticationManager defaultAuthenticationManager = authentication -> {
    throw new AuthenticationServiceException("Cannot authenticate " + authentication);
  };

  public RequestMatchingAuthenticationManagerResolver(
      LinkedHashMap<RequestMatcher, AuthenticationManager> authenticationManagers) {
    this.authenticationManagers = authenticationManagers;
  }

  public @Override AuthenticationManager resolve(HttpServletRequest context) {
    for (Map.Entry<RequestMatcher, AuthenticationManager> entry : this.authenticationManagers.entrySet()) {
      if (entry.getKey().matches(context)) {
        return entry.getValue();
      }
    }

    return this.defaultAuthenticationManager;
  }

  public void setDefaultAuthenticationManager(AuthenticationManager defaultAuthenticationManager) {
    this.defaultAuthenticationManager = defaultAuthenticationManager;
  }
}
```

Here, once the `RequestMatchingAuthenticationManagerResolver` receives a map of `RequestMatcher` and `AuthenticationManager`, it can return the corresponding `AuthenticationManager` for a given route, which can then be invoked to do either local token validation or introspection. You can also set a fallback `AuthenticationManager` through the `setDefaultAuthenticationManager` method in case no matching `AuthenticationManager` is available for a given request.

> Note that there's an open [pull request](https://github.com/spring-projects/spring-security/pull/7366) on the Spring Security repository which may add the `RequestMatchingAuthenticationManagerResolver` to the framework once accepted.

Using the `RequestMatchingAuthenticationManagerResolver`, modify the `SecurityConfiguration` as follows.

```java {19,22-31,33-37,39-41}
// src/main/java/dev/mflash/guides/tokenval/hybrid/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final OidcProperties oidcProps;
  private final OAuth2ResourceServerProperties resourceServerProps;

  public SecurityConfiguration(OidcProperties oidcProps, OAuth2ResourceServerProperties resourceServerProps) {
    this.oidcProps = oidcProps;
    this.resourceServerProps = resourceServerProps;
  }

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .mvcMatchers(CONTEXT + PUBLIC_ENDPOINT).permitAll()
        .mvcMatchers(CONTEXT + PRIVATE_ENDPOINT_LOCAL).authenticated()
        .mvcMatchers(CONTEXT + PRIVATE_SCOPED_ENDPOINT_REMOTE).hasAuthority("SCOPE_read:messages")
        .and().oauth2ResourceServer().authenticationManagerResolver(customAuthenticationManager());
  }

  AuthenticationManagerResolver<HttpServletRequest> customAuthenticationManager() {
    var authenticationManagers = new LinkedHashMap<RequestMatcher, AuthenticationManager>();
    RequestMatcher requestMatcherLocal = request -> request.getRequestURI().contains(PRIVATE_SCOPED_ENDPOINT_REMOTE);
    authenticationManagers.put(requestMatcherLocal, opaque());

    var authenticationManagerResolver = new RequestMatchingAuthenticationManagerResolver(authenticationManagers);
    authenticationManagerResolver.setDefaultAuthenticationManager(jwt());

    return authenticationManagerResolver;
  }

  AuthenticationManager jwt() {
    var jwtAuthenticationProvider = new JwtAuthenticationProvider(jwtDecoder());
    jwtAuthenticationProvider.setJwtAuthenticationConverter(new JwtAuthenticationConverter());
    return jwtAuthenticationProvider::authenticate;
  }

  AuthenticationManager opaque() {
    return new OpaqueTokenAuthenticationProvider(tokenIntrospector())::authenticate;
  }

  @Bean JwtDecoder jwtDecoder() {
    String issuer = resourceServerProps.getJwt().getIssuerUri();
    String audience = oidcProps.getAudience();
    var jwtDecoder = (NimbusJwtDecoder) JwtDecoders.fromOidcIssuerLocation(issuer);
    var audienceValidator = new CustomTokenValidator(audience);
    OAuth2TokenValidator<Jwt> validatorWithIssuer = JwtValidators.createDefaultWithIssuer(issuer);
    var validatorWithAudience = new DelegatingOAuth2TokenValidator<>(validatorWithIssuer, audienceValidator);
    jwtDecoder.setJwtValidator(validatorWithAudience);
    return jwtDecoder;
  }

  @Bean OpaqueTokenIntrospector tokenIntrospector() {
    return new CustomOpaqueTokenIntrospector(resourceServerProps);
  }
}
```

Note that we're now calling the `authenticationManagerResolver` method over the `oauth2ResourceServer`. In the `customAuthenticationManager` method, we're registering the private scoped endpoint to be introspected, and the other endpoints to be locally validated. Finally, we define dedicated `AuthenticationManager` implementations that use 

- the `JwtDecoder` to perform local token validation in the `jwt` method, and 
- the `OpaqueTokenIntrospector` to perform introspection in the `opaque` method.

### Testing the hybrid approach

![Hybrid token validation flow](/images/post/2020/2020-11-15-11-38-57-protecting-endpoints-with-spring-security-resource-server-08.png)

As earlier, rerun the previous scenarios with *httpie* to see the hybrid approach in action.

```sh
$ http :8080/spring-security-oidc/public
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a public endpoint"
}

$ http :8080/spring-security-oidc/private-local
HTTP/1.1 401
# other headers

$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=write:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULk5Da3dQeXBfOGJLQ3RTeVhnYTExTzVYTFdpSllmMHczOVRNWDJ3S2dUVGciLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTQxNjQ4NywiZXhwIjoxNjA1NDIwMDg3LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.J8NGRTdMGYOmkr7jnm-d2yhHwHmZlCga3j5WsNpifaRqMRutYy9PXACZfcPS7R4vrX-iDYJyNCoKMcjUT1RL-FTiBAbZ50tIz5lfFWEVbz2M80B75I0cVPOmvk7yv1w2SOyDo8ykRRt4O0tKDkrD7rKJCi6YTQu9QWzwiNlTNCzy-KdcL75plzuOUyg1P9dd-ScMN3pNmm3R1sgyIGbVXMlkbjIqZ_vX1-76kqb-3diBoYpt6_aiWAGxVejtYl689q9SeBty79TrWhGDTZpPJp-21QlxvWn0ybrJvlJuUFLe5aKXqW6evR5owrwt0YMT3qvKZIQmQlVC2JWRFOHzAQ",
  "expires_in": 3600,
  "scope": "write:messages",
  "token_type": "Bearer"
}

$ http :8080/spring-security-oidc/private-local 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULk5Da3dQeXBfOGJLQ3RTeVhnYTExTzVYTFdpSllmMHczOVRNWDJ3S2dUVGciLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTQxNjQ4NywiZXhwIjoxNjA1NDIwMDg3LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.J8NGRTdMGYOmkr7jnm-d2yhHwHmZlCga3j5WsNpifaRqMRutYy9PXACZfcPS7R4vrX-iDYJyNCoKMcjUT1RL-FTiBAbZ50tIz5lfFWEVbz2M80B75I0cVPOmvk7yv1w2SOyDo8ykRRt4O0tKDkrD7rKJCi6YTQu9QWzwiNlTNCzy-KdcL75plzuOUyg1P9dd-ScMN3pNmm3R1sgyIGbVXMlkbjIqZ_vX1-76kqb-3diBoYpt6_aiWAGxVejtYl689q9SeBty79TrWhGDTZpPJp-21QlxvWn0ybrJvlJuUFLe5aKXqW6evR5owrwt0YMT3qvKZIQmQlVC2JWRFOHzAQ'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private locally-validated endpoint"
}

$ http :8080/spring-security-oidc/private-scoped-remote 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULk5Da3dQeXBfOGJLQ3RTeVhnYTExTzVYTFdpSllmMHczOVRNWDJ3S2dUVGciLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTQxNjQ4NywiZXhwIjoxNjA1NDIwMDg3LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.J8NGRTdMGYOmkr7jnm-d2yhHwHmZlCga3j5WsNpifaRqMRutYy9PXACZfcPS7R4vrX-iDYJyNCoKMcjUT1RL-FTiBAbZ50tIz5lfFWEVbz2M80B75I0cVPOmvk7yv1w2SOyDo8ykRRt4O0tKDkrD7rKJCi6YTQu9QWzwiNlTNCzy-KdcL75plzuOUyg1P9dd-ScMN3pNmm3R1sgyIGbVXMlkbjIqZ_vX1-76kqb-3diBoYpt6_aiWAGxVejtYl689q9SeBty79TrWhGDTZpPJp-21QlxvWn0ybrJvlJuUFLe5aKXqW6evR5owrwt0YMT3qvKZIQmQlVC2JWRFOHzAQ'
HTTP/1.1 403
WWW-Authenticate: Bearer error="insufficient_scope", error_description="The request requires higher privileges than provided by the access token.", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"
# other headers

$ http --form -a 0oarle1cZ7n7esoqO5d5:i-HUDoMIm5SO7s22ejZzMb2qKHGb7HnMESx4NV2S POST https://dev-4273429.okta.com/oauth2/default/v1/token grant_type=client_credentials scope=read:messages
HTTP/1.1 200 OK
# other headers
{
  "access_token": "eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjVOX1F3ekV4aFJRemQ1WTBVR0tfRVdrS3ZKOHVLcndleVh4MG82R2EtWUkiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTQxNjY3NCwiZXhwIjoxNjA1NDIwMjc0LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.F-zfuMAHPnwvhfzu6-GLFER_AMDLUaPjGn9EYFNMjQLgGOkRV9DY4dxlMGLExytqwe2lDmMd9EYptyPBNRWk9kPz-yzcbaxQAAzBoq1N700F0eaMPnxI-S_zwpOxlFD58NPTJf_4CGHY9T_K4A51N_OUIs-fI0STeTv4bmgNxL-eVZhiZSu2CVq1pJO6fDu6HBhc4g8pualauSHNZrkx0P8_VyuhM7jM5tv-3hJD8Ppay04JDd5vwKlLoc1nFIzbWI9nYv-ymuelG1SDQ24k1gRaCBFh7cHnKcRdw3Eu_eqRkTLAdfh2JAk-QNNjzpr_8ffvhYvoY39VFmQ7J-0uBQ",
  "expires_in": 3600,
  "scope": "read:messages",
  "token_type": "Bearer"
}

$ http :8080/spring-security-oidc/private-scoped-remote 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjVOX1F3ekV4aFJRemQ1WTBVR0tfRVdrS3ZKOHVLcndleVh4MG82R2EtWUkiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTQxNjY3NCwiZXhwIjoxNjA1NDIwMjc0LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJyZWFkOm1lc3NhZ2VzIl0sInN1YiI6IjBvYXJsZTFjWjduN2Vzb3FPNWQ1In0.F-zfuMAHPnwvhfzu6-GLFER_AMDLUaPjGn9EYFNMjQLgGOkRV9DY4dxlMGLExytqwe2lDmMd9EYptyPBNRWk9kPz-yzcbaxQAAzBoq1N700F0eaMPnxI-S_zwpOxlFD58NPTJf_4CGHY9T_K4A51N_OUIs-fI0STeTv4bmgNxL-eVZhiZSu2CVq1pJO6fDu6HBhc4g8pualauSHNZrkx0P8_VyuhM7jM5tv-3hJD8Ppay04JDd5vwKlLoc1nFIzbWI9nYv-ymuelG1SDQ24k1gRaCBFh7cHnKcRdw3Eu_eqRkTLAdfh2JAk-QNNjzpr_8ffvhYvoY39VFmQ7J-0uBQ'
HTTP/1.1 200
# other headers
{
  "message": "Hello, world! This is a private scoped remotely-validated endpoint"
}
```

---

**Source code**

- [spring-security-token-validation-local](https://github.com/Microflash/guides/tree/main/spring/spring-security-token-validation-local)
- [spring-security-token-introspection](https://github.com/Microflash/guides/tree/main/spring/spring-security-token-introspection)
- [spring-security-token-validation-hybrid](https://github.com/Microflash/guides/tree/main/spring/spring-security-token-validation-hybrid)

**Related**

- [Spring Security Resource Server](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#webflux-oauth2-resource-server)
- [OAuth 2.0 Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)
- [OAuth Scopes](https://tools.ietf.org/html/rfc6749#section-3.3)
- [OAuth 2.0: Audience Information](https://tools.ietf.org/id/draft-tschofenig-oauth-audience-00.html)
- [OAuth 2.0 Token Introspection](https://tools.ietf.org/html/rfc7662)
