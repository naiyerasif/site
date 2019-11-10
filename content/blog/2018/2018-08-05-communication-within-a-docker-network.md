---
title: Communication within a Docker network
path: /communication-within-a-docker-network
date: 2018-08-05
updated: 2019-11-11
author: [naiyer]
tags: ['guide']
---

When you are doing microservices, it is typical to run multiple Docker containers on a stack. It is also very typical to specify how these containers are exposed to each other and to the public. To illustrate this guide, consider a REST endpoint backed by [Micronaut](http://micronaut.io/) and an Angular application, running as containers on a Docker stack. Ideally, only the Angular application should be publicly accessible. In this guide, we'll explore how to address this usecase.

### Setup

> We'll use:
> - Java 11
> - Node 12
> - Micronaut 1.2.2
> - Angular 8
> - Docker Engine 19

We'll serve a production build of the Angular application on an [Nginx](https://nginx.org/) container. And we'll configure this container to communicate privately with the REST endpoint on a Docker network.

### Table of Contents

## Create a REST endpoint

Execute the following command on your favorite terminal to generate a Micronaut application with Maven support.

```sh
mn create-app dev.mflash.guides.greeter.greeter-api --build maven
```

This command will generate a Micronaut application with Java support in a `greeter-api` directory with a package `dev.mflash.guides.greeter`. Import this application in your favorite IDE.

> **Note** Micronaut CLI detects the available version of Java using the PATH. If Java 11 is available on your PATH, the variable `java.version` in the `pom.xml` file will be set to 11.

Say, you want to display a greeting message on the Angular application. Let's define a class that would wrap this message.

```java
public class Greeting {

  private String message;

  // constructors, getters, setters, etc
}
```

Configure an endpoint, say `/hello`, through a Controller to return an object of type `Greeting`.

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

Enable CORS for the Angular application so that it could communicate with this endpoint. Open `application.yml` file and add the following configuration.

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

This configuration 

- sets the port of Embedded Server to 8084 (default is 8080), and 
- enables CORS for the requests coming from http://localhost:4200 (Angular application).

Assemble the application using `mvn package` command. This will create a `greeter-api-0.1.jar` file in the `target` directory.

### Create a Docker image of the Micronaut application

You'll notice that the Micronaut CLI also generated a `Dockerfile` for the application. Open it and edit the base image from `adoptopenjdk/openjdk11-openj9:jdk-11.0.1.13-alpine-slim` to `adoptopenjdk:11-jre-openj9`. That's because we just need to launch a JAR file on a Java runtime; we don't need the entire JDK to do this.

```dockerfile
FROM adoptopenjdk:11-jre-openj9
COPY target/greeter-api-*.jar greeter-api.jar
EXPOSE 8084
CMD java -Dcom.sun.management.jmxremote -noverify ${JAVA_OPTS} -jar greeter-api.jar
```

To create the image, execute the following command on your terminal.

```bash
docker build -t mflash/greeter_api .
```

## Create an Angular application

Generate an Angular application by executing the following command.

```bash
ng new greeter-ui --minimal=true --routing=false --skipTests=true --style=scss
```

This will generate an Angular application in a directory `greeter-ui`.

> **Note** that this command won't generate separate HTML templates, stylesheets or specifications. For more information, refer to [Angular CLI docs](https://angular.io/cli/new).

To call the REST endpoint, we'd need `HttpClientModule`. Add it in the `imports` of `@NgModule` decorator of `AppModule`.

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

Create a `GreetingService` by executing the following command.

```bash
ng generate service Greeting
```

Add a method `getGreeting` to fetch the greeting from the REST endpoint.

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

Since we haven't provided a host for calling the endpoint `/hello`, the `HttpClient` will pass the request to `http://localhost:4200/hello` when the `getGreeting` method will be called. This URL will return Error 404.

We need to configure a proxy that will intercept all the calls to `/hello` endpoint and redirect it to `http://greeter_api:8084/hello` (which is the Docker URL of the Micronaut REST endpoint). Create a file `default.conf` in the directory `greeter-ui/config` and add the following configuration.

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

### Create a Docker image of the Angular application

To access the Angular application, we'll have to create a production build and serve it in an Nginx container. Create a `Dockerfile` in your Angular application's root and add the following content.

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

This is a [multistage](https://docs.docker.com/develop/develop-images/multistage-build/) `Dockerfile`. 

- In the first stage, a production build of the Angular application will be created. 
- In the second stage, the build will be copied under an Nginx folder and a port `4200` will be exposed.  

> Don't forget to create a `.dockerignore` file and add `node_modules` and `dist` directories in it to avoid copying dependencies/build files in the image.

To generate the image, execute the following command on your terminal.

```bash
docker build -t mflash/greeter_ui .
```

## Configure the Docker stack

To launch the containers, create a Docker stack file `docker-compose.yml` in the project root and add the following configuration.

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

Launch this stack by executing `docker-compose up -d`. Browse to <http://localhost:4200> where the message from the endpoint should be displayed.

## References

> **Source Code**: [docker-network-communication](https://github.com/Microflash/guides/tree/master/docker/docker-network-communication)
> 
> **Discussions**
> - [eisfuchs](https://stackoverflow.com/users/1565175/eisfuchs): [Inject env variables from docker-compose into Angular4 app](https://stackoverflow.com/a/45727380) 
> - Kalkman, Michiel: [Wide open nginx CORS configuration](https://michielkalkman.com/snippets/nginx-cors-open-configuration/)
> - Nginx Docs: [Choosing an Outgoing IP Address](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#choosing-an-outgoing-ip-address)