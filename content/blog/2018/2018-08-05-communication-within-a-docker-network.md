---
title: Communication within a Docker network
path: /communication-within-a-docker-network
date: 2018-08-05
updated: 2019-09-19
author: [naiyer]
summary: Create an Angular application that talks to a REST endpoint backed by Micronaut, both running as containers on a Docker stack
tags: ['guide', 'docker', 'angular', 'micronaut']
---

## Intent

In this guide, you'll learn to create an Angular application that consumes a REST endpoint backed by [Micronaut](http://micronaut.io/), both running as containers on a Docker stack. Only the Angular application is publicly accessible; the rest of the containers aren't exposed outside the Docker network.

When you're serving the static build (e.g., production build) of an Angular application over Nginx, there should be a mechanism to resolve the services that it consumes through their Docker URLs. You'll get to know a way to achieve this here. 

### Setup

> This guide uses
> - Java 11
> - Node 12
> - Micronaut 1.2.2
> - Angular 8
> - Docker Engine 19

Execute the following command on your favorite terminal to generate a Micronaut app with Maven support.

```bash
mn create-app dev.mflash.guides.greeter.greeter-api --build maven
```

This command will generate a Micronaut application with Java support in a `greeter-api` directory with a package `dev.mflash.guides.greeter`. Import this application in your favorite IDE.

> **Note** Micronaut CLI will setup the same Java version which is available on the PATH. So, if Java 11 is available on your PATH, the variable `java.version` in the `pom.xml` file will be set to 11.

### Table of Contents

## Create a REST endpoint

Define a class that would wrap the greeting message.

```java
public class Greeting {

  private String message;

  // constructors, getters, setters, etc
}
```

Create a `GreetingController` in your package, which returns a `Greeting` object.

```java
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;

@Controller("/hello")
public class GreetingController {

  @Get(produces = MediaType.APPLICATION_JSON)
  public Greeting greet(@QueryValue(value = "name", defaultValue = "World") String name) {
    return new Greeting("Hello, " + name + "!");
  }
}
```

Enable CORS for the Angular application so that it could communicate with this endpoint; open `application.yml` file and add the following configuration.

```yaml
micronaut:
  application:
    name: greeter-api
  server:
    port: 8084
    cors:
      enabled: true
      configurations:
        web:
          allowedOrigins:
            - http://localhost:4200
```

This configuration sets the port of Embedded Server to 8084 (default is 8080) and enables CORS for the requests coming from http://localhost:4200 (Angular application).

Assemble the application using `mvn package` command; this will create a `greeter-api-0.1.jar` file in the `target` directory.

### Create a Docker image of the Micronaut application

You'll notice that the Micronaut CLI also generated a `Dockerfile` for the application. Open it and edit the base image from `adoptopenjdk/openjdk11-openj9:jdk-11.0.1.13-alpine-slim` to `adoptopenjdk:11-jre-openj9`. `Dockerfile` should now appear as follows.

```dockerfile
FROM adoptopenjdk:11-jre-openj9
COPY target/greeter-api-*.jar greeter-api.jar
EXPOSE 8084
CMD java -Dcom.sun.management.jmxremote -noverify ${JAVA_OPTS} -jar greeter-api.jar
```

To create a Docker image, execute the following command on your terminal.

```bash
docker build -t mflash/greeter_api .
```

## Create an Angular application

Generate an Angular application by executing the following command.

```bash
ng new greeter-ui --minimal=true --routing=false --skipTests=true --style=scss
```

This will generate an Angular application in a directory `greeter-ui`.

> **Note** that this command won't generate separate HTML template files, styles or specifications. For more information, refer to [Angular CLI docs](https://angular.io/cli/new).

Add `HttpClientModule` in `@NgModule imports` to provide support for calling REST APIs.

```typescript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Create a new service by executing the following command.

```bash
ng generate service Greeting
```

This will create a new `GreetingService` in a file `greeting.service.ts` in the `src/app` directory. Add a method `getGreeting` to fetch the greeting from the REST endpoint created earlier.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class GreetingService {
  constructor(private client: HttpClient) {}

  getGreeting() {
    return this.client.get("/hello?name=Microflash");
  }
}
```

