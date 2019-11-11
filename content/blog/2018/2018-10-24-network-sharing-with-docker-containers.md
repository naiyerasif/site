---
title: Network sharing with Docker containers
path: /network-sharing-with-docker-containers
date: 2018-10-24
updated: 2019-11-11
author: [naiyer]
tags: ['gist']
---

When you're working on a large number of microservices, you will eventually come across services running on multiple Docker stacks and networks. If the services are exposed publicly, they can smoothly interact with each other. But if they are not, you'll have to create a shared Docker network across multiple stacks to enable communication between them. 

### Setup

> We'll use:
> - Java 11
> - Node 12
> - Micronaut 1.2.2
> - Angular 8
> - Docker Engine 19

Refer to [Communication within a Docker network](/blog/2018/08/05/communication-within-a-docker-network). We'll use the same Micronaut and Angular applications for this example.

### Table of Contents

## Create a Docker stack for the Micronaut application

Create a Docker image of the Micronaut application by executing the following command in your terminal. If you've already created this image, skip this step.

```bash
docker build -t mflash/greeter_api .
```

Create a `docker-compose.yml` file and add the following configuration. Define a network `greeternet`; we'll share this network with the other stack.

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

Launch the stack by executing `docker-compose up -d`. This should create a Docker network `greeter-api_greeternet`.

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

**Note** that we're pointing the `uinet` to `greeter-api_greeternet` which was created by the previous stack.

Launch this stack using `docker-compose up -d` and access the application at <http://localhost:4200> in a browser. You should see a message `Hello, Microflash!` displayed in the browser window.

## References

> **Source Code**: [docker-network-sharing](https://github.com/Microflash/guides/tree/master/docker/docker-network-sharing)
> 
> **Discussions**
> - [cstrutton](https://stackoverflow.com/users/1311325/cstrutton): [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)