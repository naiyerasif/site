---
title: Network sharing between different Docker containers
path: network-sharing-between-different-docker-containers
date: 2018-10-24
updated: 2019-09-19
author: [naiyer]
summary: Create two containers on separate Docker stacks with a capability to communicate through same Docker network
tags: ['guide', 'docker', 'angular', 'micronaut']
---

## Intent

The intent of this guide is to create two separate containers managed under separate Docker stacks but communicating through same Docker network.

### Setup

> This guide uses
> - Java 11
> - Node 12
> - Micronaut 1.2.2
> - Angular 8
> - Docker Engine 19

#### Prerequisites

Refer to [Communication within a Docker network](/blog/2018/08/05/communication-within-a-docker-network) and use the same Micronaut and Angular applications for this guide.

### Table of Contents

## Create a Docker stack for the Micronaut application

Create a Docker image of the Micronaut application by executing the following command in your terminal. If you've already created this image, skip this step.

```bash
docker build -t mflash/greeter_api .
```

Create a `docker-compose.yml` file and add the following configuration.

```yaml
version: '3.1'

services:
  greeter_api:
    image: mflash/greeter_api
    environment:
      SERVER_PORT: 8084
    networks:
      - greeternet

networks:
  greeternet:
    driver: bridge
```

Launch the stack by executing `docker-compose up -d`. This should create a Docker network `greeter-api_greeternet`. Your Angular container should also launch in the same network in order to call the Micronaut endpoints.

## Create a Docker stack for the Angular application

Generate a Docker image of the Angular application by executing the following command in your terminal. If you've already created this image, skip this step.

```bash
docker build -t mflash/greeter_ui .
```

Setup a Docker stack for the Angular application by creating a `docker-compose.yml` file with the following configuration.

```yaml
version: '3.1'

services:
  greeter_ui:
    image: mflash/greeter_ui
    networks:
      - uinet
    ports:
      - 4200:4200

networks:
  uinet:
    external:
      name: greeter-api_greeternet
```

> **Note** that `uinet` is being pointed to `greeter-api_greeternet` which was created by the previous stack. 

Launch this stack using `docker-compose up -d` and access the application at <http://localhost:4200> in a browser. You should see a message `Hello, Microflash!` displayed in the browser window.

## References

> **Source Code** &mdash; [docker-network-sharing](https://github.com/Microflash/guides/tree/master/docker/docker-network-sharing)
> 
> **Discussions**
> - [cstrutton](https://stackoverflow.com/users/1311325/cstrutton): [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)