> **Note** Use the relative path of the endpoint. Don't attach any host in front of it.

Edit `app.component.ts` to call `getGreeting` method and display the message on the UI:

```typescript
import { Component, OnInit } from "@angular/core";
import { GreetingService } from './greeting.service';

@Component({
  selector: "app-root",
  template: `
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            {{ message }}
          </h1>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  message: any;

  constructor(private greetingService: GreetingService) {}

  ngOnInit(): void {
    this.getMessage();
  }

  getMessage() {
    this.greetingService.getGreeting()
      .subscribe(response => (this.message = response["message"]));
  }
}
```

Build the application by executing `ng build --prod`. The build will be dumped in the `dist/greeter-ui` directory.

## Configure Nginx

This build can be served through Nginx. Create a file `default.conf` in the directory `greeter-ui/config`. Add the following configuration in the file:

```properties
server {
  listen 4200;

  sendfile on;

  default_type application/octet-stream;

  gzip on;
  gzip_http_version 1.1;
  gzip_disable "MSIE [1-6]\.";
  gzip_min_length 256;
  gzip_vary on;
  gzip_proxied expired no-cache no-store private auth;
  gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_comp_level 9;
  
  root /usr/share/nginx/html;
  
  location / {
    index index.html index.htm;
    try_files $uri $uri/ /index.html =404;
  }

  location /hello {
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    if ($request_method = 'OPTIONS') {
      add_header 'Access-Control-Max-Age' 1728000;
      add_header 'Content-Type' 'text/plain; charset=utf-8';
      add_header 'Content-Length' 0;
      return 204;
    }

    if ($request_method = "POST|GET") {
      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
    }

    proxy_pass http://greeter_api:8084;
  }
}
```

**Recall** that the host for calling the endpoint was not provided in the `GreetingService`. So, when `getGreeting` method will be called, `HttpClient` will resolve the path of the endpoint as `http://localhost:4200/hello`. This path will return an error if the application is run normally.

Nginx configuration above configures a proxy that will intercept all the calls to `/hello` endpoint and redirect it to `http://greeter_api:8084/hello` (which is the Docker URL for the REST endpoint created earlier). 

### Create a Docker image of the Angular application

Create a `Dockerfile` in your Angular application's root and add the following content.

```dockerfile
# Generate a build
FROM node:12-alpine as builder
WORKDIR /app
COPY . /app
RUN cd /app && npm install && npm run build

# Serve with Nginx
FROM nginx:1.17-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY config/default.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist/greeter-ui /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
```

This is a multistage `Dockerfile`. In the first stage, a production build of the Angular application will be created. In the second stage, the build will be copied under an Nginx folder and a port `4200` will be exposed.

> Don't forget to create a `.dockerignore` file and add `node_modules` and `dist` directories in it to avoid copying dependencies/build in the image.

To generate a Docker image, execute the following command on your terminal.

```bash
docker build -t mflash/greeter_ui .
```

## Configure Docker stack

Create a `docker-compose.yml` file in the project root and add the following configuration.

```yaml
version: '3.1'

services:
  greeter_ui:
    image: mflash/greeter_ui
    networks:
      - greeternet
    ports:
      - 4200:4200

  greeter_api:
    image: mflash/greeter_api
    networks:
      - greeternet

networks:
  greeternet:
    driver: bridge
```

Launch this stack by executing `docker-compose up -d` and access the UI at <http://localhost:4200> that should display the message from the endpoint.

## References

> **Source Code** &mdash; [docker-network-communication](https://github.com/Microflash/guides/tree/master/docker/docker-network-communication)
> 
> **Discussions**
> - [eisfuchs](https://stackoverflow.com/users/1565175/eisfuchs): [Inject env variables from docker-compose into Angular4 app](https://stackoverflow.com/a/45727380) 
> - Kalkman, Michiel: [Wide open nginx CORS configuration](https://michielkalkman.com/snippets/nginx-cors-open-configuration/)
> - Nginx Docs: [Choosing an Outgoing IP Address](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#choosing-an-outgoing-ip-address)