---
slug: "2023/10/22/graceful-shutdown-with-spring-boot"
title: "Graceful shutdown with Spring Boot"
date: 2023-10-22 00:04:19
update: 2023-10-22 00:04:19
type: "status"
---

[Graceful shutdown](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#web.graceful-shutdown) with `server.shutdown=graceful` is such an underrated feature of Spring Boot. You can do zero-downtime deployments with this property on managed container services like ECS.
