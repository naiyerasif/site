---
title: Network sharing between different Docker containers
path: network-sharing-between-different-docker-containers
date: 2018-10-24
updated: 2019-08-17
author: [naiyer]
summary: Create two containers on separate Docker stacks with a capability to communicate through same Docker network
tags: ['guide', 'docker', 'angular', 'nodejs', 'microservices']
---

## Intent

The intent of this guide is to create two separate containers managed under separate Docker stacks but communicating through same Docker network.

### Setup

> This guide uses
> - Node 12
> - Angular 8
> - Docker Engine 19

### Table of Contents

## Create a REST endpoint

Create an Express application by executing the following commands.

```bash
mkdir greeter
cd greeter
npm init -y
```

Add `express`, `body-parser` and `cors` to the project.

```bash
npm i express body-parser cors
```

Create a route in a file `src/routes/hello.routes.js`.

```js
module.exports = {
  register: (app) => {
    app.get(`/hello`, (req, res) => {
      res.status(200).jsonp({
        message: "Hello, human!"
      })
    });
  }
}
```

Add this route in a route collector file `src/routes/index.js`.

```js
const helloRoutes = require('./hello.routes');

module.exports = {
  register: (app) => {
    console.log("Registering the routes");
    helloRoutes.register(app);
  }
}
```

Create an `express` server in `src/index.js` file.

```js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes/index');

const port = process.env.SERVER_PORT;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// register all routes
routes.register(app);

// start the express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
```

### Create a Docker image of Greeter API

Use the following `Dockerfile` to build an image.

```dockerfile
FROM node:alpine
WORKDIR /app
COPY . /app
RUN cd /app && yarn
EXPOSE 8084
CMD ["yarn", "start"]
```

> Make sure to create a `.dockerignore` file and add `node_modules` directory in it to avoid copying dependencies in the image. Also, note that the endpoints will be exposed at port `8084`.

Use the following command to build the image.

```bash
docker build -t mflash/greeter_api .
```

## Create an Angular application

Create an Angular application by executing the following command:

```bash
ng new ng-greeter --skip-tests --inline-template
```

This will create the Angular application in a directory `ng-greeter`. 

> **Note** that html files and specifications will not be generated separately. For more information, refer to [Angular CLI wiki](https://github.com/angular/angular-cli/wiki/new). 

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

This will create a new `ApiService` in a file `api.service.ts` in the `src/app` directory. Add a method `getGreeting()` to fetch the greeting from the REST endpoint created previously.

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

Build the app by running `ng build --prod`. The build will be dumped in `dist/ng-greeter` directory.

### Configure Nginx

The build created in the previous step can be served through Nginx. Create a file `default.conf` in the directory `ng-greeter/config`. Add the following configuration in the file:

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

**Recall** that the host for calling the endpoint was not provided in the Angular application. So, when `getGreeting()` method will be called, `HttpClient` will resolve the path of the API as `http://localhost:4200/hello`. This path will obviously return an error if the app is run normally.

To resolve this path, a proxy is configured with Nginx which will intercept all calls to `/hello` endpoint and redirect it to `http://greeter:8084/hello` (which is the Docker's network url for the REST endpoint created above). 

### Create a Docker image of Greeter UI

Use the following `Dockerfile` to build an image.

```dockerfile
# Generate a build
FROM node:alpine as builder
WORKDIR /app
COPY . /app
RUN cd /app && yarn && yarn build

# Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY config/default.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist/ng-greeter /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
```

> Make sure to create a `.dockerignore` file and add `node_modules` and `dist` directories in it to avoid copying dependencies/build in the image. Also, note that this is a multi-stage `Dockerfile`; the first stage creates a production build of the Angular application and the second stage copies the build and serves it through Nginx.

Use the following command to build the image.

```bash
docker build -t mflash/greeter_ui .
```

## Configure Docker Stack

Use the following setup to configure the stack for Greeter API in a `greeter/docker-compose.yml` file.

```yaml
version: '3.1'

services:
  greeter:
    image: mflash/greeter_api
    container_name: greeter_api
    environment:
      SERVER_PORT: 8084
    networks:
      - greeternet

networks:
  greeternet:
    driver: bridge
```

When you'll launch this stack through `docker-compose up -d`, a Docker network called `greeter_greeternet` will be created. You'll have to launch Greeter UI in the same network to enable the Angular application call the API.

> **Note** that the port `8084` for `express` is being configured through an environment variable `SERVER_PORT`.

For the Greeter UI, configure the stack as follows (in a `ng-greeter/docker-compose.yml` file):

```yaml
version: '3.1'

services:
  greeter_ui:
    image: mflash/greeter_ui
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

> **Note** that `uinet` is being pointed to `greeter_greeternet` which was created by the previous stack. 

Launch this stack using `docker-compose up -d` and access the application at <http://localhost:4200> in a browser. You should see a message `Hello, human!` displayed in the browser window.

## References

> **Source Code** &mdash; [docker-network-sharing](https://github.com/Microflash/bedrock/tree/master/docker/docker-network-sharing)
> 
> **Discussions**
> - [cstrutton](https://stackoverflow.com/users/1311325/cstrutton): [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)