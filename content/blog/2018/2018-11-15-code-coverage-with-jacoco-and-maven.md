---
title: 'Code Coverage with JaCoCo and Maven'
date: 2018-11-15 21:09:32
updated: 2019-11-12 19:14:45
authors: [naiyer]
labels: [java, maven]
---

Code coverage is a measure of how much of your code executes when the automated tests run. Depending on how effectively your tests are written, it can provide a good picture of how much you are testing your code. [JaCoCo](https://www.jacoco.org/jacoco/), one of the many others, is a popular tool that enables developers to quantify this metric for a Java application. 

In this post, we'll integrate JaCoCo with a Spring Boot application. We'll also generate a coverage report that can be viewed in a browser.

##### Setup

The examples in this post use

- Java 11
- Spring Boot 2.1.8
- JaCoCo 0.8.4 

Let's reuse the Spring Boot application created in the post [Uploading files with Spring Boot and Angular](/blog/2018/09/09/uploading-files-with-spring-boot-and-angular/).

## Setup JaCoCo

Add the JaCoCo plugin in `pom.xml` with the following configuration.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.4</version>
      <executions>
        <execution>
          <id>start-agent</id>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>generate-report</id>
          <goals>
            <goal>report</goal>
          </goals>
          <configuration>
            <title>Coverage with JaCoCo</title>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <!-- Other plugins -->
  </plugins>
</build>
```

Jacoco runs the coverage by instrumenting the Java code through an agent. The first execution `start-agent` starts this agent (called `JaCoCo Agent`). The second execution `generate-report` generates the report.

Execute `mvn package` or `mvn test` command to see this in action. After the build, you'll notice a `jacoco.exec` file in the `target` directory. We can open this file in an IDE to see the results of coverage.

![IntelliJ Idea Coverage window](./images/2018-11-15-code-coverage-with-jacoco-and-maven-01.png)

Your editor may even show the coverage in the project window itself.

![IntelliJ Idea Project window](./images/2018-11-15-code-coverage-with-jacoco-and-maven-02.png)

> **Note** that these screenshots are from IntelliJ Idea; other editors/IDEs may display coverage information differently.

## Configure JaCoCo

JaCoCo provides a fair amount of flexibility when it comes to configuration. 

When the `mvn jacoco:report` task fires up, it generates reports in HTML, CSV and XML formats in a directory `target/site/jacoco`. We can use those files to integrate with a static analysis tool (like SonarQube) or publish the HTML report for other people to view.

![JaCoCo coverage report](./images/2018-11-15-code-coverage-with-jacoco-and-maven-03.png)

> **Note** that the appearance of the report may vary depending on your browser preferences.

We've already seen how we can configure the title of the report using the `title` key. We can also configure the encoding, footer text, etc and explicitly exclude or include class files. For a comprehensive list of options, refer to [jacoco:report documentation](https://www.jacoco.org/jacoco/trunk/doc/report-mojo.html).

### Enforce coverage compliance

In a typical scenario, we may require a project to have certain coverage. If the tests fail to pass that threshold, the build should fail. To enforce such a policy, we can configure custom rules built around limits which are specified over a *counter*. Counters are used by JaCoCo to calculate different coverage metrics.

Consider the following configuration.

```xml{15-31}
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.4</version>
      <executions>
        <!-- Other executions -->
        <execution>
          <id>check</id>
          <goals>
            <goal>check</goal>
          </goals>
          <configuration>
            <rules>
              <rule>
                <element>BUNDLE</element>
                <limits>
                  <limit>
                    <counter>INSTRUCTION</counter>
                    <value>COVEREDRATIO</value>
                    <minimum>0.80</minimum>
                  </limit>
                  <limit>
                    <counter>CLASS</counter>
                    <value>MISSEDCOUNT</value>
                    <minimum>10</minimum>
                  </limit>
                </limits>
              </rule>
            </rules>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <!-- Other plugins -->
  </plugins>
</build>
```

We have specified a coverage rule to be applied to the entire application with an instruction coverage of 80% using the `INSTRUCTION` counter. The instruction coverage provides information about the amount of code that has been executed or missed, irrespective of how the source code has been formatted. Similarly, a class coverage (which we have specified using the `CLASS` counter) tells that at least one method of a class has been executed. These rules will apply over the entire application because we've used a `BUNDLE` element.

We can configure specific classes and [additional counters](https://www.jacoco.org/jacoco/trunk/doc/counters.html) as well to customize the coverage rules. For more details on how this can be done, refer to the [official documentation](https://www.jacoco.org/jacoco/trunk/doc/index.html).

## References

**Source Code** &mdash; [coverage-with-jacoco](https://gitlab.com/mflash/java-guides/-/tree/master/coverage-with-jacoco)

**Related**
- [JaCoCo Maven plugin](https://www.eclemma.org/jacoco/trunk/doc/maven.html)
- [Maven usage example](https://www.eclemma.org/jacoco/trunk/doc/examples/build/pom.xml)
