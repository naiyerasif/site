---
title: Docker Network Sharing
path: docker-network-sharing
date: 2019-07-07
summary: Create an Angular application that consumes a REST microservice using Docker Network URL, each running on separate Docker stacks
tags: ['docker', 'angular', 'micronaut', 'microservices']
---

## Objective

Create an Angular application that consumes a REST microservice using Docker Network URL, each running on separate Docker stacks.

> **Requisites**
> - Java 8 or higher
> - Node 12 or higher
> - Micronaut CLI (can be found at <http://micronaut.io/download.html>); a different framework can also be used. v1.1.3 was used in this example.
> - Angular CLI (run `npm install -g @angular/cli` or `yarn global add @angular/cli` to install it globally). v8.0.1 was used in this example.

## Create a REST endpoint

Execute the following command on your favorite terminal to generate a simple Micronaut app with Gradle support:

```bash
mn create-app com.mflash.app.greeter
```

This'll create a Java app in a folder **greeter** with a package **com.mflash.app**. For more information, refer to [this guide](http://guides.micronaut.io/creating-your-first-micronaut-app/guide/index.html).

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

  @Get("/") @Produces(MediaType.APPLICATION_JSON)
  public String greet() throws JsonProcessingException {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("message", "Hello, human!");
    return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
  }

}
```

Navigate to *src/main/resources* directory and edit **application.yml** as follows:

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
            - http://greeter_ui:4200
```

Here, a port for the application is being set (otherwise Micronaut will choose a random port every time it starts). Also, CORS is enabled for the requests coming from <http://greeter_ui:4200> which is the Angular host.

The REST endpoint is ready. Assemble the app using `gradle build` which would create a `greeter-0.1-all.jar` in *build/libs* directory. Create a Docker image by executing the following command (see [Dockerfile](./greeter/Dockerfile) for details):

```bash
docker build -t microflash/greeter .
```

## Create an Angular app

Create an Angular app by executing the following command:

```bash
ng new ng-greeter --skip-tests --inline-template
```

This will create an Angular app in a directory **ng-greeter**. Separate html files and test specifications will not be generated. For more information, refer to [Angular CLI wiki](https://github.com/angular/angular-cli/wiki/new). 

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

This will create a new `ApiService` in a file `api.service.ts` in the *src/app* directory. Add a method `getGreeting()` to fetch the greeting from the REST endpoint created above.

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

Build the app, by running `ng build --prod`. The build will be dumped in *dist/ng-greeter* directory.

## Configure Nginx

The build created in the previous step can be served through Nginx. Create a file `default.conf` in the directory *ng-greeter/config*. Add the following configuration in the file:

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

**Recall** that the host for calling the endpoint was not provided in the Angular app. So, when `getGreeting()` method will be called, `HttpClient` will resolve the path of the API as `http://localhost:4200/hello`. This path will obviously return an error if the app is run normally.

To resolve this path, a proxy is configured with Nginx which will intercept all calls to `/hello` endpoint and redirect it to `http://greeter:8084/hello` (which is the Docker's network url for the REST endpoint created above). 

## Configure Docker Stack

### Stack for the endpoint

After creating a docker image by executing the following command

```bash
docker build -t microflash/greeter .
```

a stack file can be configured as follows:

```yaml
version: '3.1'

services:
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

When the stack is deployed with the following command

```bash
docker-compose -f stack.yml up -d
```

a network `greeter_greeternet` will be created by Docker.

### Stack for the UI

For the UI, a build can be created through a [multistage Dockerfile](./ng-greeter/Dockerfile) by executing the following command

```bash
docker build -t microflash/greeter_ui .
```

and then a stack file can be created as follows:

```yaml
version: '3.1'

services:
  greeter_ui:
    image: microflash/greeter_ui
    container_name: greeter_ui
    networks:
      - uinet
    ports:
      - 4200:4200
    restart: always

networks:
  uinet:
    external:
      name: greeter_greeternet
```

**Note** that `uinet` refers to the external network `greeter_greeternet` created by service stack above. Accessing the UI at <http://localhost:4200> would display the message from the API.

## References

### Source Code

- [docker-network-communication](https://github.com/Microflash/bedrock/tree/master/docker/docker-network-communication)

### Discussions

- [cstrutton](https://stackoverflow.com/users/1311325/cstrutton): [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)
