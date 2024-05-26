---
slug: "2021/02/28/copying-dependency-files-with-maven"
title: "Copying dependency files with Maven"
description: "Sometimes, a dependency needs to be moved to the target directory alongside the application JAR as a part of Maven build process. Learn how to copy such files that are not packaged with your app."
date: 2021-02-28 21:23:03
update: 2021-02-28 21:23:03
type: "post"
category: "note"
---

Sometimes, when I build an application with Maven, I need to move some dependency files to the target directory along with the application JAR. These files may not be used by the application directly and hence wouldn't be packaged in the application JAR.

For example, sometimes I'm interested in attaching the [Hotswap Agent](https://github.com/HotswapProjects/HotswapAgent) directly to my Java process through the `-javaagent` flag while it runs in a container. Many times, those containers are pretty minimal and don't have `curl` or `wget` preinstalled to download such dependencies directly. In the case of a multi-stage Dockerfile where one stage builds the application, I can provide instructions to Maven to copy this dependency in the target folder while packaging the application and use it in the later stages.

That's where the `maven-dependency-plugin` comes in handy. I need to add HotSwap Agent as a dependency and configure the plugin to copy it to the target directory (defined by the `project.build.directory` property) as follows.

```xml {28..32,41..62}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.4.3</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash</groupId>
  <artifactId>copy-demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>11</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
      <groupId>org.hotswapagent</groupId>
      <artifactId>hotswap-agent-core</artifactId>
      <version>1.4.1</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
          <execution>
            <id>copy</id>
            <phase>prepare-package</phase>
            <goals>
              <goal>copy</goal>
            </goals>
            <configuration>
              <artifactItems>
                <artifactItem>
                  <groupId>org.hotswapagent</groupId>
                  <artifactId>hotswap-agent-core</artifactId>
                  <outputDirectory>${project.build.directory}</outputDirectory>
                </artifactItem>
              </artifactItems>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

</project>
```

The above configuration hooks an execution under the `prepare-package` phase and copies the `hotswap-agent-core` JAR available on the classpath (that's why it needs to be declared as a dependency).
