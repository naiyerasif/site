---
slug: "2018/08/05/communicating-with-containers-on-docker-network"
title: "Communicating with containers on Docker network"
description: "Say, you’ve an Angular application that talks to a service through a network. Both of them are running in separate containers, which can be on the same or different docker stack. How would you keep the service privately accessible only to the Angular application which is exposed to the host?"
date: "2018-08-05 12:06:01"
update: "2020-03-08 21:22:13"
category: "guide"
tags: ["containers", "docker", "network"]
---

Say, you've an Angular app that talks to a backend service through a network. Both of them are running in separate containers, which can be on the same or different Docker stack(s). You want only the Angular container to be publicly accessible through a port.

Let's run through some scenarios on how you can achieve this.

:::setup
The examples in this post use

- Java 13
- Node 12
- Micronaut 1.3.2
- Angular 9
- Docker 19
:::

We'd need an Angular app and a backend service to begin with.

## Create a backend service

Let's create a very simple backend that will return a greeting message when a `/hello` endpoint will be called. We'll use [Micronaut](https://micronaut.io/) to generate this service. [Install](https://micronaut.io/download.html) Micronaut CLI and execute the following command on the terminal.

```sh prompt{1}
mn create-app dev.mflash.guides.greeter.greeter-api --build maven
```

This will generate a basic Micronaut app with Maven support. Import this app in your favorite IDE.

:::note
Micronaut CLI will set the Java version in `pom.xml` with the one available on the PATH environment variable.
:::

Create a class for greeting message.

```java
// greeter-api/src/main/java/dev/mflash/guides/greeter/Greeting.java

public class Greeting {

  private String message;

  // constructors, getters, setters, etc
}
```

Configure an endpoint, say `/hello`, that returns a `Greeting` object.

```java {6-9}
// greeter-api/src/main/java/dev/mflash/guides/greeter/GreetingController.java

@Controller("/hello")
public class GreetingController {

  @Get
  public Greeting greet(@QueryValue(value = "name", defaultValue = "World") String name) {
    return new Greeting(String.format("Hello, %s!", name));
  }
}
```

To let the Angular app call this endpoint, we'll have to enable CORS. To do this, edit `application.yml` file and add the following configuration.

```yaml
# greeter-api/src/main/resources/application.yml

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
            - http://0.0.0.0:4200
```

This backend will run on an embedded server on the port `8084` and will accept all the requests coming from `http://0.0.0.0:4200`.

Edit the `Dockerfile` in the project root and overwrite it with the following configuration.

```dockerfile
# greeter-api/Dockerfile

FROM maven:3.6.1-jdk-13-alpine as builder
WORKDIR /usr/home/greeter
COPY . .
RUN mvn package

FROM adoptopenjdk/openjdk13-openj9:jre-13.0.2_8_openj9-0.18.0-alpine
COPY --from=builder /usr/home/greeter/target/greeter-api-*.jar greeter-api.jar
EXPOSE 8084
CMD ["java", "-jar", "greeter-api.jar"]
```

To build a Docker image, execute the following command on the terminal.

```sh
docker build -t mflash/greeter-api .
```

## Create an Angular app

For the sake of example, let's generate a very minimal Angular app with no routing, specifications or external templates. Execute the following command on the terminal.

```sh
ng new greeter-ui --minimal --routing=false --style=css --skipTests --inlineStyle --inlineTemplate
```

> Refer to [`ng new` reference](https://angular.io/cli/new) for more information on these options.

To call the REST endpoint, we'll need `HttpClientModule`. Add it in the root module of the Angular app.

```typescript {3, 6}
// greeter-ui/src/app/app.module.ts

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, HttpClientModule]
  // declarations, providers, bootstrap, etc
})
export class AppModule {}
```

Create a `GreetingService` by executing the following command.

```sh
ng generate service Greeting
```

Add a method (`getGreeting`) to call the backend service.

```typescript {9-11}
// greeter-ui/src/app/greeting.service.ts

@Injectable({
  providedIn: 'root'
})
export class GreetingService {
  constructor(private client: HttpClient) {}

  getGreeting() {
    return this.client.get('/hello?name=Microflash');
  }
}
```

:::assert
Don't add any host in front of the endpoint.
:::

Edit `AppComponent` to display the greeting message.

```typescript
// greeter-ui/src/app/app.component.ts

@Component({
  selector: 'app-root',
  template: `
    <main>{{ message }}</main>
  `,
  styles: []
})
export class AppComponent {
  message: string = 'Hello, stranger!';

  constructor(private greetingService: GreetingService) {}

  ngOnInit(): void {
    this.getMessage();
  }

  getMessage() {
    this.greetingService.getGreeting()
      .subscribe(response => (this.message = response['message']));
  }
}
```

To serve the production build of this app, we can use [Nginx](https://nginx.org/). Create a `default.conf` file in the root of the Angular app and add the following configuration.

```conf
# greeter-ui/default.conf

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

    proxy_pass http://0.0.0.0:8084;
  }
}
```

Don't worry too much about this configuration; it instructs `nginx` to

- listen for any requests at port `4200`
- serve files from a directory `/usr/share/nginx/html`
- serve `index.html` at `/`
- redirect the requests coming at `/hello` to `http://0.0.0.0:8084/hello`

The last point is important where `nginx` will serve as a proxy for the backend service.

Create a `Dockerfile` in the root of the Angular project and add the following.

```dockerfile
# greeter-ui/Dockerfile

# Generate a build
FROM node:12-alpine as builder
WORKDIR /app
COPY . /app
RUN yarn
RUN yarn build

# Serve with Nginx
FROM nginx:1.17-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist/greeter-ui /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
```

:::assert{title=Tip}
Create a `.dockerignore` file in the root of the Angular project and add `node_modules` and `dist` directories in it to prevent Docker from copying them while creating the image.
:::

Generate the image by running the following command.

```sh
docker build -t mflash/greeter-ui .
```

## Scenario 1: Containers on the same Docker stack

Consider the first scenario where the Angular app and the backend service are running on the same Docker stack. Create a compose file and add the following configuration. 

```yaml
# scenario-1-on-the-same-network/docker-compose.yml

version: '3'

services:
  greeter-ui:
    image: mflash/greeter-ui
    networks:
      - greeternet
    ports:
      - 4200:4200

  greeter-api:
    image: mflash/greeter-api
    networks:
      - greeternet

networks:
  greeternet:
    driver: bridge
```

> Note that only `greeter-ui` is exposed publicly.

Launch this stack by executing `docker-compose up -d` and browse to <http://localhost:4200>. You'll see the following message displayed on the browser window.

![Greeter UI](/images/post/2018/2018-08-05-12-06-01-communicating-with-containers-on-docker-network-01.png)

This is the default greeting message; we're not getting the message from the backend service. A quick look on the Networks tab in Devtools reveals that we're getting a `502 Bad Gateway` for the request at <http://0.0.0.0:8084/hello?name=Microflash>. That's because Docker assigns some random host to a service; in this case, it is not `0.0.0.0`.

To resolve this issue, open `default.conf` file and replace the host `0.0.0.0` in the `proxy_pass` value with the service name you specified in `docker-compose.yml` (in our case, it's `greeter-api`).

```conf {9}
# greeter-ui/default.conf

server {
  # other configurations

  location /hello {
    # other configurations

    proxy_pass http://greeter-api:8084;
  }
}
```

Rebuild the `greeter-ui` image, launch the stack again and browse to <http://localhost:4200>. You'd see the expected greeting message.

![Greeter UI](/images/post/2018/2018-08-05-12-06-01-communicating-with-containers-on-docker-network-02.png)

## Scenario 2: Containers on different Docker stacks

The service url <http://greeter-api:8084> won't work unless the containers share the same network. For the containers running on different Docker stacks, we can configure them to connect through the same network.

Create a compose file and add the following configuration for the backend service.

```yaml
# scenario-2-on-different-networks/greeter-api/docker-compose.yml

version: '3'

services:
  greeter-api:
    image: mflash/greeter-api
    networks:
      - greeternet

networks:
  greeternet:
    driver: bridge
```

In this file, we're specifying the backend service and the network `greeternet` associated with this stack.

Create another compose file and add the following configuration for the Angular app.

```yaml
# scenario-2-on-different-networks/greeter-ui/docker-compose.yml

version: '3'

services:
  greeter-ui:
    image: mflash/greeter-ui
    networks:
      - uinet
    ports:
      - 4200:4200

networks:
  uinet:
    external:
      name: greeter-api_greeternet
```

In this file, we're declaring the Angular app exposed over the port `4200` and the network `uinet` which is nothing but a reference for `greeternet`. This will ensure that the services on both the stacks can talk to each other over the network `greeternet`.

Launch both the stacks with `docker-compose up -d` and browse to <http://localhost:4200>. You would see the expected message on the browser window.

---

**Source code**

- [communicating-with-containers-on-docker-network](https://github.com/Microflash/guides/tree/main/cloud/communicating-with-containers-on-docker-network)

**Related**

- [Inject env variables from docker-compose into Angular4 app](https://stackoverflow.com/a/45727380)
- [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)
- [Wide open nginx CORS configuration](https://michielkalkman.com/snippets/nginx-cors-open-configuration/)
- [Choosing an Outgoing IP Address](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#choosing-an-outgoing-ip-address)
