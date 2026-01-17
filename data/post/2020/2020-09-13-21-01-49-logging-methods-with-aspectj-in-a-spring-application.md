---
slug: "2020/09/13/logging-methods-with-aspectj-in-a-spring-application"
title: "Logging methods with AspectJ in a Spring application"
date: 2020-09-13 21:01:49
update: 2025-12-22 23:32:58
type: "guide"
---

Method logging is a useful technique for collecting runtime data, such as execution time, input parameters, and return values, about a method. While we can do this manually, it becomes tedious at scale. It makes sense to be lazy here and automate it. In this post, we'll build a consistent and reusable method logging approach using aspects and Spring AOP.

:::note{.setup}
The code in this post is written using:

- Java 25
- Spring Boot 4.0.1
- AspectJ 1.9.25.1
- Maven 3.9.12
:::

Generate a Maven project using the following `pom.xml`.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8" ?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.0.1</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot4-aop-method-logging</artifactId>
	<version>3.0.0</version>

	<properties>
		<java.version>25</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter</artifactId>
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

## Implement an advice for logging a method

We can create aspects in several ways, for example, by applying an advice to all classes within a specific package. However, a more pragmatic and intentional approach is to log only the methods decorated with a custom annotation. This annotation can accept options with which we can customize the logging behavior.

```java
package com.example.method.logging.annotation;

import org.slf4j.event.Level;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.temporal.ChronoUnit;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogEntryExit {

	Level value() default Level.INFO;

	ChronoUnit unit() default ChronoUnit.SECONDS;

	boolean showArgs() default false;

	boolean showResult() default false;

	boolean showExecutionTime() default true;
}
```

`@LogEntryExit` supports the following options to tweak logging behavior.

- `value` specifies the logging level.
- `showExecutionTime` enables logging the duration of method execution.
- `unit` defines the time unit used to calculate the duration of method execution.
- `showArgs` enables logging of the method arguments.
- `showResult` enables logging of the method's return value.

To apply the advice around the methods annotated with `@LogEntryExit`, we can use the following aspect.

```java {26,46,52}
package com.example.method.logging.aspect;

import com.example.method.logging.annotation.LogEntryExit;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;
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

		var annotation = method.getAnnotation(LogEntryExit.class);
		ChronoUnit unit = annotation.unit();
		boolean showArgs = annotation.showArgs();
		boolean showResult = annotation.showResult();
		boolean showExecutionTime = annotation.showExecutionTime();
		String methodName = method.getName();
		Object[] methodArgs = point.getArgs();
		String[] methodParams = codeSignature.getParameterNames();
		Level level = annotation.value();
		Logger logger = LoggerFactory.getLogger(method.getDeclaringClass());

		logger.atLevel(level).log(entry(methodName, showArgs, methodParams, methodArgs));

		var start = Instant.now();
		var response = point.proceed();
		var end = Instant.now();
		var duration = String.format("%s %s", unit.between(start, end), unit.name().toLowerCase());

		logger.atLevel(level).log(exit(methodName, duration, response, showResult, showExecutionTime));

		return response;
	}

	static String entry(String methodName, boolean showArgs, String[] params, Object[] args) {
		var message = new StringJoiner(" ").add("Started").add(methodName).add("method");

		if (showArgs && Objects.nonNull(params) && Objects.nonNull(args) && params.length == args.length) {

			Map<String, Object> values = new HashMap<>(params.length);

			for (int i = 0; i < params.length; i++) {
				values.put(params[i], args[i]);
			}

			message.add("with args:").add(values.toString());
		}

		return message.toString();
	}

	static String exit(String methodName, String duration, Object result, boolean showResult, boolean showExecutionTime) {
		var message = new StringJoiner(" ").add("Finished").add(methodName).add("method");

		if (showExecutionTime) {
			message.add("in").add(duration);
		}

		if (showResult) {
			message.add("with return:").add(result.toString());
		}

		return message.toString();
	}
}
```

