---
slug: "2020/09/13/logging-methods-with-aspectj-in-a-spring-application"
title: "Logging methods with AspectJ in a Spring application"
description: "Method logging is a common pattern for gathering method-related data, such as execution time, inputs, and outputs. Learn how you can automate this process using AspectJ in a Spring application."
date: 2020-09-13 21:01:49
update: 2023-11-25 11:46:56
category: "guide"
---

Method logging is a common pattern to collect data about a method. This could be execution time, the inputs and outputs of the method, etc. You can do this by using a logger but since this is a repetitive task, it makes sense to automate it. That's exactly what we'll do in this post.

:::setup
The code written for this post uses:

- Java 21
- Spring Boot 3.2.0
- AspectJ 1.9.20
- Maven 3.9.5
:::

Generate a Maven project using the following `pom.xml`.

```xml caption='pom.xml'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot3-aop-method-logging</artifactId>
	<version>2.0.0</version>

	<properties>
		<java.version>21</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.aspectj</groupId>
			<artifactId>aspectjweaver</artifactId>
		</dependency>
		<dependency>
			<groupId>org.aspectj</groupId>
			<artifactId>aspectjrt</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

## Define an annotation to log a method

You can create aspects by configuring an advice in a variety of ways. You can apply an advice on all classes in specified packages. But, you may not need to log *all* the methods, or you may want to log some methods differently. To do this, you can define an annotation, as follows, and annotate the methods that you need to log. By passing values to the annotation, you can customize the logging behavior.

```java
package com.example.method.logging.annotation;

import org.springframework.boot.logging.LogLevel;

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

The `@LogEntryExit` annotation can accept

- a `value` that declares the logging level; by default, it is `INFO`.
- a `showExecutionTime` flag to enable logging the execution time of the method; by default, it is `true`.
- a `unit` that declares the unit of the duration of execution; by default, it is `seconds`.
- a `showArgs` flag to toggle whether to display the arguments received by the method; by default, it is `false`.
- a `showResult` flag to toggle whether to display the result returned by the method; by default, it is `false`.

## Define the aspect with an advice to log the methods

Apply the advice around the methods annotated with `@LogEntryExit` annotation, as follows.

```java
package com.example.method.logging.aspect;

import com.example.method.logging.annotation.LogEntryExit;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.logging.LogLevel;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Aspect
@Component
public class LogEntryExitAspect {

	@Around("@annotation(com.example.method.logging.annotation.LogEntryExit)")
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

	// ...
}
```

There's a lot to digest here. The `LogEntryExitAspect` class has a `log` method that accepts a `JoinPoint`.

:::note{title=JointPoint}
As *AspectJ in Action* says, a *join point* is an identifiable execution point in a system. A call to a method is a join point, and so is field access. [Chapter 3 'Understanding the join point model', pp 53] For more details, refer to [AOP Concepts](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-introduction-defn) docs.
:::

Here, we want to apply an advice *around* a method that's annotated by `@LogEntryExit` annotation, and proceed with the execution. That's what a `ProceedingJoinPoint` provides the support for.

Furthermore, we obtain
- `CodeSignature` to get the parameter names of the join point.
- `MethodSignature` to find the current instance of the `@LogEntryExit` annotation and its associated options. Using them, we customize the logging output by calling a static `log` method.
- `MethodSignature` to fetch the details of the class that contains the method. `MethodSignature` also provides the method's name and the list of arguments it receives.

The following static `log` method logs the messages based on the log level specified in the annotation. We need to do this because Spring Boot uses **SLF4J 1.7** which doesn't offer an API to pass the log level at runtime.

```java
@Aspect
@Component
public class LogEntryExitAspect {

	// ...

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

We've also defined `entry` and `exit` methods to prepare the log message based on the options received by the annotation.

```java {11..21,31,35}
@Aspect
@Component
public class LogEntryExitAspect {

	// ...

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

	// ...
}
```

In the `entry` method, we generate a map of parameters and arguments of the method, and add them to the log message if `showArgs` flag is `true`. Similarly, we add the duration of execution, and the result returned by the method to the log message based on the `showExecutionTime` and `showResult` flags respectively.

Together the entire implementation looks like this.

```java
package com.example.method.logging.aspect;

import com.example.method.logging.annotation.LogEntryExit;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.logging.LogLevel;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Aspect
@Component
public class LogEntryExitAspect {

