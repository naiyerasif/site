---
title: 'Communicating with containers on Docker network'
date: 2018-08-05 12:06:01
updated: 2020-03-08 21:22:13
authors: [naiyer]
labels: [docker, micronaut, angular]
---

Say, you've an Angular app that talks to a backend service through a network. The Angular app and the service are running in separate containers, and these containers can be on the same Docker network or separate Docker networks. You don't want to expose any other container to the public except for the Angular one.

Let's run through some scenarios on how you can achieve this.

##### Setup

The examples in this post use

- Java 13
- Node 12
- Micronaut 1.3.2
- Angular 9
- Docker 19

## Prerequisites

Let's create a backend service with an endpoint that our Angular app can call. For the sake of demonstration, let's create a `Hello World` endpoint.

### Create an image for the backend

On a terminal, run 

```bash
mn create-app dev.mflash.guides.greeter.greeter-api --build maven
```

to generate a Micronaut app with Maven support. Import the app in an IDE.

> **INFO** Micronaut CLI will set the Java version in `pom.xml` with whatever is available on the PATH environment variable.

Create a class for greeting message.

```java
// greeter-api/src/main/java/dev/mflash/guides/greeter/Greeting.java

public class Greeting {

  private String message;

  // constructors, getters, setters, etc
}
```

Configure an endpoint, say `/hello`, that returns a `Greeting` object.

```java{6-9}
// greeter-api/src/main/java/dev/mflash/guides/greeter/GreetingController.java

@Controller("/hello")
public class GreetingController {

  @Get
  public Greeting greet(@QueryValue(value = "name", defaultValue = "World") String name) {
    return new Greeting(String.format("Hello, %s!", name));
  }
}
```

Enable CORS for the Angular app to let it communicate with the endpoint `/hello`. To do this, edit `application.yml` file and add the following configuration.

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

On the terminal, run

```bash
docker build -t mflash/greeter-api .
```

to build an image for the backend.

### Create an Angular image

Let's generate a very minimal Angular app with no routing, specifications or external templates. Run the following command on the terminal.

```bash
ng new greeter-ui --minimal --routing=false --style=css --skipTests --inlineStyle --inlineTemplate
```

> Refer to [`ng new` reference](https://angular.io/cli/new) for more information on these options.

Add `HttpClientModule` in the root module. This'll be used to call the backend service we just created.

```typescript{3, 6}
// greeter-ui/src/app/app.module.ts

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, HttpClientModule]
  // declarations, providers, bootstrap, etc
})
export class AppModule {}
```

Create a `GreetingService` by running the following command.

```bash
ng generate service Greeting
```

Add a method (`getGreeting`) to call the backend service.

```typescript{9-11}
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

> **TIP** Don't attach any host in front of the endpoint.

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

Once you've built the app by `ng build --prod`, you'd need a server to serve the application. Let's use [Nginx](https://nginx.org/) for this purpose.

Create a `default.conf` file in the root of the Angular app and add the following configuration.

```properties
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

Don't worry too much about this configuration; it just instructs `nginx` to
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

> **TIP** Create a `.dockerignore` file in the root of the Angular project and add `node_modules` and `dist` directories in it to prevent Docker from copying them while creating the image.

Generate the image by running the following command.

```bash
docker build -t mflash/greeter-ui .
```

## Scenarios

Now that we're done with the prerequisites, let's run a few scenarios.

### Containers on the same network

Create a compose file and add the following configuration.

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

> Note that only `greeter-ui` has been exposed publicly.

Launch this stack by executing `docker-compose up -d` and browse to <http://localhost:4200>. You'll get something like this.

![Greeter UI](./images/2018-08-05-communicating-with-containers-on-docker-network-01.png)

Unfortunately, we're not getting the message from the backend service. A quick look on the networks tab on Devtools reveals that we're getting a `502 Bad Gateway` for the request at <http://0.0.0.0:8084/hello?name=Microflash>. That's because Docker assigns some randome host to a service; in this case, it is not `0.0.0.0`.

To resolve this issue, open `default.conf` file and replace the host `0.0.0.0` in the `proxy_pass` value with the service name you specified in `docker-compose.yml` (in our case, it's `greeter-api`).

```properties{9}
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

![Greeter UI](./images/2018-08-05-communicating-with-containers-on-docker-network-02.png)

### Containers on different networks

But what if the containers are running on different networks? The service url <http://greeter-api:8084> won't work unless the containers share the same network. Let's see how we can make it work.

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

Launch both the stacks with `docker-compose up -d` and browse to <http://localhost:4200>. You should see the expected message on the browser window.

## References

**Source code** &mdash; [communicating-with-containers-on-docker-network](https://gitlab.com/mflash/docker-guides/-/tree/master/communicating-with-containers-on-docker-network)

**See also**

- [Inject env variables from docker-compose into Angular4 app](https://stackoverflow.com/a/45727380)
- [Communication between multiple docker-compose projects](https://stackoverflow.com/questions/38088279/communication-between-multiple-docker-compose-projects)
- [Wide open nginx CORS configuration](https://michielkalkman.com/snippets/nginx-cors-open-configuration/)
- [Choosing an Outgoing IP Address](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#choosing-an-outgoing-ip-address)
