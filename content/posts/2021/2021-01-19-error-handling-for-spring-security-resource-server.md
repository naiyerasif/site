---
title: 'Error handling for Spring Security Resource Server'
date: 2021-01-19 09:46:57
authors: [naiyer]
topics: [spring, security, oauth2]
---

> This is a follow-up post for [Error handling for a Spring-based REST API](/blog/2020/07/26/error-handling-for-a-spring-based-rest-api/) and [Protecting endpoints with Spring Security Resource Server](/blog/2020/11/15/protecting-endpoints-with-spring-security-resource-server/).

In this post, we'll discuss how to customize error handling for a REST API protected with OAuth 2 using Spring Security Resource Server. We'll use the approach described in the post [Error handling for a Spring-based REST API](/blog/2020/07/26/error-handling-for-a-spring-based-rest-api/).

## Configuring Error Handling in Spring Security

[Spring Security's Configuration DSL](https://spring.io/blog/2019/11/21/spring-security-lambda-dsl) to configure `HttpSecurity` exposes APIs to customize 
- an `AuthenticationEntryPoint` to handle authentication failures, and
- an `AccessDeniedHandler` to handle authorization failures.

In the case of Spring Security Resource Server, the `BearerTokenAuthenticationEntryPoint` and `BearerTokenAccessDeniedHandler` are the default implementations. You can override them by custom implementations, say `CustomOAuth2AuthenticationEntryPoint` and `CustomOAuth2AccessDeniedHandler`, using the configuration DSL as follows.

```java{10-11}
// src/main/java/dev/mflash/guides/tokenval/introspection/security/SecurityConfiguration.java

@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  protected @Override void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        // other configurations
        .and().oauth2ResourceServer()
        .authenticationEntryPoint(new CustomOAuth2AuthenticationEntryPoint())
        .accessDeniedHandler(new CustomOAuth2AccessDeniedHandler())
        .opaqueToken();
  }

  // rest of the implementation
}
```

### Status Code and Header for Authentication and Authorization failure

In case of an authentication failure, we should respond with a [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) status code. Similarly, in the case of authorization failure, we should return a [403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) status code.

Besides the status code, it is also customary to send a [WWW-Authenticate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate) header. This header provides the reasoning behind the failure and a method to gain access to the requested resource.

Apart from this, we want the error response in a custom JSON format described in the post [Error handling for a Spring-based REST API](/blog/2020/07/26/error-handling-for-a-spring-based-rest-api/). To achieve this, let's implement the `CustomOAuth2AuthenticationEntryPoint` and `CustomOAuth2AccessDeniedHandler` by dutifully reusing (read: copying) the code from the `BearerTokenAuthenticationEntryPoint` and `BearerTokenAccessDeniedHandler` classes to suit our needs.

## Implementing the `CustomOAuth2AuthenticationEntryPoint`

In this implementation, we'll return a custom response in JSON format along with a `401 Unauthorized` status code and `WWW-Authenticate` header.

```java
public class CustomOAuth2AuthenticationEntryPoint implements AuthenticationEntryPoint {

  private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2AuthenticationEntryPoint.class);

  private String realmName;

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
      throws IOException {
    logger.error(e.getLocalizedMessage(), e);

    HttpStatus status = HttpStatus.UNAUTHORIZED;
    String errorMessage = "Insufficient authentication details";
    Map<String, String> parameters = new LinkedHashMap<>();

    if (Objects.nonNull(realmName)) {
      parameters.put("realm", realmName);
    }

    if (e instanceof OAuth2AuthenticationException) {
      OAuth2Error error = ((OAuth2AuthenticationException) e).getError();
      parameters.put("error", error.getErrorCode());

      if (StringUtils.hasText(error.getDescription())) {
        errorMessage = error.getDescription();
        parameters.put("error_description", errorMessage);
      }

      if (StringUtils.hasText(error.getUri())) {
        parameters.put("error_uri", error.getUri());
      }

      if (error instanceof BearerTokenError) {
        BearerTokenError bearerTokenError = (BearerTokenError) error;

        if (StringUtils.hasText(bearerTokenError.getScope())) {
          parameters.put("scope", bearerTokenError.getScope());
        }

        status = ((BearerTokenError) error).getHttpStatus();
      }
    }

    String message = RestResponse.builder()
        .status(status)
        .error("Unauthenticated")
        .message(errorMessage)
        .path(request.getRequestURI())
        .json();

    String wwwAuthenticate = computeWWWAuthenticateHeaderValue(parameters);
    response.addHeader("WWW-Authenticate", wwwAuthenticate);
    response.setStatus(status.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(message);
  }
}
```

In this implementation, we're
- logging the error using a logger
- initializing the default status code `status` and error message `errorMessage`
- initializing a map of parameters `parameters` to generate the `WWW-Authenticate` header later
- putting the `realmName` if it is available in the `parameters` map
- putting some error-related fields on the `parameters` map if the exception occurs due to an OAuth2 mishap
- creating a custom response JSON `message`, and
- finally returning the `message` with the `WWW-Authenticate` header.

You would notice that `computeWWWAuthenticateHeaderValue` is a static method that generates the value of the `WWW-Authenticate` header. Let's implement it now, in a utility class, say `WWWAuthenticateHeaderBuilder`.

## Implementing the `WWWAuthenticateHeaderBuilder`

The [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate) describes the following syntax for the value of the `WWW-Authenticate` header.

```sh
WWW-Authenticate: <type> realm=<realm>[, charset="UTF-8"][, error=<error_code>][, error_description=<error_description>][, error_uri=<error_uri>][, scope=<scope>]
```

where
- `<type>` is the authentication scheme. In our case, it is `Bearer`.
- `realm=<realm>` is a description of where the authentication and authorization take place. This can be a description of the environment, url of the token provider, or the hostname of the server.
- `charset=<charset>` is the preferred encoding scheme for a client to provide credentials.
- `error=<error_code>` is a standard [error code](https://tools.ietf.org/html/rfc6750#section-3.1) corresponding to the status codes (e.g., `invalid_token` in case of an invalid token along with a `401 Unauthorized` status code)
- `error_description=<error_description>` is a detailed message describing the nature of error.
- `error_uri=<error_uri>` is a link to the reference documentation of the error.

You'd notice that we've collected these parameters in a map in the `CustomOAuth2AuthenticationEntryPoint` implementation. Using this map, we can construct the `WWW-Authenticate` header as follows.

```java
public final class WWWAuthenticateHeaderBuilder {

  public static String computeWWWAuthenticateHeaderValue(Map<String, String> parameters) {
    StringJoiner wwwAuthenticate = new StringJoiner(", ", "Bearer ", "");

    if (!parameters.isEmpty()) {
      parameters.forEach((k, v) -> wwwAuthenticate.add(k + "=\"" + v + "\""));
    }

    return wwwAuthenticate.toString();
  }
}
```

## Implementing the `CustomOAuth2AccessDeniedHandler`

Similarly, we can implement the `CustomOAuth2AccessDeniedHandler` class with the difference that we now set the appropriate status code and the corresponding error code and description for authorization failure.

```java
public class CustomOAuth2AccessDeniedHandler implements AccessDeniedHandler {

  public static final Logger logger = LoggerFactory.getLogger(CustomOAuth2AccessDeniedHandler.class);

  private String realmName;

  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e)
      throws IOException {
    logger.error(e.getLocalizedMessage(), e);

    Map<String, String> parameters = new LinkedHashMap<>();
    String errorMessage = e.getLocalizedMessage();

    if (Objects.nonNull(realmName)) {
      parameters.put("realm", realmName);
    }

    if (request.getUserPrincipal() instanceof AbstractOAuth2TokenAuthenticationToken) {
      errorMessage = "The request requires higher privileges than provided by the access token.";

      parameters.put("error", "insufficient_scope");
      parameters.put("error_description", errorMessage);
      parameters.put("error_uri", "https://tools.ietf.org/html/rfc6750#section-3.1");
    }

    String message = RestResponse.builder()
        .status(HttpStatus.FORBIDDEN)
        .message(errorMessage)
        .path(request.getRequestURI())
        .json();

    String wwwAuthenticate = computeWWWAuthenticateHeaderValue(parameters);
    response.addHeader("WWW-Authenticate", wwwAuthenticate);
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(message);
  }

  public void setRealmName(String realmName) {
    this.realmName = realmName;
  }
}
```

## Testing the error handling

Launch the application and access the `/private` endpoint with no token and subsequently, with an invalid token.

```sh
$ http :8080/spring-security-oidc/private
HTTP/1.1 401
# other headers

{
  "error": "Unauthenticated",
  "message": "Insufficient authentication details",
  "path": "/spring-security-oidc/private",
  "status": 401,
  "timestamp": "2021-01-18T23:31:51.817978500"
}

$ http :8080/spring-security-oidc/private 'Authorization:Bearer eyJraWQiOiJxczFVSzFqWnN0OGFFYlRxOElaZ1NTaDlHd3pha3Jqa0hFcG1MeGRQblNJIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldpcDNYZzNQSFRSYjgwX1M0dUZPbWNSOVhVaHQxbF95TGl1QVdzOVE5SnMiLCJpc3MiOiJodHRwczovL2Rldi00MjczNDI5Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsImlhdCI6MTYwNTM3OTMzOCwiZXhwIjoxNjA1MzgyOTM4LCJjaWQiOiIwb2FybGUxY1o3bjdlc29xTzVkNSIsInNjcCI6WyJ3cml0ZTptZXNzYWdlcyJdLCJzdWIiOiIwb2FybGUxY1o3bjdlc29xTzVkNSJ9.DbVQW0lDqPWpZ8RM6FBPI4N6ey9UKb9v3oMTNMifyF9rx7hfQb8YVFGeNVHMPCkYDUfCHFQPplAo0tubVjN-Fh5xzs4y0Wai58Ju-viMGSn-lo5G5Vz8_EjH47R0OQHWz-CqFr6NPNdarKs-KK_GuFYOxoOdcCJ1rwACtKdAHz8ihG69VKncYtkfWvvIRA270Wpo7_PAtnkdAxz-LVvLIkdT9OTQOg7oFfnI7k0EJhmg9BAEzWWmxprzVgfCTSLsCBz5nfHtQdv8aD3AauvY61s0M59rMRCO37P7EN7Fd1HRN0klYm-QycVYxYpXIAVbw5KDPWtKEs0rz-mpS_y9KQ'
HTTP/1.1 403
WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired.", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"
# other headers

{
  "error": "Forbidden",
  "message": "The access token expired",
  "path": "/spring-security-oidc/private",
  "status": 403,
  "timestamp": "2021-01-18T23:32:55.227262100"
}
```

## References

**Source Code**
- [spring-security-resource-server-error-handling](https://github.com/Microflash/spring-guides/tree/main/spring-security-resource-server-error-handling)

**Related**
- [Error handling for a Spring-based REST API](/blog/2020/07/26/error-handling-for-a-spring-based-rest-api/)
- [Protecting endpoints with Spring Security Resource Server](/blog/2020/11/15/protecting-endpoints-with-spring-security-resource-server/)
- [The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [`BearerTokenAuthenticationEntryPoint` in Spring Security Resource Server](https://github.com/spring-projects/spring-security/blob/master/oauth2/oauth2-resource-server/src/main/java/org/springframework/security/oauth2/server/resource/web/BearerTokenAuthenticationEntryPoint.java)
- [`BearerTokenAccessDeniedHandler` in Spring Security Resource Server](https://github.com/spring-projects/spring-security/blob/master/oauth2/oauth2-resource-server/src/main/java/org/springframework/security/oauth2/server/resource/web/access/BearerTokenAccessDeniedHandler.java)
