---
slug: "2018/11/15/code-coverage-with-jacoco-and-maven"
title: "Code Coverage with JaCoCo and Maven"
description: "Code coverage is a measure of how much of your code executes when the automated tests run. JaCoCo is a popular tool that helps developers quantify this metric for a Java application. Learn how to use it with Maven and generate a coverage report that can be viewed in a browser."
date: "2018-11-15 21:09:32"
update: "2021-06-20 11:27:45"
category: "guide"
tags: ["jacoco", "coverage", "compliance"]
---

Code coverage is a measure of how much of your code executes when the automated tests run. Depending on how effectively your tests are written, it can provide a good picture of how much you are testing your code. [JaCoCo](https://www.jacoco.org/jacoco/), one of the many others, is a popular tool that enables developers to quantify this metric for a Java application. 

In this post, we'll integrate JaCoCo with a Java application. We'll also generate a coverage report that can be viewed in a browser.

:::setup
The examples in this post use

- Java 16
- JaCoCo 0.8.7
:::

Create a Maven project and add a few tests under the `src/test/java` folder. You can find the sample tests for this guide [here](https://github.com/Microflash/java-guides/tree/main/coverage-jacoco-maven/src/test/java/dev/mflash/guides/java/coverage/jacoco/).

## Setup JaCoCo

Add the JaCoCo plugin in `pom.xml` with the following configuration.

```xml
<build>
  <plugins>
    <plugin>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>3.0.0-M5</version>
    </plugin>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.7</version>
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
            <title>Coverage with JaCoCo and Maven</title>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <!-- Other plugins -->
  </plugins>
</build>
```

:::note
You'd need the Surefire plugin to execute the unit tests. If you're using a framework (such as Spring Boot), it may already come with the plugin pre-configured. In such cases, you may omit the Surefire plugin.
:::

Jacoco runs the coverage by instrumenting the Java code through an agent. The first execution `start-agent` starts the JaCoCo Agent using the `-javaagent` flag when the Java process is launched. The second execution `generate-report` generates the report.

Execute `mvn verify` command to see this in action. After the build, you'll notice a `jacoco.exec` file in the `target` directory. You can open this file in an IDE to see the results of coverage.

![IntelliJ Idea Coverage window](/images/post/2018/2018-11-15-21-09-32-code-coverage-with-jacoco-and-maven-01.png)

Your editor may even show the coverage in the project window itself.

![IntelliJ Idea Project window](/images/post/2018/2018-11-15-21-09-32-code-coverage-with-jacoco-and-maven-02.png)

:::note
These screenshots are from IntelliJ Idea; other editors/IDEs may display coverage information differently.
:::

## Configure JaCoCo

JaCoCo provides a fair amount of flexibility when it comes to configuration. 

When the `mvn jacoco:report` task fires up, it generates reports in HTML, CSV and XML formats in a directory `target/site/jacoco`. You can use those files to integrate with a static analysis tool (like SonarQube) or publish the HTML report for other people to view.

![JaCoCo coverage report](/images/post/2018/2018-11-15-21-09-32-code-coverage-with-jacoco-and-maven-03.png)

:::note
The appearance of the report may vary depending on your browser preferences.
:::

You've already seen how you can configure the title of the report using the `title` key. You can also configure the encoding, footer text, etc, and explicitly exclude or include class files. For a comprehensive list of options, refer to [jacoco\:report documentation](https://www.jacoco.org/jacoco/trunk/doc/report-mojo.html).

### Enforce coverage compliance

You may require a project to have certain coverage. If the tests fail to pass that threshold, the build should fail. To enforce such a policy, you can configure custom rules built around limits that are specified over a *counter*. Counters are used by JaCoCo to calculate different coverage metrics.

Consider the following configuration.

```xml {15-26}
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.7</version>
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
                    <minimum>1.0</minimum>
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

Here, you've specified a coverage rule that enforces an instruction coverage of 100% using the `INSTRUCTION` counter. The instruction coverage provides information about the amount of code that has been executed or missed, irrespective of how the source code has been formatted. These rules will apply over the entire application because they've been specified using a `BUNDLE` element.

Since the instruction coverage of many of our tests is below 100%, executing `mvn verify` throws an error as follows, failing the entire build.

```log
[INFO] --- jacoco-maven-plugin:0.8.7:check (check) @ coverage-jacoco-maven ---
[INFO] Loading execution data file E:\guides\java\coverage-jacoco-maven\target\jacoco.exec
[INFO] Analyzed bundle 'coverage-jacoco-maven' with 6 classes
[WARNING] Rule violated for bundle coverage-jacoco-maven: instructions covered ratio is 0.9, but expected minimum is 1.0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  3.290 s
[INFO] Finished at: 2021-06-20T12:56:16+05:30
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.jacoco:jacoco-maven-plugin:0.8.7:check (check) on project coverage-jacoco-maven: Coverage checks have not been met. See log for details. -> [Help 1]
```

You can configure specific classes and [additional counters](https://www.jacoco.org/jacoco/trunk/doc/counters.html) as well to customize the coverage rules. For more details, refer to the [official documentation](https://www.jacoco.org/jacoco/trunk/doc/index.html).

---

**Source code**

- [coverage-jacoco-maven](https://github.com/Microflash/guides/tree/main/java/coverage-jacoco-maven)

**Related**

- [JaCoCo Maven plugin](https://www.eclemma.org/jacoco/trunk/doc/maven.html)
- [Maven usage example](https://www.eclemma.org/jacoco/trunk/doc/examples/build/pom.xml)
