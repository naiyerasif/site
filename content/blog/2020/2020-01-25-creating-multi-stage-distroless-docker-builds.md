---
title: 'Creating multi-stage distroless Docker builds'
date: 2020-01-25 18:37:25
authors: [naiyer]
tags: ['tip']
---

**Distroless 🤔?** Google [describes](https://github.com/GoogleContainerTools/distroless#distroless-docker-images) it as a Docker image that contains only your application and its runtime dependencies. Everything non-essential, including package managers, shells, etc, is not available in such an image.

You may wonder why would someone choose to create a distroless image. Here are a few reasons:
- It reduces the surface for attack. 
- It improves the signal to noise of security scanners like [CVE](https://cve.mitre.org/).
- It reduces the complexity of inception of an image, both in terms of resources and cost. You ship only what you need.
- Potential upgrades to the components are less contentious and more amiable.

## Multi-stage Docker images

Consider a Spring Boot application. If you build and launch the application in the same Docker image, it would be unnecessarily large because of the Maven or Gradle cache and JDK. You can avoid this by building the application in one stage and using the fat JAR to launch the application in the second stage. As a bonus, you can use only the JRE in the second stage, since you don't need the entire JDK to run the application. This reduces the clutter and size of your image significantly.

> To use multi-stage Docker images, you'd need Docker 17.05 or higher.

## Build a distroless image

Say, you have a Spring Boot application, namely `example`, with Gradle as your build tool. Your multi-stage Dockerfile may look like this.

```dockerfile
FROM gradle:jdk11 as builder
COPY --chown=gradle:gradle . /home/gradle/src/app
WORKDIR /home/gradle/src/app
RUN gradle build

FROM gcr.io/distroless/java:11
COPY --from=builder /home/gradle/src/app/build/libs/example-1.0.0-SNAPSHOT.jar /app/example.jar
WORKDIR /app
EXPOSE 8080
CMD ["example.jar"]
```

In the second stage, `gcr.io/distroless/java:11` is being used. Google provides prebuilt Docker images for [Java](https://github.com/GoogleContainerTools/distroless/blob/master/java/README.md), [Python](https://github.com/GoogleContainerTools/distroless/blob/master/experimental/python3/README.md), [Node.js](https://github.com/GoogleContainerTools/distroless/blob/master/experimental/nodejs/README.md) and [.NET](https://github.com/GoogleContainerTools/distroless/blob/master/experimental/dotnet/README.md) with varying degree of support.

> You need to take care while declaring the entrypoint of the image. Since distroless images don't contain a shell, the `ENTRYPOINT` or `CMD` commands must be specified in their *exec* (JSON array) form.

## References

> - Moore, Matthew: [Distroless Docker: Containerizing Apps, not VMs](https://www.youtube.com/watch?v=lviLZFciDv4)
> - [distroless at GitHub](https://github.com/GoogleContainerTools/distroless)
