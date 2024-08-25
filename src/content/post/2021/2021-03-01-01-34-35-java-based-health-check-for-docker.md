---
slug: "2021/03/01/java-based-health-check-for-docker"
title: "Java-based health check for Docker"
description: "When you launch a container, Docker maintains its status as it transitions between several states. These states are tracked through the server events. Learn how to customize this behavior to more accurately provide health status of a Java application running on Tomcat."
date: "2021-03-01 01:34:35"
update: "2021-09-02 16:20:56"
category: "guide"
tags: ["docker", "healthcheck", "java", "distroless"]
---

When you launch a container, Docker maintains its status as it transitions between several states. When you list the containers (using `docker ps` or `docker container ls`), the status of those states is displayed under `CREATED` and `STATUS` labels. These states are tracked through the server events; you can list them in real-time using the [`docker events`](https://docs.docker.com/engine/reference/commandline/events/) command.

For our usecase, consider an example of a Spring Boot application that uses
- Tomcat as the embedded server, by including `spring-boot-starter-web` as a dependency
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready) to expose a health endpoint that shows application health information, by including `spring-boot-starter-actuator` as a dependency

You can create a Docker image of the above application (with `docker build . -t endpoint` command) using the following Dockerfile.

```dockerfile
FROM adoptopenjdk/openjdk11:alpine-jre
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

When you launch the container of the above-mentioned image (e.g., through `docker run -p 8080:8080 endpoint:latest`) and list it using `docker ps`, you may get a listing like this.

```sh
$ docker ps --filter ancestor=endpoint:latest
CONTAINER ID   IMAGE             COMMAND               CREATED         STATUS         PORTS                    NAMES
2adf5b17ceb0   endpoint:latest   "java -jar app.jar"   2 minutes ago   Up 2 minutes   0.0.0.0:8080->8080/tcp   elastic_cray
```

Even though this is a lot of useful information, you get no idea whether or not the Tomcat server is up until you access the application itself or ping the health endpoint (i.e., `http://localhost:8080/actuator/health` by default) exposed by the actuator. Wouldn't it be useful if Docker knows about the status through this health endpoint and uses this information to determine if the container is healthy? 

## Docker `HEALTHCHECK` instruction

That's where the Docker `HEALTHCHECK` instruction comes into the picture. When the container is up and running, you can ping the health endpoint and get the status of the application as follows.

```sh
$ curl http://localhost:8080/actuator/health
{"status":"UP"}
```

You can add a rudimentary health check using this endpoint in the Dockerfile as follows.

```dockerfile {7}
FROM adoptopenjdk/openjdk11:alpine-jre
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
HEALTHCHECK --interval=25s --timeout=3s --retries=2 CMD wget --spider http://localhost:8080/actuator/health || exit 1
```

Here, the `HEALTHCHECK` instruction specifies that after 25 seconds when the container has started, the command `wget --spider http://localhost:8080/actuator/health || exit 1` should be executed. Docker will wait for 3 seconds for the command to return and retry 2 times if it fails on previous tries. If the final exit code is 1, the container will be marked as `unhealthy`; if the exit code is 0, it will be marked as `healthy`. This status will appear when you execute `docker ps`.

```sh {7}
$ docker ps --filter ancestor=endpoint:latest
CONTAINER ID   IMAGE             COMMAND               CREATED          STATUS                             PORTS                    NAMES
620970808ed0   endpoint:latest   "java -jar app.jar"   22 seconds ago   Up 21 seconds (health: starting)   0.0.0.0:8080->8080/tcp   gallant_dijkstra

$ docker ps --filter ancestor=endpoint:latest
CONTAINER ID   IMAGE             COMMAND               CREATED          STATUS                    PORTS                    NAMES
620970808ed0   endpoint:latest   "java -jar app.jar"   49 seconds ago   Up 48 seconds (healthy)   0.0.0.0:8080->8080/tcp   gallant_dijkstra
```

> I'm using `wget` here but you can also use `curl` if it is available in your container.

This way Docker's `HEALTHCHECK` instruction bubbles up the health information by telling Docker if the container is working.

