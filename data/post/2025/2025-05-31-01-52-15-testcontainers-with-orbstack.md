---
slug: "2025/05/31/testcontainers-with-orbstack"
title: "Testcontainers with Orbstack"
date: 2025-05-31 01:52:15
update: 2025-05-31 01:52:15
type: "note"
---

While working with [Testcontainers](https://testcontainers.com/), I recently ran into an issue where it couldn't detect Docker running on my machine when using [Orbstack](https://orbstack.dev/) instead of Docker Desktop.

[Turns out](https://www.rockyourcode.com/testcontainers-with-orbstack/), you can force Docker host detection by setting these environment variables.

```nu
$env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE = "/var/run/docker.sock"
$env.DOCKER_HOST = $"unix://($env.HOME)/.orbstack/run/docker.sock"
```
