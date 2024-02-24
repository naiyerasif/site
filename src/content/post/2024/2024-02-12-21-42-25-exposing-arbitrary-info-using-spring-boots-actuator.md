---
slug: "2024/02/12/exposing-arbitrary-info-using-spring-boots-actuator"
title: "Exposing arbitrary info using Spring Boot's actuator"
description: "Spring Boot's actuator module enables exposing useful details. Learn how to use the info endpoint to publish customized information about your application."
date: 2024-02-12 21:42:25
update: 2024-02-12 21:42:25
category: "note"
---

Spring Boot's [actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) module offers pretty useful capabilities to expose the details about an application. For example, the [`health`](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health) endpoint provides basic application health information. Similarly, you can expose any arbitrary information through the [`info`](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.info) endpoint.

For example, you can put the following configuration to expose the application's version and the Java version used by it.

```yml {10-11} caption="application.yml"
management:
  endpoints.web.exposure.include: health,info
  endpoint.info.enabled: true
  info.env.enabled: true

info:
  app.version: @project.version@
  java.version: @java.version@
```

> Spring Boot will [expand](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.properties-and-configuration.expand-properties) the `@project.version@` and `@java.version@` properties at the build time.

You can print the details by hitting the endpoint as follows.

```sh prompt{1}
curl http://localhost:8080/actuator/info
{
	"app": {
		"version": "0.0.1"
	},
	"java": {
		"version": "21.0.2"
	}
}
```

By default, the actuator exposes only the `health` endpoint over HTTP and <abbr title="Java Management Extensions">JMX</abbr>. The `management.endpoint.info.enabled=true` flag enables the `info` endpoint and the `management.endpoints.web.exposure.include=health,info` property exposes both the `health` and `info` endpoints over HTTP.

To customize the `info` endpoint, you need to enable the `env` contributor with the `management.info.env.enabled=true` flag. Once enabled, you can set `info.*` properties and the actuator would expose them through the `info` endpoint. 

You can use these details to verify the deployed version of the application in an environment. You can display them on your status page alongside the health status to offer more context. You can collect specific metrics based on the exposed properties.
