---
slug: "2021/10/10/weaving-aspects-at-compile-time-with-aspectj"
title: "Weaving aspects at compile-time with AspectJ"
description: "AspectJ manipulates Java bytecode at compile-time or load-time. The process is called weaving. Learn how to use compile-time weaving to log method entry and exit in Java."
date: "2021-10-10 15:12:18"
update: "2021-10-10 15:12:18"
category: "guide"
tags: ["aspectj", "aop", "log"]
---

> This is a follow-up post for [Logging methods with AspectJ in a Spring application](/post/2020/09/13/logging-methods-with-aspectj-in-a-spring-application/).

[AspectJ](https://www.eclipse.org/aspectj/) manipulates Java bytecode at compile-time or load-time. The process is called _weaving_. Depending on when it is performed, it is called _compile-time_ or _load-time_ weaving. Using the same example discussed in [Logging methods with AspectJ in a Spring application](/post/2020/09/13/logging-methods-with-aspectj-in-a-spring-application/) that uses Spring AOP, we'll discuss how to log methods using Java and AspectJ (without any framework).

:::setup
The code written for this post uses:

- Java 16
- AspectJ 1.9.7
- JUnit 5.8.1
- Maven 3.8.2
:::

Create a Maven project using the following `pom.xml`.

```xml caption='pom.xml'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>dev.mflash.guides.spring</groupId>
  <artifactId>aop-compile-time</artifactId>
  <version>0.0.2</version>

  <properties>
    <encoding>UTF-8</encoding>
    <project.build.sourceEncoding>${encoding}</project.build.sourceEncoding>
    <project.reporting.outputEncoding>${encoding}</project.reporting.outputEncoding>
    <java.version>16</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
    <aspectj.version>1.9.7</aspectj.version>
    <junit.version>5.8.1</junit.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>${aspectj.version}</version>
    </dependency>
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjrt</artifactId>
      <version>${aspectj.version}</version>
      <scope>provided</scope>
    </dependency>

    <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-classic</artifactId>
      <version>1.2.6</version>
    </dependency>

    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.21.0</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter-api</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter-engine</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter-params</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.0.0-M5</version>
      </plugin>
    </plugins>
  </build>

</project>
```

## Define an annotation to log a method

Let's start by defining an annotation `@LogEntryExit`. This annotation will control the behavior of logging done on a method.

```java
// src/main/java/dev/mflash/guides/java/aop/logging/annotation/LogEntryExit.java

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.temporal.ChronoUnit;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogEntryExit {

  LogLevel value() default LogLevel.INFO;

  ChronoUnit unit() default ChronoUnit.SECONDS;

  boolean showArgs() default false;

  boolean showResult() default false;

  boolean showExecutionTime() default true;
}
```

This annotation can accept the following options.

- a `value` to declare the logging level; by default, it is `INFO`.
- a `showExecutionTime` flag to enable logging the execution time of the method; by default, it is `true`.
- a `unit` to declare the unit of the duration of execution; by default, it is `seconds`.
- a `showArgs` flag to enable displaying the arguments received by the method; by default, it is `false`.
- a `showResult` flag to enable displaying the result returned by the method; by default, it is `false`.

`LogLevel` is an enum that specifies the log level.

```java
// src/main/java/dev/mflash/guides/java/aop/logging/annotation/LogEntryExit.java

public enum LogLevel {
  DEBUG, INFO, TRACE, WARN, ERROR, FATAL
}
```

## Define the aspect with advice to log the methods

When you annotate a method with the `@LogEntryExit` annotation, its entry and exit will be logged based on the options passed to it. To parse these options and set some sensible defaults on the logging behavior, let's create an aspect `LogEntryExitAspect`.

```java {24}
// src/main/java/dev/mflash/guides/java/aop/logging/aspect/LogEntryExitAspect.java

import dev.mflash.guides.java.aop.logging.annotation.LogEntryExit;
import dev.mflash.guides.java.aop.logging.annotation.LogLevel;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Aspect
public final class LogEntryExitAspect {

  @Around("execution(* *(..)) && @annotation(dev.mflash.guides.java.aop.logging.annotation.LogEntryExit)")
  public Object log(ProceedingJoinPoint point) throws Throwable {
    var codeSignature = (CodeSignature) point.getSignature();
    var methodSignature = (MethodSignature) point.getSignature();
    Method method = methodSignature.getMethod();

    Logger logger = LoggerFactory.getLogger(method.getDeclaringClass());
    var annotation = method.getAnnotation(LogEntryExit.class);
    LogLevel level = annotation.value();
    ChronoUnit unit = annotation.unit();
    boolean showArgs = annotation.showArgs();
    boolean showResult = annotation.showResult();
    boolean showExecutionTime = annotation.showExecutionTime();
    String methodName = method.getName();
    Object[] methodArgs = point.getArgs();
    String[] methodParams = codeSignature.getParameterNames();

    log(logger, level, entry(methodName, showArgs, methodParams, methodArgs));

    var start = Instant.now();
    var response = point.proceed();
    var end = Instant.now();
    var duration = String.format("%s %s", unit.between(start, end), unit.name().toLowerCase());

    log(logger, level, exit(methodName, duration, response, showResult, showExecutionTime));

    return response;
  }

  // implementations of log, entry, exit, methods, etc.
}
```

Note the _pointcut expressions_ 

- `execution(* *(..))` which selects all the method executions in our project
- `@annotation(dev.mflash.guides.java.aop.logging.annotation.LogEntryExit)` which selects the methods that are annotated by the `@LogEntryExit` annotation

> We need both expressions satisfied. By default, AspectJ applies the advices on a method call _and_ method execution in case of an `@Around` aspect. The expression `execution(* *(..))` ensures that methods are logged only when they are executed.

You'll also note that the logging takes place in the `log` method. Such places where crosscutting actions happen are called _join points_ in Aspect Oriented Programming (AOP). In AspectJ, a `ProceedingJoinPoint` allows us to inspect an execution, perform some action and _proceed_ forward. 

Here, we use the `ProceedingJoinPoint` to extract 

- extract parameter names of the method (from the `CodeSignature`), and
- extract the details of the class, method arguments, and options passed to the `@LogEntryExit` annotation by this method (from the `MethodSignature`)

With all this information available, we calculate the execution time and prepare log messages as follows.

```java {43-46}
// src/main/java/dev/mflash/guides/java/aop/logging/aspect/LogEntryExitAspect.java

import dev.mflash.guides.java.aop.logging.annotation.LogEntryExit;
import dev.mflash.guides.java.aop.logging.annotation.LogLevel;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Aspect
public final class LogEntryExitAspect {

  @Around("execution(* *(..)) && @annotation(dev.mflash.guides.java.aop.logging.annotation.LogEntryExit)")
  public Object log(ProceedingJoinPoint point) throws Throwable {
    var codeSignature = (CodeSignature) point.getSignature();
    var methodSignature = (MethodSignature) point.getSignature();
    Method method = methodSignature.getMethod();

    Logger logger = LoggerFactory.getLogger(method.getDeclaringClass());
    var annotation = method.getAnnotation(LogEntryExit.class);
    LogLevel level = annotation.value();
    ChronoUnit unit = annotation.unit();
    boolean showArgs = annotation.showArgs();
    boolean showResult = annotation.showResult();
    boolean showExecutionTime = annotation.showExecutionTime();
    String methodName = method.getName();
    Object[] methodArgs = point.getArgs();
    String[] methodParams = codeSignature.getParameterNames();

    log(logger, level, entry(methodName, showArgs, methodParams, methodArgs));

    var start = Instant.now();
    var response = point.proceed();
    var end = Instant.now();
    var duration = String.format("%s %s", unit.between(start, end), unit.name().toLowerCase());

    log(logger, level, exit(methodName, duration, response, showResult, showExecutionTime));

    return response;
  }

  static String entry(String methodName, boolean showArgs, String[] params, Object[] args) {
    StringJoiner message = new StringJoiner(" ")
        .add("Started").add(methodName).add("method");

    if (showArgs && Objects.nonNull(params) && Objects.nonNull(args) && params.length == args.length) {

      Map<String, Object> values = new HashMap<>(params.length);

      for (int i = 0; i < params.length; i++) {
        values.put(params[i], args[i]);
      }

      message.add("with args:")
          .add(values.toString());
    }

    return message.toString();
  }

  static String exit(String methodName, String duration, Object result, boolean showResult, boolean showExecutionTime) {
    StringJoiner message = new StringJoiner(" ")
        .add("Finished").add(methodName).add("method");

    if (showExecutionTime) {
      message.add("in").add(duration);
    }

    if (showResult) {
      message.add("with return:").add(result.toString());
    }

    return message.toString();
  }

  static void log(Logger logger, LogLevel level, String message) {
    switch (level) {
      case DEBUG -> logger.debug(message);
      case TRACE -> logger.trace(message);
      case WARN -> logger.warn(message);
      case ERROR, FATAL -> logger.error(message);
      default -> logger.info(message);
    }
  }
}
```

Here

- the `entry` method prepares a log message containing parameter names and arguments of the method, and
- the `exit` method prepares a log message containing execution time and the returned value

## Configuring the AspectJ Compiler

To modify the bytecode of methods annotated by the `@LogEntryExit` annotation, you'll need to configure AspectJ Compiler (`ajc` in short). An easy way to do this is by using Mojo's [Aspect Maven Plugin](https://www.mojohaus.org/aspectj-maven-plugin/). Open your `pom.xml` and modify it as follows.

```xml {15-33}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- rest of the POM -->

  <build>
    <plugins>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.0.0-M5</version>
      </plugin>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>aspectj-maven-plugin</artifactId>
        <version>1.14.0</version>
        <configuration>
          <complianceLevel>16</complianceLevel>
          <showWeaveInfo>true</showWeaveInfo>
          <encoding>${encoding}</encoding>
          <Xlint>ignore</Xlint>
        </configuration>
        <executions>
          <execution>
            <goals>
              <goal>compile</goal>
              <goal>test-compile</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

</project>
```

Note that the `ajc` is configured to weave the classes during `compile` and `test-compile` goals of Maven's lifecycle. We're also passing the following configuration through the plugin.

- `Xlint` to log an `error` or `warning` message if something goes wrong with the Aspect code. You can also set it to `ignore` all the issues.
- `showWeaveInfo` displays useful details during weaving
- `complianceLevel` sets the source code and bytecode target version for Java

## Compile-time weaving in action

To check if the above implementation works, create a class, say `GreetingHandler` with some sample methods.

```java
// src/main/java/dev/mflash/guides/java/aop/logging/GreetingHandler.java

import dev.mflash.guides.java.aop.logging.annotation.LogEntryExit;

import java.time.temporal.ChronoUnit;

public class GreetingHandler {

  @LogEntryExit(showArgs = true, showResult = true, unit = ChronoUnit.MILLIS)
  public String greet(String name) {
    return "Hello, " + resolveName(name) + "!";
  }

  @LogEntryExit(showArgs = true, showResult = true, unit = ChronoUnit.MILLIS)
  private String resolveName(String name) {
    return !name.isBlank() ? name : "world";
  }

  public String resolveNothing(String randomString) {
    return "All good, nothing to resolve!";
  }
}
```

Here, the public method `greet` and private method `resolveName` are annotated with the `@LogEntryExit` annotation, and hence we expect them to be logged.

Create a `Launcher` class to call these methods as follows.

```java
// src/main/java/dev/mflash/guides/java/aop/logging/Launcher.java

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Launcher {

  private static final Logger logger = LoggerFactory.getLogger(Launcher.class);

  private static final GreetingHandler handler = new GreetingHandler();

  public static void main(String... args) {
    logger.info("{}", handler.greet("Veronica"));
  }
}
```

Running the `Launcher` outputs the following logs.

```log
16:54:35.272 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Started greet method with args: {name=Veronica}
16:54:35.272 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Started resolveName method with args: {name=Veronica}
16:54:35.272 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Finished resolveName method in 0 millis with return: Veronica
16:54:35.272 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Finished greet method in 0 millis with return: Hello, Veronica!
16:54:35.272 [main] INFO dev.mflash.guides.java.aop.logging.Launcher - Hello, Veronica!
```

Feel free to play with other options of the `@LogEntryExit` annotation.

## Testing the aspect

To test the `LogEntryExitAspect`, you can monitor the logs and verify if the expected messages are printed during the execution. [Logback](http://logback.qos.ch/) provides an API to capture logging events. We can use this API 

- to define a custom log appender, say `AspectAppender`
- attach this appender to the logger of `GreetingHandler` class
- call the methods of the `GreetingHandler` class, and
- query the captured events to verify that entry and exit logs

Let's define the `AspectAppender` as follows.

```java
// src/test/java/dev/mflash/guides/java/aop/logging/AspectAppender.java

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;

import java.util.ArrayList;
import java.util.List;

public class AspectAppender extends AppenderBase<ILoggingEvent> {

  public final List<ILoggingEvent> events = new ArrayList<>();

  @Override
  protected void append(ILoggingEvent event) {
    events.add(event);
  }
}
```

Now use this appender in the JUnit test to verify success and failure scenarios for the aspect.

```java
// src/test/java/dev/mflash/guides/java/aop/logging/aspect/LogEntryExitAspectTest.java

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import dev.mflash.guides.java.aop.logging.AspectAppender;
import dev.mflash.guides.java.aop.logging.GreetingHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

class LogEntryExitAspectTest {

  private GreetingHandler greetingHandler;
  private AspectAppender aspectAppender;

  @BeforeEach
  void setUp() {
    greetingHandler = new GreetingHandler();

    aspectAppender = new AspectAppender();
    aspectAppender.setContext(new LoggerContext());
    aspectAppender.start();

    final Logger logger = (Logger) LoggerFactory.getLogger(GreetingHandler.class);
    logger.addAppender(aspectAppender);
  }

  @AfterEach
  void cleanUp() {
    aspectAppender.stop();
  }

  @Test
  @DisplayName("Should fire advice with logs on public method")
  void shouldFireAdviceWithLogsOnPublicMethod() {
    greetingHandler.greet("Veronica");

    assertThat(aspectAppender.events).isNotEmpty()
        .anySatisfy(event -> assertThat(event.getMessage())
            .isEqualTo("Started greet method with args: {name=Veronica}")
        )
        .anySatisfy(event -> assertThat(event.getMessage())
            .startsWith("Finished greet method in ")
            .endsWith("millis with return: Hello, Veronica!")
        );
  }

  @Test
  @DisplayName("Should fire advice with logs on private method")
  void shouldFireAdviceWithLogsOnPrivateMethod() {
    greetingHandler.greet("Veronica");

    assertThat(aspectAppender.events).isNotEmpty()
        .anySatisfy(event -> assertThat(event.getMessage())
            .isEqualTo("Started resolveName method with args: {name=Veronica}")
        )
        .anySatisfy(event -> assertThat(event.getMessage())
            .startsWith("Finished resolveName method in ")
            .endsWith("millis with return: Veronica")
        );
  }

  @Test
  @DisplayName("Should not fire advice without annotation")
  void shouldNotFireAdviceWithoutAnnotation() {
    greetingHandler.resolveNothing("Veronica");

    assertThat(aspectAppender.events).isEmpty();
  }
}
```

Here, we

- attach the `AspectAppender` to the logger of the `GreetingHandler` in the `setup` method. We stop the appender in the `cleanUp` method after every test.
- verify if the entry and exit of the `GreetingHandler.greet` and `GreetingHandler.resolveName` are logged
- verify that the entry and exit of the `GreetingHandler.resolveNothing` method are not logged since it is not annotated with the `@LogEntryExit` annotation.

## Conclusion

- Compile-time weaving is pretty fast since all the bytecode is already weaved before execution.
- It requires access to the source code. If source code is not available, you'll have to use _build-time_ or _load-time_ weaving. Spring AOP, for example, uses load-time weaving using proxies.
- You can weave public or private methods of a Java class.
- It is relatively simpler compared to _build-time_ or _load-time_ weaving which need an agent to weave the classes.
- It introduces another compiler, `ajc`, in the compile process. Some IDEs may not provide support for this compiler out-of-box.

---

**Source code**

- [aop-compile-time](https://github.com/Microflash/guides/tree/main/java/aop-compile-time)

**Related**

- [AspectJ in Action](https://livebook.manning.com/book/aspectj-in-action-second-edition/chapter-8/1) by Ramnivas Laddad
- [The AspectJ Project](https://www.eclipse.org/aspectj/)
- [The AspectJ Programming Guide](https://www.eclipse.org/aspectj/doc/released/progguide/index.html)