	@Around("@annotation(com.example.method.logging.annotation.LogEntryExit)")
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

Spring AOP works in tandem with Spring IoC container by creating dynamic proxies for AOP proxies (more details [here](https://docs.spring.io/spring-framework/reference/core/aop/introduction-proxies.html)). Thus, we need to mark the aspect as a bean (using `Component` stereotype annotation).

## Method logging in action

Create a `GreetingService` with a method annotated with `@LogEntryExit` annotation as follows.

```java {11}
package com.example.method.logging;

import com.example.method.logging.annotation.LogEntryExit;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;

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

```java {10..14, 22..23}
package com.example.method.logging;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Launcher implements CommandLineRunner {

	private final GreetingService greetingService;

	public Launcher(GreetingService greetingService) {
		this.greetingService = greetingService;
	}

	public static void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		greetingService.greet("Joe");
		greetingService.greet("Jane");
	}
}
```

Launch the application and you'd see the method logs on the console.

```log
2023-11-25T11:12:26.991  INFO 3502 --- [main] c.e.method.logging.GreetingService : Started greet method with args: {name=Joe}
2023-11-25T11:12:26.991  INFO 3502 --- [main] c.e.method.logging.GreetingService : Finished greet method in 0 millis with return: Hello, Joe!
2023-11-25T11:12:26.991  INFO 3502 --- [main] c.e.method.logging.GreetingService : Started greet method with args: {name=Jane}
2023-11-25T11:12:26.991  INFO 3502 --- [main] c.e.method.logging.GreetingService : Finished greet method in 0 millis with return: Hello, Jane!
```

Feel free to play with other options of the `@LogEntryExit` annotation.

## Testing the aspect

To test whether the `log` method is applying the advice on the annotated method, you can check the logged events and apply assertions on them. Unfortunately, **SLF4J** doesn't offer an API to do this. But, you can leverage [Logback](http://logback.qos.ch/)'s API (the default underlying logger in Spring) to get a list of logged events. To do this, define a custom appender.

```java
package com.example.method.logging;

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

Use this appender in the JUnit test to verify positive and negative scenarios for the aspect.

```java
package com.example.method.logging;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import com.example.method.logging.aspect.LogEntryExitAspect;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.slf4j.LoggerFactory;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class LogEntryExitAspectTest {

	private GreetingService greetingService;
	private AspectAppender aspectAppender;

	@BeforeEach
	void setUp() {
		final var entryExitAspect = new LogEntryExitAspect();
		final var proxyFactory = new AspectJProxyFactory(new GreetingService());
		proxyFactory.addAspect(entryExitAspect);

		final AopProxy aopProxy = new DefaultAopProxyFactory().createAopProxy(proxyFactory);
		greetingService = (GreetingService) aopProxy.getProxy();

		aspectAppender = new AspectAppender();
		aspectAppender.setContext(new LoggerContext());
		aspectAppender.start();

		final Logger logger = (Logger) LoggerFactory.getLogger(GreetingService.class);
		logger.addAppender(aspectAppender);
	}

	@AfterEach
	void cleanUp() {
		aspectAppender.stop();
	}

	@Test
	@DisplayName("Should fire advice with logs")
	void shouldFireAdviceWithLogs() {
		greetingService.greet("Veronica");

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
	@DisplayName("Should not fire advice without annotation")
	void shouldNotFireAdviceWithoutAnnotation() {
		greetingService.resolveName("Veronica");

		assertThat(aspectAppender.events).isEmpty();
	}

	// ...
}
```

In this test,
- the `setUp` method initializes the `GreetingService` by wrapping it in a `AopProxy`. It also initializes the `AspectAppender` defined earlier and attaches it to the logger of the `GreetingService`; whenever the methods of this service get called, a logging event gets added to the list maintained by `AspectAppender`.
- the `cleanUp` method tears down the appender.
- the first test `Should fire advice with logs` verifies the positive case where the entry and exit are logged when the `GreetingService.greet` method is called.
- the second test `Should not fire advice without annotation` verifies the negative case where neither entry nor exit is logged for a method without `@LogEntryExit` annotation.

## Limitations of this approach

- You can't selectively ignore the logged arguments. If a value is sensitive (for legal or security reasons), this implementation isn't flexible enough to handle such a usecase (although, you can extend it to handle such usecases).
- This approach relies on Spring AOP; you can't annotate methods that are not part of a Spring bean.
- All the limitations of Spring AOP and Aspects apply to this approach; you can't log private methods and you can't extend this approach for advising the fields.

---

**Previous versions**

- [:time{datetime="2021-09-02T16:21:00.000Z"}](/archive/2020/09/13/logging-methods-with-aspectj-in-a-spring-application--1): Discusses method logging with Spring Boot 2 on Java 16

**Source code**

- [springboot3-aop-method-logging](https://github.com/Microflash/guides/tree/main/spring/springboot3-aop-method-logging)

**Related**

- [Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
- [AspectJ in Action](https://livebook.manning.com/book/aspectj-in-action-second-edition/chapter-3/18) by Ramnivas Laddad
- [The AspectJ Project](https://www.eclipse.org/aspectj/)
