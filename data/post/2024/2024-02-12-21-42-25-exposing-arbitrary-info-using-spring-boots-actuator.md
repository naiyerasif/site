---
slug: "2024/02/12/exposing-arbitrary-info-using-spring-boots-actuator"
title: "How to show custom info using Spring Boot Actuator"
date: 2024-02-12 21:42:25
update: 2025-09-21T15:36:07
type: "guide"
---

[Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) offers a useful capability to show the details about an application. For example, the [`health`](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health) endpoint provides basic application health information. Similarly, you can show any custom information through the [`info`](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.info) endpoint.

For example, you can put the following configuration to provide the application version and the Java version used by it.

```yml {6..7} title="application.yml"
management:
  endpoints.web.exposure.include: health,info
  info.env.enabled: true

info:
  app.version: @project.version@
  java.version: @java.version@
```

:::note
Spring Boot [expands](https://docs.spring.io/spring-boot/how-to/properties-and-configuration.html#howto.properties-and-configuration.expand-properties) the `@project.version@` and `@java.version@` properties at the build time.
:::

You can print the details by hitting the endpoint as follows.

```sh prompt{1}
curl http://localhost:8080/actuator/info
{
	"app": {
		"version": "0.0.3"
	},
	"java": {
		"version": 25
	}
}
```

By default, the actuator exposes only the `health` endpoint over HTTP. The `management.endpoints.web.exposure.include=health,info` property exposes both the `health` and `info` endpoints over HTTP.

To customize the `info` endpoint, you need to enable the `env` contributor with the `management.info.env.enabled=true` flag. Then, you can set `info.*` properties and the actuator would show them through the `info` endpoint. 

You can use these details to verify the deployed version of the application in an environment. You can display them on your status page alongside the health status to offer more context. You can collect specific metrics based on the exposed properties.
