---
slug: "2021/10/10/weaving-aspects-at-compile-time-with-aspectj"
title: "Weaving aspects at compile-time with AspectJ"
description: "AspectJ is an aspect-oriented programming (AOP) extension for Java that manipulates bytecode at compile-time or load-time. This post explores compile-time weaving to log method entry and exit."
date: 2021-10-10 15:12:18
update: 2025-12-22 20:45:46
type: "guide"
---

[AspectJ](https://eclipse.dev/aspectj/) is an aspect-oriented programming (AOP) extension for Java. It _weaves_ aspects into Java bytecode at either compile-time or load-time. In a [previous post](/post/2020/09/13/logging-methods-with-aspectj-in-a-spring-application/), we explored load-time weaving using Spring AOP. In this post, we'll revisit the same example, and reimplement it using the AspectJ Compiler `ajc` to weave aspects at compile time.

:::note{.setup}
The code in this post is written using:

- Java 25
- AspectJ 1.9.25.1
- JUnit 6.0.1
- Maven 3.9.12
:::

Create a Maven project using the following `pom.xml`.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>aop-compile-time</artifactId>
	<version>2.0.0</version>

	<properties>
		<java.version>25</java.version>
		<maven.compiler.source>${java.version}</maven.compiler.source>
		<maven.compiler.target>${java.version}</maven.compiler.target>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<aspectj.version>1.9.25.1</aspectj.version>
		<junit.version>6.0.1</junit.version>
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
			<version>1.5.22</version>
		</dependency>

		<dependency>
			<groupId>org.assertj</groupId>
			<artifactId>assertj-core</artifactId>
			<version>3.27.6</version>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter-api</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter-engine</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter-params</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.junit</groupId>
				<artifactId>junit-bom</artifactId>
				<version>${junit.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<version>3.5.4</version>
			</plugin>
		</plugins>
	</build>

</project>
```

## Implement an advice for logging a method

Let's define an annotation `@LogEntryExit` to decorate a method for logging.

```java
package com.example.aop.annotation;

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

This annotation supports the following options to customize logging behavior.

- `value` specifies the logging level.
- `showExecutionTime` enables logging the duration of method execution.
- `unit` defines the time unit used to calculate the duration of method execution.
- `showArgs` enables logging of the method arguments.
- `showResult` enables logging of the method's return value.

When a method is annotated with `@LogEntryExit`, we want to log its entry and exit. Let's implement an aspect `LogEntryExitAspect` to do this.

```java {24}
package com.example.aop.aspect;

import com.example.aop.annotation.LogEntryExit;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Aspect
public final class LogEntryExitAspect {

	@Around("execution(* *(..)) && @annotation(com.example.aop.annotation.LogEntryExit)")
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

Note the _pointcut expressions_ used here:

- `execution(* *(..))` selects all method executions
- `@annotation(com.example.aop.annotation.LogEntryExit)` selects the methods annotated by `@LogEntryExit`

In an `@Around` aspect, AspectJ applies advice to both method calls and method executions. That's why we need `execution(* *(..))` expression to ensure that logging occurs only when a method is actually executed.

The logging logic lives in the `log` method, which receives a `ProceedingJoinPoint`. A _join point_ is a place where crosscutting actions happen, such as reading or writing a field, or calling or executing a method, constructor, or exception handler. A `ProceedingJoinPoint` gives us access to a method execution, allowing us to run custom logic, and _proceed_ with the original execution.

In this example, the `ProceedingJoinPoint` is used to extract method parameter names through `CodeSignature`, and retrieve class details, method arguments, and the options provided to the `@LogEntryExit` annotation through `MethodSignature`.

## Configure the AspectJ Compiler

To modify the bytecode of methods annotated with `@LogEntryExit`, we need to configure AspectJ Compiler `ajc`. One way to do this is by using [AspectJ Maven Plugin](https://github.com/dev-aspectj/aspectj-maven-plugin) by modifying `pom.xml` as follows.

```xml ins{15..37}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

	<!-- rest of the pom.xml -->

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<version>3.5.4</version>
			</plugin>
			<plugin>
				<groupId>dev.aspectj</groupId>
				<artifactId>aspectj-maven-plugin</artifactId>
				<version>1.14.1</version>
				<dependencies>
					<dependency>
						<groupId>org.aspectj</groupId>
						<artifactId>aspectjtools</artifactId>
						<version>${aspectj.version}</version>
					</dependency>
				</dependencies>
				<configuration>
					<complianceLevel>${java.version}</complianceLevel>
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

Note that `ajc` is configured to weave classes during the `compile` and `test-compile` phases of Maven's lifecycle. We also need to set the `complianceLevel` for the source and target versions of Java; it is configured to match the project's Java version.

The `showWeaveInfo` outputs useful details during the weaving process. For example, when you run `mvn compile`, it may show the weaving logs as follows.

```log
[INFO] --- aspectj:1.14.1:compile (default) @ aop-compile-time ---
[INFO] Showing AJC message detail for messages of types: [error, warning, fail]
[INFO] Join point 'method-execution(java.lang.String com.example.aop.GreetingHandler.greet(java.lang.String))' in Type 'com.example.aop.GreetingHandler' (GreetingHandler.java:10) advised by around advice from 'com.example.aop.aspect.LogEntryExitAspect' (LogEntryExitAspect.java:25)
[INFO] Join point 'method-execution(java.lang.String com.example.aop.GreetingHandler.resolveName(java.lang.String))' in Type 'com.example.aop.GreetingHandler' (GreetingHandler.java:15) advised by around advice from 'com.example.aop.aspect.LogEntryExitAspect' (LogEntryExitAspect.java:25)
```

## Compile-time weaving in action

To verify if this implementation works, create a class `GreetingHandler` with some sample methods.

```java
package com.example.aop;

import com.example.aop.annotation.LogEntryExit;

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

	public void resolveNothing(String randomString) {
		IO.println("All good, nothing to resolve!");
	}
}
```

Both the public `greet` method and the private `resolveName` method are annotated with `@LogEntryExit`, so we expect their entry and exit logged.

Next, create a `Launcher` class to invoke these methods as follows.

```java
package com.example.aop;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Launcher {

	private static final Logger logger = LoggerFactory.getLogger(Launcher.class);
	private static final GreetingHandler handler = new GreetingHandler();

	void main() {
		logger.info("{}", handler.greet("Veronica"));
	}
}
```

Running the `Launcher` outputs the following logs.

```log
19:30:18.326 [main] INFO com.example.aop.GreetingHandler -- Started greet method with args: {name=Veronica}
19:30:18.327 [main] INFO com.example.aop.GreetingHandler -- Started resolveName method with args: {name=Veronica}
19:30:18.327 [main] INFO com.example.aop.GreetingHandler -- Finished resolveName method in 0 millis with return: Veronica
19:30:18.327 [main] INFO com.example.aop.GreetingHandler -- Finished greet method in 0 millis with return: Hello, Veronica!
19:30:18.327 [main] INFO com.example.aop.Launcher -- Hello, Veronica!
```

Feel free to explore other `@LogEntryExit` options.

## Testing the aspect

To test the `LogEntryExitAspect`, we can inspect the logs and verify that expected messages are printed during the execution. Let's write a custom log appender `AspectAppender` using [Logback](http://logback.qos.ch/)'s appender API to capture the logging events, and attach it to the `GreetingHandler` logger.

```java
package com.example.aop.aspect;

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

In the unit tests, we can call the `GreetingHandler` methods, and test the captured events to confirm that entry and exit logs are recorded.

```java
package com.example.aop.aspect;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import com.example.aop.GreetingHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

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

## Outro

- Compile-time weaving is fast since all bytecode is woven before execution.
- It requires access to source code; if that's not available, you need to use build-time or load-time weaving. Spring AOP, for example, uses load-time weaving using proxies.
- You can weave public or private methods of a Java class.
- The setup is simpler than agent-based approaches used for build-time or load-time weaving.
- It introduces another compiler, `ajc`, in the compile process. Some IDEs may not provide support for this compiler out-of-box.

---

**Source code**

- [aop-compile-time](https://github.com/Microflash/backstage/tree/main/java/aop-compile-time)

**Related**

- Ramnivas Laddad, [AspectJ in Action](https://www.manning.com/books/aspectj-in-action-second-edition), Manning [2009]
- [The AspectJ Project](https://eclipse.dev/aspectj/)
- [The AspectJ Programming Guide](https://eclipse.dev/aspectj/doc/released/progguide/index.html)
