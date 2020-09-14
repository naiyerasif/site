---
title: 'Logging methods with AspectJ in a Spring application'
date: 2020-09-13 21:01:49
authors: [naiyer]
topics: [aspectj, logging, spring]
---

Method logging is a very common pattern that helps a developer verify which method has started executing and when it has finished. It can also be used to log the time a method takes to finish executing, the arguments it receives and the result it returns. You can do this manually by logging all this information using a logger but since it is a repetitive task, we can automate it. And that's exactly what we'll do in this post.

:::note Setup
The code written for this post uses:

- Java 14
- Spring Boot 2.3.3
- AspectJ 1.9.6
- Spock 2.0 with Groovy 3 (for tests)
- Maven 3.6.3
:::

Generate a Maven project using the following `pom.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.3.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>

  <groupId>dev.mflash.guides</groupId>
  <artifactId>method-entry-exit-logging</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>14</java.version>
    <aspectj.version>1.9.6</aspectj.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
      <groupId>org.codehaus.groovy</groupId>
      <artifactId>groovy</artifactId>
      <version>3.0.4</version>
    </dependency>

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
      <groupId>org.spockframework</groupId>
      <artifactId>spock-core</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
      <exclusions>
        <exclusion>
          <groupId>org.junit.vintage</groupId>
          <artifactId>junit-vintage-engine</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.0.0-M4</version>
        <configuration>
          <useFile>false</useFile>
          <includes>
            <include>**/*Test.java</include>
            <include>**/*Spec.java</include>
          </includes>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.codehaus.gmavenplus</groupId>
        <artifactId>gmavenplus-plugin</artifactId>
        <version>1.8.1</version>
        <executions>
          <execution>
            <goals>
              <goal>addSources</goal>
              <goal>addTestSources</goal>
              <goal>generateStubs</goal>
              <goal>compile</goal>
              <goal>generateTestStubs</goal>
              <goal>compileTests</goal>
              <goal>removeStubs</goal>
              <goal>removeTestStubs</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.spockframework</groupId>
        <artifactId>spock-bom</artifactId>
        <version>2.0-M3-groovy-3.0</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

</project>
```

## Define an annotation to log a method

You can configure aspects by configuring an advice in a variety of ways. You can configure an advice to be applied on all classes in a set of packages. In this case, however, we'll restrict ourselves to the methods that we annotate with our custom annotation. 

This is a prudent and flexible approach because 
- we need not log all the methods, in the first place, and bloat our logs, and 
- we can control the logging on individual methods using the values provided to the annotation

Let's define a custom annotation for this purpose.

```java
// src/main/java/dev/mflash/guides/logging/annotation/LogEntryExit.java

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

The `@LogEntryExit` annotation can accept

- a `value` with which you may customize the logging level; by default, it is `INFO`.
- a `showExecutionTime` flag to toggle whether you want to log the time it takes the method to finish executing; by default, it is `true`.
- a `unit` flag that calculates the duration of execution in the specified units; by default, it is `seconds`.
- a `showArgs` flag to toggle whether to display the arguments received by a method; by default, it is `false`.
- a `showResult` flag to toggle whether to display the result returned by the method; by default, it is `false`.

## Define the aspect with an advice to log the methods

Now, we need to apply the advice around the methods that are annotated with `@LogEntryExit` annotation. An implementation may look like this.

```java
// src/main/java/dev/mflash/guides/logging/aspect/LogEntryExitAspect.java

@Aspect
@Component
public class LogEntryExitAspect {

