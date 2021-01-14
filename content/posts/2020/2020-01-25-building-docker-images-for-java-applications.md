---
title: 'Building Docker images for Java applications'
date: 2020-01-25 18:37:25
authors: [naiyer]
topics: [docker, java, maven]
---

With the rise of the container-first Java frameworks ([Micronaut](https://micronaut.io/), [Quarkus](https://quarkus.io/), etc) and the JVM itself [evolving](https://blogs.oracle.com/java-platform-group/java-se-support-for-docker-cpu-and-memory-limits) to work smoothly with containers, there's been never a better time to embrace Java in a continuously-built continuously-deployed workflow. In this post, we'll explore some of the practices that can improve and enhance such workflows.

## Building a Docker image

For launching a Java application in a container, all it takes is to 
- build a JAR (with a Maven, Gradle or Bazel), 
- copy it in an image containing the Java runtime,
- expose the necessary port(s), and 
- launch the JAR with a `CMD` or `ENTRYPOINT`. 

Using this approach, the `Dockerfile` may look like this.

```dockerfile
FROM adoptopenjdk:11-openj9
WORKDIR /usr/home/app
COPY target/app-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

That's a 230 MB image to run a Java application; it includes operating system utilities, a JDK and the actual application.

## Use a JRE-based image to provide the runtime

But come to think of it, you don't actually need the entire JDK. Unless your application specifically requires the JDK, a JRE should suffice the purpose of running your application. If that is the case, you're better off using `adoptopenjdk:11-jre-openj9` in the `Dockerfile`.

```dockerfile{1}
FROM adoptopenjdk:11-jre-openj9
WORKDIR /usr/home/app
COPY target/app-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

`adoptopenjdk:11-jre-openj9` is only 80 MB, which is around a third the size of the JDK based image.

> **Tip** Use smaller variants of the base images, if your application doesn't specifically depend on the functionality available in the full-fledged images. This could save you disk space and speed-up your build pipeline. Linux-based Docker images often come in different variants many of which (like `slim` and `alpine` variants) are significantly smaller in size.

## Immutability with multi-stage builds

Building a JAR and copying it in a Docker image may work on one machine and not on the other depending on which version of the dependencies are available on their `CLASSPATH`. This can happen if your CI server builds multiple Java applications. Containers provide consistent environments that can effectively isolate a build and help avoid such problems.

To take advantage of the container environment, identify exactly what needs to be built and copy only those artefacts. To cache and reuse the dependencies, fetch them in a separate step. However, this can bloat your image with dependencies that are required only during the build. This problem can be solved with the **multi-stage builds** introduced in Docker 17.05. In one stage, you can build the JAR, in the other stage you can copy the JAR and launch it. 

The `Dockerfile` would look like this for such a workflow.

```dockerfile
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM adoptopenjdk:11-jre-openj9
COPY --from=builder /usr/home/app/target/app-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Reduce the security footprint with distroless images

Distroless 🤔? Google [describes](https://github.com/GoogleContainerTools/distroless#distroless-docker-images) it as a Docker image that contains only your application and its runtime dependencies. Everything non-essential, including package managers, shells, etc, is not available in such an image.

You may wonder why would someone choose to create a distroless image. Here are a few reasons:
- It reduces the surface for attack. 
- It improves the signal to noise of security scanners like [CVE](https://cve.mitre.org/).
- It reduces the complexity of inception of an image, both in terms of resources and cost. You ship only what you need.
- Potential upgrades to the components are less disruptive and more amiable.

To use a distroless image, edit your `Dockerfile` as follows.

```dockerfile
FROM maven:3.6.3-jdk-11 as builder
WORKDIR /usr/home/app
COPY pom.xml .
RUN mvn -e -B dependency:resolve
COPY src ./src
RUN mvn -e -B package

FROM gcr.io/distroless/java:11
COPY --from=builder /usr/home/app/target/app-*.jar app.jar
EXPOSE 8080
CMD ["app.jar"]
```

Note that instead of `adoptopenjdk:11-jre-openj9`, `gcr.io/distroless/java:11` is used which is the official [Docker image for Java](https://github.com/GoogleContainerTools/distroless/blob/master/java/README.md) provided by Google.

> **Tip** It is important that you specify the `ENTRYPOINT` or `CMD` commands in their *exec* (JSON array) form, since the distroless images don't contain a shell to launch.

## References

- [Intro Guide to Dockerfile Best Practices](https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/)
- [distroless at GitHub](https://github.com/GoogleContainerTools/distroless)