- `@Aspect` tells Spring this bean contains AOP advice. Spring AOP uses Spring IoC container, and creates [AOP proxies](https://docs.spring.io/spring-framework/reference/core/aop/introduction-proxies.html) that apply this aspect at runtime.
- The `@Around` advice selects the methods annotated with `@LogEntryExit`, using `@annotation(com.example.method.logging.annotation.LogEntryExit)` pointcut expression.
- When the selected method starts executing, it activates the `log` method which applies the advice _around_ `ProceedingJoinPoint`, and _proceeds_ with the original execution.

:::note{title="JointPoint"}
A _join point_ is an identifiable execution point in a system. Calling or executing a method, constructor or exception handler is a join point, and so is reading or writing a field. In [Spring AOP](https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html), a join point always represents a method execution.
:::

In this example, the `ProceedingJoinPoint` provides us method parameter names through `CodeSignature`, and supplies class details, method arguments, and the options defined on the `@LogEntryExit` annotation through `MethodSignature`. This helps us write the `entry` and `exit` methods used to print the logs.

## Method logging in action

Create a `GreetingService` with a method annotated with `@LogEntryExit` as follows.

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

```java {15..21}
package com.example.method.logging;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Launcher {

	void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(GreetingService greetingService) {
		return _ -> {
			greetingService.greet("Joe");
			greetingService.greet("Jane");
		};
	}
}
```

Launch the application and inspect the method logs.

```log
2025-12-22T23:04:38.209 INFO 2033 --- [main] c.e.method.logging.GreetingService : Started greet method with args: {name=Joe}
2025-12-22T23:04:38.209 INFO 2033 --- [main] c.e.method.logging.GreetingService : Finished greet method in 0 millis with return: Hello, Joe!
2025-12-22T23:04:38.209 INFO 2033 --- [main] c.e.method.logging.GreetingService : Started greet method with args: {name=Jane}
2025-12-22T23:04:38.209 INFO 2033 --- [main] c.e.method.logging.GreetingService : Finished greet method in 0 millis with return: Hello, Jane!
```

Feel free to experiment with other `@LogEntryExit` options.

## Testing the aspect

To verify that the `log` method is applying advice to annotated methods, we can inspect the emitted log events and assert against them in the tests. Unfortunately, **SLF4J** doesn't offer an API to capture log output programmatically. However, we can use [Logback](http://logback.qos.ch/)'s appender API to implement an `AspectAppender` to capture a list of logged events.

```java
package com.example.method.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;

import java.util.ArrayList;
import java.util.List;

public class AspectAppender extends AppenderBase<ILoggingEvent> {

	final List<ILoggingEvent> events = new ArrayList<>();

	@Override
	protected void append(ILoggingEvent event) {
		events.add(event);
	}
}
```

Now, we can attach this appender to the logger of `GreetingService`. Whenever its public methods are called, a logging event is added to the list maintained by `AspectAppender` using which we can test the captured events.

```java
package com.example.method.logging;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import com.example.method.logging.aspect.LogEntryExitAspect;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;

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
}
```

## Outro

- You can't selectively exclude specific arguments from being logged. If you're dealing with legally sensitive data, highly personal information, or secrets, you'll have to use a more specialized approach to mask such information.
- This approach relies on Spring AOP, so only methods of Spring-managed beans can be annotated and logged.
- All standard Spring AOP limitations apply here: you can't use this approach to advise private methods and field access.

---

**Previous versions**

- [:time[2023-11-25T11:46:56]](/archive/2020/09/13/logging-methods-with-aspectj-in-a-spring-application--1): Discusses method logging with Spring Boot 3 on Java 21

**Source code**

- [springboot4-aop-method-logging](https://github.com/Microflash/backstage/tree/main/spring/springboot4-aop-method-logging)

**Related**

- [Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
- Ramnivas Laddad, [AspectJ in Action](https://www.manning.com/books/aspectj-in-action-second-edition), Manning [2009]
- [The AspectJ Project](https://eclipse.dev/aspectj/)