  @Around("@annotation(dev.mflash.guides.logging.annotation.LogEntryExit)")
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

There's a lot to digest here. The `LogEntryExitAspect` class has a `log` method which accepts a `JoinPoint`.

> **JointPoint** As *AspectJ in Action* says, a *join point* is an identifiable execution point in a system. A call to a method is a join point, and so is a field access. [Chapter 3 'Understanding the join point model', pp 53]

In our case, we want to apply an advice *around* a method that's annotated by `@LogEntryExit` annotation and then we want to proceed with the execution. That's what a `ProceedingJoinPoint` provides the support for.

Furthermore, 
- we're extracting `CodeSignature` which provides `getParameterNames` method to extract the parameter names of the join point.
- we're extracting `MethodSignature` to find the current instance of the `@LogEntryExit` annotation and its associated options, with the help of which we can customize the logging output.
- with `MethodSignature`, we're also fetching the details of class in which the method is defined, the method's name and the list of arguments it receives.

We've static `log` method that logs the messages based on the log level specified in the annotation; this is a necessity because our implementation is based on **SLF4J 1.7** which does not provide an API to pass the log level at runtime. Therefore, we've to resort to a `switch` like this -

```java
// src/main/java/dev/mflash/guides/logging/aspect/LogEntryExitAspect.java

@Aspect
@Component
public class LogEntryExitAspect {

  // rest of the code

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

Note that we're using [switch expressions](https://openjdk.java.net/jeps/361) which were introduced in Java 13 and are now a standard feature in Java 14.

We've defined `entry` and `exit` methods that prepare the log message depending on the options received through the annotation.

```java{13-23,33,37}
// src/main/java/dev/mflash/guides/logging/aspect/LogEntryExitAspect.java

@Aspect
@Component
public class LogEntryExitAspect {

  // rest of the code

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

  // rest of the code
}
```

In case of the `entry` method, we're generating a map of parameters and arguments of the method and adding them to log message if `showArgs` flag is enabled. Similarly, we're adding the duration of execution and the result returned by the method to the log message based on `showExecutionTime` and `showResult` flags respectively. You'll also notice Java 8's [`StringJoiner`](https://docs.oracle.com/javase/8/docs/api/java/util/StringJoiner.html) in action here which is particularly suited to construct a sequence of string separated by a delimiter.

Together the entire implementation looks like this.

```java
// src/main/java/dev/mflash/guides/logging/aspect/LogEntryExitAspect.java

@Aspect
@Component
public class LogEntryExitAspect {

