---
title: 'Logging methods with AspectJ'
date: 2021-10-02 14:59:38
tags: ['aspectj', 'log', 'aop']
---

A year ago, I wrote an article on [how to log methods using AspectJ and Spring AOP](/blog/2020/09/13/logging-methods-with-aspectj-in-a-spring-application/). This post is a follow-up that shows you how to log methods using plain Java (without using Spring or any other framework).

:::note Setup
The code written for this post uses:

- Java 16
- AspectJ 1.9.7
- JUnit 5.8.1
- Maven 3.8.2
:::

Create a Maven project using the following `pom.xml`.

```xml {73-86,caption='pom.xml'}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>dev.mflash.guides.spring</groupId>
  <artifactId>aop-method-logging</artifactId>
  <version>0.0.1</version>

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
      <scope>runtime</scope>
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

Note that AspectJ is configured to weave the classes at compile-time in the above configuration.

- `Xlint` option informs you if something goes wrong with the Aspect code. You can set it to `ignore`, `warning`, or `error` depending on your need.
- `showWeaveInfo` displays messages during weaving
- `complianceLevel` sets the source code and bytecode target version for Java

> __AspectJ weaving models__
> AspectJ supports _build-time_ and _load-time_ weaving models.
> 
> - During build-time weaving, it can work with either source-code or bytecode. 
> - During load-time weaving, it works primarily with bytecode. However, you can provide source code along with an XML file (aptly called `aop.xml`) for load-time weaving, if needed.

## Define an annotation to log a method

Instead of defining an aspect specific to a package, you can use an annotation, say `@LogEntryExit` to specify if you want to log a method. This gives you control and flexibility to modify the behavior of logging by providing some configuration through the annotation. You can define the `@LogEntryExit` annotation as follows.

```java
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

This annotation can accept

- a `value` to declare the logging level; by default, it is `INFO`.
- a `showExecutionTime` flag to enable logging the execution time of the method; by default, it is `true`.
- a `unit` to declare the unit of the duration of execution; by default, it is `seconds`.
- a `showArgs` flag to enable displaying the arguments received by the method; by default, it is `false`.
- a `showResult` flag to enable displaying the result returned by the method; by default, it is `false`.

`LogLevel` is an enum to specify, well, the log level.

```java
public enum LogLevel {
  DEBUG, INFO, TRACE, WARN, ERROR, FATAL
}
```

## Define the aspect with an advice to log the methods

The next step is to define the aspect that would apply the advice.

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

In the above implementation, we implement a `log` method that accepts a `JoinPoint` (more specifically, a `ProceedingJoinPoint`). In our case, this `JoinPoint` is nothing but an execution of any method annotated with the `@LogEntryExit` annotation.

Note that the expression `execution(* *(..))` specifies that the advice should be applied when the method executes. This is needed to ensure that the logging happens during the method execution and not when the method is invoked. If this is not done, logging will happen twice, once on a method call and subsequently on method execution. Also, note that the expression `@annotation(dev.mflash.guides.java.aop.logging.annotation.LogEntryExit)` specifies that the advice should be applied on the method annotated by `@LogEntryExit`. Both expressions are combined using `&&` operator.

Furthermore, we obtain 

- `CodeSignature` to extract parameter names of the method, and 
- `MethodSignature` to extract the details of the class, arguments received by the method being advised and values passed to the `@LogEntryExit` annotation for this execution.

All this information is used to calculate the execution time and to prepare a list of arguments to display using logs.

```java
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

In the `entry` method, we generate a map of parameters and arguments of the method and add them to the log message if the `showArgs` flag is set to `true`. Similarly, we add the duration of execution, and the result returned by the method to the log message based on the `showExecutionTime` and `showResult` flags respectively.

## Method logging in action

To check if the above implementation works, create a class, say `GreetingHandler` with some sample methods.

```java
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

Here, the public method `greet` and private method `resolveName` are annotated with the `@LogEntryExit` annotation, and hence should be logged.

Create a `Launcher` class to call these methods as follows.

```java
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
16:11:32.239 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Started greet method with args: {name=Veronica}
16:11:32.242 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Started resolveName method with args: {name=Veronica}
16:11:32.245 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Finished resolveName method in 0 millis with return: Veronica
16:11:32.245 [main] INFO dev.mflash.guides.java.aop.logging.GreetingHandler - Finished greet method in 4 millis with return: Hello, Veronica!
16:11:32.245 [main] INFO dev.mflash.guides.java.aop.logging.Launcher - Hello, Veronica!
```

Feel free to play with other options of the `@LogEntryExit` annotation.

## Testing the aspect

To test the `LogEntryExitAspect`, you can monitor the logs and verify if the expected messages are printed during the execution. To monitor the logs, __SLF4J__ does not provide an API but [Logback](http://logback.qos.ch/) does (which we're using along with __SLF4J__). Start by defining a custom appender to capture the log events, as follows.

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

In this test class,

- in the `setUp` method, we create new instances of `GreetingHandler`, `AspectAppender`, and a `Logger` for each test. We also add the `AspectAppender` to the logger to monitor the log events.
- the first and second tests check if the advice is applied on the public `greet` method and private `resolveName` method when they execute.
- the last test verifies that the advice is not applied on a method that is not annotated with the `@LogEntryExit` annotation.
- the `cleanUp` method tears down the appender.

## Conclusion

- Using this approach, you can apply an advice to any Java class, whether they're Spring Beans or not. Also, you can advise both public and private methods.
- More specifically, the build-time weaving doesn't require any agent; the load-time weaving requires an agent to weave the classes when the JVM loads them.

## References

**Source Code** &mdash; [aop-method-logging](https://github.com/Microflash/java-guides/tree/master/aop-method-logging)

**Related**
- [AspectJ in Action](https://livebook.manning.com/book/aspectj-in-action-second-edition/chapter-8/1) by Ramnivas Laddad
- [The AspectJ Project](https://www.eclipse.org/aspectj/)
