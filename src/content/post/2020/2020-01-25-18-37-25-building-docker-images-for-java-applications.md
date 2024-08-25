---
slug: "2020/01/25/building-docker-images-for-java-applications"
title: "Building Docker images for Java applications"
description: "With the rise of container-first Java frameworks, there’s never been a better time to embrace Java in a continuous cloud-native workflow. Learn how to improve and enhance building the Docker images for Java applications that are packaged as JARs."
date: "2020-01-25 18:37:25"
update: "2021-02-28 11:33:45"
category: "guide"
tags: ["docker", "security", "java", "distroless"]
---

With the rise of the container-first Java frameworks ([Micronaut](https://micronaut.io/), [Quarkus](https://quarkus.io/), etc) and the JVM itself [evolving](https://blogs.oracle.com/java-platform-group/java-se-support-for-docker-cpu-and-memory-limits) to work smoothly with containers, there's been never a better time to embrace Java in a continuous cloud-native workflow. In this post, we'll examine some of the practices that can improve and enhance building the Docker images for Java applications that are packaged as JARs.

## Building a Docker image

To build a Docker image of a Java application, we need to
- build a JAR (with a build tool such as Maven or Gradle)
- copy the JAR to an image that contains the Java runtime
- expose the necessary port(s), and
- launch the JAR using the `java` command

Consider a JAR built by Maven (which dumps the JAR file in `<project-root>/target` directory), we can describe the Docker image by the following `Dockerfile`.

```dockerfile
FROM adoptopenjdk:11
WORKDIR /usr/home/app
COPY target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

The `adoptopenjdk:11` image alone is 440MB in size. Say, your application's JAR is 15MB in size. That's a 455MB image to run your Java application 😮! This image contains the operating system, the JDK, and the actual application.

## Use a JRE-based image to provide the runtime

But come to think of it, you don't need the entire JDK to run your application. Unless your application specifically requires the JDK, a JRE should suffice the purpose. If that is the case, you're better off using `adoptopenjdk/openjdk11:alpine-jre` in the `Dockerfile`.

```dockerfile {1}
FROM adoptopenjdk/openjdk11:alpine-jre
WORKDIR /usr/home/app
COPY target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

`adoptopenjdk/openjdk11:alpine-jre` is only 150 MB in size. Hence the resultant image is about 165 MB, which is around a third the size of the JDK-based image.

:::assert{title=Tips}
- Use JRE-based images to run the Java applications, unless you specifically need the JDK.
- Use smaller variants of the base images, if your application doesn't specifically depend on the functionality available in the full-fledged images. This could save you disk space and speed-up your build pipeline. Linux-based Docker images often come in different variants many of which (like `slim` and `alpine` variants) are significantly smaller in size.
:::

## Immutability with multi-stage builds

Building a JAR and copying it in a Docker image may work on one machine and not on the other depending on which version of the dependencies are available on their `CLASSPATH`. This can happen if your CI server builds multiple Java applications. Containers provide consistent environments that can effectively isolate a build and help avoid such problems.

To take advantage of the container environment, identify exactly what needs to be built and copy only those artefacts. To cache and reuse the dependencies, fetch them in a separate step. However, this can bloat your image with dependencies that are required only during the build. This problem can be solved with the **multi-stage builds** introduced in Docker 17.05. In one stage, you can build the JAR, in the other stage, you can copy the JAR and launch it. 

The `Dockerfile` would look like this for such a workflow.

```dockerfile
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM adoptopenjdk/openjdk11:alpine-jre
COPY --from=builder /usr/home/app/target/app-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Reduce the security footprint with a non-privileged user

Many times, the image you build runs with a privileged (`root`) user. For development purposes, it is fine but it is not recommended in general (see [Principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) for more details). Therefore, you should create a non-root user and provide appropriate privileges to them to run the application and finally switch to that user in the image. For the `adoptopenjdk/openjdk11:alpine-jre` image, you can do something like this.

```dockerfile {9-10}
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM adoptopenjdk/openjdk11:alpine-jre
RUN addgroup -S javausergroup && adduser -S javauser -G javausergroup
USER javauser:javausergroup
COPY --from=builder /usr/home/app/target/app-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

> The instructions to create a user may differ based on the type of image that you may be using.

## Reduce the security footprint with distroless images

Distroless 🤔? Google [describes](https://github.com/GoogleContainerTools/distroless#distroless-docker-images) it as a Docker image that contains only your application and its runtime dependencies. Everything non-essential, including package managers, shells, etc, is not available in such an image.

You may wonder why would someone choose to create a distroless image. Here are a few reasons:
- It reduces the surface for attack. 
- It improves the signal to noise of security scanners like [CVE](https://cve.mitre.org/).
- It reduces the complexity of the inception of an image, both in terms of resources and cost. You ship only what you need.
- Potential upgrades to the components are less disruptive.

To use a distroless image, edit your `Dockerfile` as follows.

```dockerfile {8}
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM gcr.io/distroless/java:11
COPY --from=builder /usr/home/app/target/*.jar app.jar
EXPOSE 8080
CMD ["app.jar"]
```

Note that instead of `adoptopenjdk/openjdk11:alpine-jre`, we're using `gcr.io/distroless/java:11` which is the official [distroless Docker image for Java](https://console.cloud.google.com/gcr/images/distroless/GLOBAL/java) provided by Google.

:::assert
You should specify the `ENTRYPOINT` or `CMD` commands in their *exec* (JSON array) form since the distroless images don't contain a shell to launch.
:::

For a non-root user, the distroless images provide a `nonroot` user; you can switch to this user as follows.

```dockerfile {10}
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM gcr.io/distroless/java:11
COPY --from=builder /usr/home/app/target/*.jar app.jar
USER nonroot
EXPOSE 8080
CMD ["app.jar"]
```

Alternatively, you can use a distroless image that comes with the non-root user set as default.

```dockerfile {8}
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM gcr.io/distroless/java:11-nonroot
COPY --from=builder /usr/home/app/target/*.jar app.jar
EXPOSE 8080
CMD ["app.jar"]
```

To search the list of all the available distroless images, you can refer to the [distroless Container Registry](https://console.cloud.google.com/gcr/images/distroless).

---

**Related**

- [Intro Guide to Dockerfile Best Practices](https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/)
- [distroless at GitHub](https://github.com/GoogleContainerTools/distroless)
- [distroless Container Registry](https://console.cloud.google.com/gcr/images/distroless)
