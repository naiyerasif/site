---
slug: "2021/03/27/content-negotiation-in-spring-boot"
title: "Content negotiation in Spring Boot"
description: "You might be required to provide the response in different formats depending on the client. One might accept JSON while the other can only work with XML. Learn how to handle this with Spring Boot."
date: "2021-03-27 11:03:46"
update: "2022-07-16 11:24:33"
category: "guide"
tags: ["spring", "content", "negotiation"]
---

In situations where an API is being consumed by multiple systems, you might be required to provide the response in different formats depending on the client. One client might accept JSON while the other can only work with XML. That's where the Request Content Negotiation comes into picture. In this post, we'll explore a specific usecase of the request content negotiation where a client sends their preferences for the mediatype of their choice.

:::note{title='Request Content Negotiation'}
Request Content Negotiation is a server-driven content negotiation where a client sends several HTTP headers along with the URL. These headers describe the preferences of the client. The server takes them as hints and generates the appropriate response to send to the client. If the server can't prepare a response per the client preferences, it may respond with a `406 Not Acceptable` or `413 Unsupported Media Type` status.
:::

:::setup
The examples in this post use

- Java 18
- Spring Boot 2.7.1
- Maven 3.8.6
- curl (to send HTTP requests)
- xmlstarlet (to format xml)
- jq (to format json)
:::

Spring supports the following strategies for the content negotiation.

- Suffix Pattern matching (deprecated)
- Query Parameter mapping
- `Accept` header field

## Suffix Pattern matching (deprecated)

Suffix Pattern matching was historically used when an HTTP client wasn't able to send proper `Accept` request headers. For example, a request `GET /game/trial.xml` matches with `@GetMapping("/game/trial")` and the response is an XML document.

Suffix pattern matching is now deprecated and turned off by default. The reasoning behind the deprecation is explained in detail in the docs [here](https://docs.spring.io/spring-framework/docs/5.3.19/reference/html/web.html#mvc-ann-requestmapping-suffix-pattern-match).

## Query Parameter mapping

Query Parameter mapping is the preferred way to handle content negotiation when the HTTP clients can't send proper `Accept` request headers. For example, a request `GET /game/trial?format=xml` matches to `@GetMapping("/game/trial")` and the response is an XML document.

To enable this, open `application.yml` (or `application.properties`) of the Spring project and add the following configuration.

```yml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
```

By default, `format` is the query parameter to pass the acceptable format. Here's an example to get the response in XML.

```sh prompt{1}
curl -s http://localhost:8080/game/trial?format=xml | xml fo -o
<Game>
	<title>Control</title>
	<publisher>Remedy Entertainment</publisher>
</Game>
```

The default response format is JSON (unless specified / configured otherwise).

```sh prompt{1}
curl -s http://localhost:8080/game/trial | jq
{
	"title": "Control",
	"publisher": "Remedy Entertainment"
}
```

A different parameter name can also be configured through the following configuration.

```yml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
      parameter-name: mediatype
```

Spring supports a lot of media types out-of-the-box. But custom media types can also be configured as follows.

```yml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
      parameter-name: mediatype
      media-types.toml: application/toml
```

To support custom media types, you might have to provide additional dependencies and converters to Spring.

## `Accept` header field

Sending the `Accept` request headers is the default content negotiation strategy provided by Spring.

```sh prompt{1}
curl -s http://localhost:8080/game/trial -H 'Accept: application/xml' | xml fo -o
<Game>
	<title>Control</title>
	<publisher>Remedy Entertainment</publisher>
</Game>
```

Similarly, a request for JSON response returns:

```sh prompt{1}
curl -s http://localhost:8080/game/trial -H 'Accept: application/json' | jq
{
	"title": "Control",
	"publisher": "Remedy Entertainment"
}
```

---

**Source code**

- [spring-content-negotiation](https://github.com/Microflash/guides/tree/main/spring/spring-content-negotiation)

**Related**

- [Path Matching and Content Negotiation](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.content-negotiation)
- [HTTP Semantics: Content Negotiation](https://www.rfc-editor.org/rfc/rfc9110.html#name-content-negotiation)