  @Around("@annotation(dev.mflash.guides.logging.annotation.LogEntryExit)")
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

Spring AOP works in conjunction with Spring IoC container by creating dynamic proxies for AOP proxies (more details [here](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop)). Therefore, we need to mark the aspect as a bean (using `Component` stereotype annotation).

## Method logging in action

To demonstrate the usage, create a `GreetingService` with a method annotated with `@LogEntryExit` annotation as follows.

```java
// src/main/java/dev/mflash/guides/logging/service/GreetingService.java

@Service
public class GreetingService {

  @LogEntryExit(showArgs = true, showResult = true, unit = ChronoUnit.MILLIS)
  public String greet(String name) {
    return "Hello, " + resolveName(name) + "!";
  }

  public String resolveName(String name) {
    return !name.isBlank() ? name : "world";
  }
}
```

Inject this service in the `Launcher` and call it through `CommandLineRunner`.

```java
// src/main/java/dev/mflash/guides/logging/Launcher.java

@SpringBootApplication
public class Launcher implements CommandLineRunner {

  private final GreetingService greetingService;

  public Launcher(GreetingService greetingService) {
    this.greetingService = greetingService;
  }

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  public @Override void run(String... args) throws Exception {
    greetingService.greet("Joe");
    greetingService.greet("Jane");
  }
}
```

Launch the application and you'd see the method logs on the console.

```sh
2020-09-13 17:57:08.616  INFO 1848 --- [main] d.m.g.logging.service.GreetingService : Started greet method with args: {name=Joe}
2020-09-13 17:57:08.626  INFO 1848 --- [main] d.m.g.logging.service.GreetingService : Finished greet method in 9 millis with return: Hello, Joe!
2020-09-13 17:57:08.626  INFO 1848 --- [main] d.m.g.logging.service.GreetingService : Started greet method with args: {name=Jane}
2020-09-13 17:57:08.627  INFO 1848 --- [main] d.m.g.logging.service.GreetingService : Finished greet method in 0 millis with return: Hello, Jane!
```

Feel free to play with other options of the `@LogEntryExit` annotation.

## Testing the aspect

To test whether the `log` method is applying the advice on the annotated method or not, we'll have to monitor the logged events and then apply assertions on them. Unfortunately, `slf4j` doesn't provide an API to do this. However, we can leverage [Logback](http://logback.qos.ch/)'s API (the default underlying logger in Spring) to obtain a list of logged events. To do this, let's define a custom appender.

```groovy
// src/test/groovy/dev/mflash/guides/logging/aspect/AspectAppender.groovy

class AspectAppender extends AppenderBase<ILoggingEvent> {

  def events = new ArrayList<ILoggingEvent>()

  @Override
  protected void append(ILoggingEvent event) {
    events.add(event)
  }
}
```

And use this appender in the Spock specification that verifies success and failure scenarios for the aspect.

```groovy
// src/test/groovy/dev/mflash/guides/logging/aspect/LogEntryExitAspectSpec.groovy

class LogEntryExitAspectSpec extends Specification {

  @Shared GreetingService serviceProxy
  @Shared AspectAppender appender

  def setup() {
    def entryExitAspect = new LogEntryExitAspect()
    def aspectJProxyFactory = new AspectJProxyFactory(new GreetingService())
    aspectJProxyFactory.addAspect(entryExitAspect)

    def aopProxy = new DefaultAopProxyFactory().createAopProxy(aspectJProxyFactory)

    serviceProxy = aopProxy.getProxy() as GreetingService
    appender = new AspectAppender()
    appender.start()

    def logger = LoggerFactory.getLogger(GreetingService) as Logger
    logger.addAppender(appender)
  }

  def cleanup() {
    appender.stop()
  }

  def 'advice should fire with logs'() {
    when:
    serviceProxy.greet('Veronica')

    then:
    !appender.events.isEmpty()
    appender.events.any {
      event -> event.message == 'Started greet method with args: {name=Veronica}'
    }
    appender.events.any {
      event ->
        event.message.startsWith('Finished greet method in ') &&
            event.message.endsWith('millis with return: Hello, Veronica!')
    }
  }

  def 'advice should not fire on methods without annotation'() {
    when:
    serviceProxy.resolveName('Veronica')

    then:
    appender.events.isEmpty()
  }
}
```

In this specification,
- in the `setup` block, we're initializing the `LogEntryExitAspect` and injecting it in an `AopProxy` used as the `GreetingService`. We're also initializing the `AspectAppender` we defined earlier and attaching it to the logger of the `GreetingService`; whenever this logger's methods get called, the logging events will be added to the list maintained by `AspectAppender`.
- in the `cleanup` block, we're tearing down the appender.
- the first scenario verifies the positive case that the logs are actually written when the `GreetingService.greet` method is called.
- the second scenario verifies the negative case that the logs are not written for the methods without `@LogEntryExit` annotation.

## Limitations of this approach

- You cannot selectively ignore the arguments being logged. If a value is sensitive (for legal or security reasons), this implementation is not flexible enough to handle such a usecase.
- This approach relies on Spring AOP; it doesn't work with classes that Spring IoC container is not aware of.
- All the limitations of Spring AOP and Aspects apply on this approach; you can't log private methods and you can't extend this approach for advising fields.

## References

**Source Code** &mdash; [method-entry-exit-logging](https://gitlab.com/mflash/spring-guides/-/tree/master/method-entry-exit-logging)

**Related**
- [Aspect Oriented Programming with Spring](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop)
- [AspectJ in Action](https://livebook.manning.com/book/aspectj-in-action-second-edition/chapter-3/18) by Ramnivas Laddad
- [The AspectJ Project](https://www.eclipse.org/aspectj/)