The biggest problem with this specific approach is that it relies on `wget` or `curl`. What if none of these utilities are available in the container? This is a possible scenario when you use a [distroless image](https://github.com/GoogleContainerTools/distroless); the only thing that would be available in such an image would be the Java tooling (JDK or JRE). How can we create a health check in such a scenario? This post explores the solution to this question.

## Single-file programs using Java 11

Java 11 introduced the ability to run a Java program in a [single file](https://www.infoq.com/articles/single-file-execution-java11/) directly through `java` command without compiling it using `javac`. In short, you can write a Java program like this one,

```java
public class Greeter {

  public static void main(String[] args) {
    System.out.println("Hello, world!");
  }
}
```

and run it by executing the following command.

```sh
$ java Greeter.java
Hello, world!
```

Please note that the `java` command uses the Java compiler (available in the `jdk.compiler` module) to compile and run a single-file program under the hood. This is essential to note because many Docker images based on the JRE don't ship with the `jdk.compiler` module. In such cases, you'll have to compile the single-file program beforehand to run it in the container.

## Java HTTP Client

Java 11 also introduced an [HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html) to request HTTP resources over the network. You can use this to call the actuator endpoint and perform some validations on the response. Here's an example.

```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;

public class HealthCheck {

  public static void main(String[] args) throws InterruptedException, IOException {
    var client = HttpClient.newHttpClient();
    var request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:8080/actuator/health"))
        .header("accept", "application/json")
        .build();

    var response = client.send(request, BodyHandlers.ofString());

    if (response.statusCode() != 200 || !response.body().contains("UP")) {
      throw new RuntimeException("Healthcheck failed");
    }
  }
}
```

In the above program, we
- make a call to the actuator endpoint using the `HttpClient`
- verify if the status code of the response is 200 and if the response contains the string `UP` or not

The `BodyHandlers` class provides several static methods that return useful `HttpResponse.BodyHandler` instances. The `BodyHandlers.ofString()` is one such method that returns a `HttpResponse.BodyHandler<String>` from which the response body can be accessed as a `String`.

> You can also implement the `HttpResponse.BodyHandler` interface to deserialize the response into a Java object and perform even fancier validations on the response (e.g., database and filesystem health checks).

## Docker `HEALTHCHECK` instruction using a single-file Java program

Using the `HealthCheck` single-file Java program above, we can declare a `HEALTHCHECK` instruction for a distroless image as follows.

```dockerfile {3, 6}
FROM gcr.io/distroless/java:11
COPY target/*.jar app.jar
COPY HealthCheck.java .
EXPOSE 8080
CMD ["app.jar"]
HEALTHCHECK --interval=25s --timeout=3s --retries=2 CMD ["java", "HealthCheck.java", "||", "exit", "1"]
```

While using a distroless image, you need to specify the `ENTRYPOINT` or `CMD` commands in their *exec* (JSON array) form because the distroless images don't contain a shell to launch. 

Once you launch the container, you can check the status through `docker ps` as follows.

```sh
$ docker ps --filter ancestor=endpoint:latest
CONTAINER ID   IMAGE             COMMAND                  CREATED          STATUS                             PORTS                    NAMES
769e8404b96e   endpoint:latest   "/usr/bin/java -jar …"   24 seconds ago   Up 24 seconds (health: starting)   0.0.0.0:8080->8080/tcp   serene_cerf

$ docker ps --filter ancestor=endpoint:latest
CONTAINER ID   IMAGE             COMMAND                  CREATED              STATUS                        PORTS                    NAMES
769e8404b96e   endpoint:latest   "/usr/bin/java -jar …"   About a minute ago   Up About a minute (healthy)   0.0.0.0:8080->8080/tcp   serene_cerf
```

This approach eliminates the need for any utility (like `curl` or `wget`) and relies solely on the Java tooling available in the image. It is also portable because it works irrespective of the operating system or underlying base of the image.

---

**Source code**

- [docker-healthcheck](https://github.com/Microflash/guides/tree/main/java/docker-healthcheck)

**Related**

- [Dockerfile HEALTHCHECK reference](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Running Single-file Programs without Compiling in Java 11](https://www.infoq.com/articles/single-file-execution-java11/)
- [Introduction to the Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html)
