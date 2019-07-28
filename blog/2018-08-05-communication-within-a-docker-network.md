---
title: Communication within a Docker network
path: communication-within-a-docker-network
date: 2018-08-05
updated: 2019-07-06
author: [naiyer]
summary: Create an Angular application that consumes a REST endpoint, both running on a Docker stack
tags: ['guide', 'docker', 'angular', 'micronaut', 'microservices']
---

## Intent

You need to create an Angular application which consumes a REST endpoint, both running as containers on a Docker stack. Only the Angular application is publicly accessible; rest of the containers aren't exposed outside the Docker network.

When you're serving the static build (e.g., production build) of an Angular application over Express or Nginx, there should be a mechanism to resolve the other services running on the same Docker stack through their Docker URLs. You'll get to know one way of achieving this here. 

### Setup

> This guide uses
> - Java 8
> - Node 12
> - [Micronaut](http://micronaut.io/download.html) 1.1.3
> - Angular 8

## Create a REST endpoint

Execute the following command on your favorite terminal to generate a simple Micronaut app with Gradle support:

```bash
mn create-app com.mflash.app.greeter
```

This'll generate a Java application in a directory `greeter` with a package `com.mflash.app`. For more information, refer to [this guide](http://guides.micronaut.io/creating-your-first-micronaut-app/guide/index.html).

Create a `GreeterController` in `com.mflash.app` package, which returns a JSON with a key `message`.

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Produces;

@Controller("/hello")
public class GreeterController {

  @Get @Produces(MediaType.APPLICATION_JSON)
  public String greet() throws JsonProcessingException {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("message", "Hello, human!");
    return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
  }
}
```

Navigate to `src/main/resources` directory and edit **application.yml** as follows:

```yaml
micronaut:
  application:
    name: greeter
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
- sets a port for the Micronaut application (If you won't do this, Micronaut will choose a random port every time it starts)
- enables CORS for the requests coming from <http://localhost:4200> (the Angular application)

That's it! Assemble the app using `gradle build`. This will create a `greeter-0.1-all.jar` in `build/libs` directory. Create a Docker image by executing the following command (see the [Dockerfile](https://github.com/Microflash/bedrock/blob/master/docker/docker-network-communication/greeter/Dockerfile) for details):

```bash
docker build -t microflash/greeter .
```

## Create an Angular application

Generate an Angular application by executing the following command:

```bash
ng new ng-greeter --skip-tests --inline-template
```

This will create an Angular app in a directory `ng-greeter`.

> **Note** that this command doesn't generate separate HTML files or test specifications. For more information, refer to [Angular CLI wiki](https://github.com/angular/angular-cli/wiki/new).

Add `HttpClientModule` in `@NgModule imports` to provide support for calling REST APIs.

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Create a new service by executing the following command:

```bash
ng generate service Api
```

This will create a new `ApiService` in a file `api.service.ts` in the `src/app` directory. Add a method `getGreeting()` to fetch the greeting from the REST endpoint created earlier.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private client: HttpClient) { }

  getGreeting() {
    return this.client.get("/hello");
  }
}
```

> **Note** Use the relative path of endpoint. Don't attach any host in front of it.

Edit `app.component.ts` to call `getGreeting()` method and display the message on the UI:

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  template: `
    <div>
      {{message}}
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  message: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getMessage();
  }

  getMessage() {
    this.apiService.getGreeting().subscribe(response => this.message = response["message"]);
  }
}
```

Build the app by executing `ng build --prod`. The build will be dumped in `dist/ng-greeter` directory.

## Configure Nginx

This build can be served through Nginx. Create a file `default.conf` in the directory `ng-greeter/config`. Add the following configuration in the file:

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

    proxy_pass http://greeter:8084;
  }
}
```

**Recall** that the host for calling the API was not provided in the Angular app. So, when `getGreeting()` method will be called, `HttpClient` will resolve the path of the API as `http://localhost:4200/hello`. This path will obviously return an error if the app is run normally.

To resolve this path, a proxy is configured with Nginx which will intercept all the calls to `/hello` endpoint and redirect it to `http://greeter:8084/hello` (which is the Docker URL for the REST endpoint created earlier). 

## Configure Docker stack

Exactly how you want run a Docker stack depends on your development workflow. However, the following considerations are worth mentioning.

### Development

Assuming the builds in Development environment to be pretty frequent, the build creation can be delegated to Node.js on the environment itself and the build directories can be mapped through volumes.

Create a `stack-dev.yml` file in the parent directory of both `greeter` and `ng-greeter` directories. Add the following configuration:

```yaml
version: '3.1'

services:
  nginx:
    image: nginx:1.15-alpine
    container_name: greeter_server
    networks:
      - greeternet
    ports:
      - 4200:4200
    volumes:
      - ./ng-greeter/config:/etc/nginx/conf.d/
      - ./ng-greeter/dist/ng-greeter:/usr/share/nginx/html
    restart: always

  greeter:
    image: microflash/greeter
    container_name: greeter_service
    networks:
      - greeternet
    restart: always

networks:
  greeternet:
    driver: bridge
```

This configuration
- creates a common network `greeternet` for Nginx and Greeter service
- exposes only Nginx outside the container, ensuring that no API URLs are visible from the browser, since they'll be internally resolved by Nginx.

Launch this stack by executing `docker-compose -f stack-dev.yml up -d`. Access the UI at <http://localhost:4200> where the message from the endpoint should be displayed.

### Production

For production, the build can be created through a [multistage Dockerfile](https://github.com/Microflash/bedrock/blob/master/docker/docker-network-communication/ng-greeter/Dockerfile) by executing the following command:

```bash
docker build -t microflash/greeter_ui .
```

Now, create a `stack.yml` and add the following configuration:

```yaml
version: '3.1'

services:
  greeter_ui:
    image: microflash/greeter_ui
    container_name: greeter_ui
    networks:
      - greeternet
    ports:
      - 4200:4200
    restart: always

  greeter:
    image: microflash/greeter
    container_name: greeter_service
    networks:
      - greeternet
    restart: always

networks:
  greeternet:
    driver: bridge
```

In this case, you don't need any volumes because everything is already in the container. Once again, launch the stack by executing `docker-compose -f stack.yml up -d` and access the UI at <http://localhost:4200> that should display the message from the endpoint.

## References

> **Source Code** &mdash; [docker-network-sharing](https://github.com/Microflash/bedrock/tree/master/docker/docker-network-sharing)
> 
> **Discussions**
> - [eisfuchs](https://stackoverflow.com/users/1565175/eisfuchs): [Inject env variables from docker-compose into Angular4 app](https://stackoverflow.com/a/45727380) 
> - Kalkman, Michiel: [Wide open nginx CORS configuration](https://michielkalkman.com/snippets/nginx-cors-open-configuration/)
> - Nginx Docs: [Choosing an Outgoing IP Address](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#choosing-an-outgoing-ip-address)