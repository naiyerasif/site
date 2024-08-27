---
slug: "2020/09/26/retrying-on-failure-with-resilience4j-and-aspects"
title: "Retrying on failure with Resilience4J and Aspects"
description: "Failure is unavoidable in a complex distributed system. Service timeouts, filesystem lockouts, and API unavailability are common. Learn how to recover from temporary failures using a retry pattern."
date: 2020-09-26 15:17:06
update: 2023-11-25 12:36:31
type: "guide"
---

Failure is an inevitability in a complex distributed system. A service may time out, a filesystem may run out of space or an API endpoint may be unavailable because of a failed deployment. Regardless of the reason, *it is impossible to eliminate failure; the only option is to design for it*.

In particular, we may want to prevent failure in our system in the first place. That's where techniques like [rate-limiting](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/) come into the picture which prevent an undesirable load on a system. However, in case a failure occurs, we may want to prevent it to cascade any further by using approaches such as [circuit-breaking](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) that restrain failure from spreading beyond a certain part of our system. Even better, if we know that a failure lasts only for a short time (a *transient failure*), we may attempt to recover from it by using recovery strategies. One such strategy is the **retry pattern** where we retry a call to a service for a given number of attempts using a carefully selected **backoff strategy**. 

:::note{title='Backoff Strategy'}
A backoff strategy is an algorithm that decides
- how to attempt a retry
- what should be the duration between the retries, and
- when to abandon any further attempts
:::

In this post, we'll explore how to implement a retry pattern for a Java method that may throw an exception. We'll use a library called [Resilience4J](https://github.com/resilience4j/resilience4j) which provides several fault-tolerance implementations including circuit breaking, retry, fallback, rate and time limiting, caching, etc. We'll only use the **Resilience4J Retry** module of this library.

:::note{.sm}
The code written for this post uses:

- Java 21
- Spring Boot 3.2.0
- Resilience4J Retry 2.1.0
- AspectJ 1.9.20
- Maven 3.9.5
:::

Generate a Maven project using the following `pom.xml`.

```xml title="pom.xml"
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
	<artifactId>springboot3-aop-retry-on-failure</artifactId>
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
			<groupId>io.github.resilience4j</groupId>
			<artifactId>resilience4j-retry</artifactId>
			<version>2.1.0</version>
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

## Define an annotation for retry

We'll create an annotation, say `@RetryOnFailure`. Any method decorated with this annotation will be retried on failure. This annotation may accept

- maximum number of retry attempts
- a backoff strategy (if there are many strategies available)
- a minimum interval between the retry attempts and a unit for this interval
- some randomization factor (if the backoff strategy supports it); the larger this value, the more random are patterns of the retry attempts
- a multiplier (if the backoff strategy is not a linear algorithm)
- a list of exceptions on which a retry attempt should be made
- a list of exceptions which should be ignored

This annotation can be implemented as follows.

```java
package com.example.retry.annotation;

import io.github.resilience4j.core.IntervalFunction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.temporal.ChronoUnit;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RetryOnFailure {

	int attempts() default 3;

	BackoffStrategy strategy() default BackoffStrategy.EXPONENTIAL_RANDOM;

	long interval() default IntervalFunction.DEFAULT_INITIAL_INTERVAL;

	ChronoUnit unit() default ChronoUnit.MILLIS;

	double randomizationFactor() default IntervalFunction.DEFAULT_RANDOMIZATION_FACTOR;

	double multiplier() default IntervalFunction.DEFAULT_MULTIPLIER;

	Class<? extends Throwable>[] retryExceptions() default {Throwable.class};

	Class<? extends Throwable>[] ignoreExceptions() default {};
}
```

## Define the backoff functions for retry

The `BackoffStrategy` is an enum that provides some possible types of backoff strategy; by default, it is set to be a *Random Exponential Backoff Strategy*.

```java
package com.example.retry.annotation;

public enum BackoffStrategy {
	NONE, RANDOM, LINEAR, LINEAR_RANDOM, GEOMETRIC, GEOMETRIC_RANDOM, EXPONENTIAL, EXPONENTIAL_RANDOM
}
```

Some of these strategies, such as *Random*, *Exponential*, and *Random Exponential*, are provided by Resilience4J's `IntervalFunction` interface (which also provides the values of `DEFAULT_INITIAL_INTERVAL`, `DEFAULT_RANDOMIZATION_FACTOR`, and `DEFAULT_MULTIPLIER` constants). We can define functions for the rest of the strategies.

```java
package com.example.retry.aspect;

import com.example.retry.annotation.BackoffStrategy;
import com.example.retry.annotation.RetryOnFailure;
import io.github.resilience4j.core.IntervalFunction;

import java.util.function.Function;

public class RetryOnFailureIntervalFunctions {

	private static IntervalFunction ofRandom(long interval, double randomizationFactor) {
		return IntervalFunction.ofRandomized(interval, randomizationFactor);
	}

	private static IntervalFunction ofLinear(long interval) {
		Function<Long, Long> linearBackoffFn = previous -> previous + interval;
		return IntervalFunction.of(interval, linearBackoffFn);
	}

	private static IntervalFunction ofLinearRandom(long interval, double randomizationFactor) {
		return attempt -> (long) randomize(ofLinear(interval).apply(attempt), randomizationFactor);
	}

	private static IntervalFunction ofGeometric(long interval, double multiplier) {
		Function<Long, Long> geometricBackoffFn = previous -> Math.round(previous * multiplier);
		return IntervalFunction.of(interval, geometricBackoffFn);
	}

	private static IntervalFunction ofGeometricRandom(long interval, double multiplier, double randomizationFactor) {
		return attempt -> (long) randomize(ofGeometric(interval, multiplier).apply(attempt), randomizationFactor);
	}

	private static IntervalFunction ofExponential(long interval) {
		return IntervalFunction.ofExponentialBackoff(interval);
	}

	private static IntervalFunction ofExponentialRandom(long interval, double multiplier, double randomizationFactor) {
		return IntervalFunction.ofExponentialRandomBackoff(interval, multiplier, randomizationFactor);
	}

	static double randomize(double current, double randomizationFactor) {
		final double delta = randomizationFactor * current;
		final double min = current - delta;
		final double max = current + delta;

		return (min + (Math.random() * (max - min + 1)));
	}
}
```

To get these functions based on the value of `BackoffStrategy` enum, we can define a factory method that would accept an instance of `@RetryOnFailure` annotation and return the corresponding function.

```java {11..27}
package com.example.retry.aspect;

import com.example.retry.annotation.BackoffStrategy;
import com.example.retry.annotation.RetryOnFailure;
import io.github.resilience4j.core.IntervalFunction;

import java.util.function.Function;

public class RetryOnFailureIntervalFunctions {

	public static IntervalFunction of(RetryOnFailure retry) {

		BackoffStrategy strategy = retry.strategy();
		long interval = retry.interval();
		double randomizationFactor = retry.randomizationFactor();
		double multiplier = retry.multiplier();

		return switch (strategy) {
			case RANDOM -> ofRandom(interval, randomizationFactor);
			case LINEAR -> ofLinear(interval);
			case LINEAR_RANDOM -> ofLinearRandom(interval, randomizationFactor);
			case GEOMETRIC -> ofGeometric(interval, multiplier);
			case GEOMETRIC_RANDOM -> ofGeometricRandom(interval, multiplier, randomizationFactor);
			case EXPONENTIAL -> ofExponential(interval);
			default -> ofExponentialRandom(interval, multiplier, randomizationFactor);
		};
	}

	private static IntervalFunction ofRandom(long interval, double randomizationFactor) {
		return IntervalFunction.ofRandomized(interval, randomizationFactor);
	}

	private static IntervalFunction ofLinear(long interval) {
		Function<Long, Long> linearBackoffFn = previous -> previous + interval;
		return IntervalFunction.of(interval, linearBackoffFn);
	}

	private static IntervalFunction ofLinearRandom(long interval, double randomizationFactor) {
		return attempt -> (long) randomize(ofLinear(interval).apply(attempt), randomizationFactor);
	}

	private static IntervalFunction ofGeometric(long interval, double multiplier) {
		Function<Long, Long> geometricBackoffFn = previous -> Math.round(previous * multiplier);
		return IntervalFunction.of(interval, geometricBackoffFn);
	}

	private static IntervalFunction ofGeometricRandom(long interval, double multiplier, double randomizationFactor) {
		return attempt -> (long) randomize(ofGeometric(interval, multiplier).apply(attempt), randomizationFactor);
	}

	private static IntervalFunction ofExponential(long interval) {
		return IntervalFunction.ofExponentialBackoff(interval);
	}

	private static IntervalFunction ofExponentialRandom(long interval, double multiplier, double randomizationFactor) {
		return IntervalFunction.ofExponentialRandomBackoff(interval, multiplier, randomizationFactor);
	}

	static double randomize(double current, double randomizationFactor) {
		final double delta = randomizationFactor * current;
		final double min = current - delta;
		final double max = current + delta;

		return (min + (Math.random() * (max - min + 1)));
	}
}
```

## Define an aspect to trigger the retry

To apply an advice on methods decorated with `@RetryOnFailure` annotation, we need to define an aspect that contains the logic for the retry.

```java {38..60}
package com.example.retry.aspect;

import com.example.retry.annotation.BackoffStrategy;
import com.example.retry.annotation.RetryOnFailure;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.function.Supplier;

@Aspect
@Component
public class RetryOnFailureAspect {

	@Around("@annotation(com.example.retry.annotation.RetryOnFailure)")
	public Object retry(ProceedingJoinPoint point) throws Throwable {
		var methodSignature = (MethodSignature) point.getSignature();
		Method method = methodSignature.getMethod();
		var target = Modifier.isStatic(method.getModifiers()) ? method.getDeclaringClass() : point.getTarget();
		var methodName = method.getName();

		Logger logger = LoggerFactory.getLogger(target.getClass());
		var annotation = method.getAnnotation(RetryOnFailure.class);
		int attempts = annotation.attempts();
		Class<? extends Throwable>[] retryExceptions = annotation.retryExceptions();
		Class<? extends Throwable>[] ignoreExceptions = annotation.ignoreExceptions();
		RetryConfig.Builder<Object> retryConfigBuilder = RetryConfig.custom()
				.maxAttempts(attempts)
				.retryExceptions(retryExceptions)
				.ignoreExceptions(ignoreExceptions);

		BackoffStrategy backoffStrategy = annotation.strategy();

		if (backoffStrategy.equals(BackoffStrategy.NONE)) {
			long interval = annotation.interval();
			ChronoUnit unit = annotation.unit();
			retryConfigBuilder.waitDuration(Duration.of(interval, unit));
		} else {
			var intervalFunction = RetryOnFailureIntervalFunctions.of(annotation);
			retryConfigBuilder.intervalFunction(intervalFunction);
		}

		RetryConfig retryConfiguration = retryConfigBuilder.build();
		var retryRegistry = RetryRegistry.of(retryConfiguration);
		var retry = retryRegistry.retry(methodName, retryConfiguration);
		var publisher = retry.getEventPublisher();
		publisher.onRetry(event -> logger.warn(event.toString()));

		Supplier<Object> responseSupplier = Retry.decorateSupplier(retry, getProceed(point));

		return responseSupplier.get();
	}

	private static Supplier<Object> getProceed(ProceedingJoinPoint point) {
		return () -> {
			try {
				return point.proceed();
			} catch (Throwable t) {
				throw new RuntimeException(t);
			}
		};
	}
}
```

Let's break things a bit to get through what's going on here.

- We start by extracting some method related information, e.g., which class invoked the method (`target`), the method's name (`methodName`), etc.
- We initialize the logger to log the retry events (`logger`).
- We extract the instance of `@RetryOnFailure` annotation (`annotation`) and it's corresponding values. We start preparing a retry configuration by setting the number of attempts and exceptions for retry. If the `BackoffStrategy` is `NONE`, we use a naive fixed duration retry else we use `RetryOnFailureIntervalFunctions.of` factory method to get a backoff function.
- We register the `retryConfiguration` on a `retryRegistry`. This is useful in case we want to use the same `retryConfiguration` for different methods and keep track of them.
- We fetch a `retry` instance for our method using `retryRegistry.retry` method. We also fetch a `RetryEventPublisher` so that we can log some events. In this implementation, we're logging the events on every retry but other events can also be logged using methods like `onSuccess`, `onError`, `onIgnoredError`, etc.
- We provide the actual method call `getProceed(point)` that needs to be retried through the `decorateSupplier` method. The `getProceed` method handles checked exceptions when `point.proceed` method is called.
- Finally, we return the results returned by the `responseSupplier` which hopefully returns a successful response after `point.proceed` method gets executed after one or multiple retries.

## Retry in action

To see the above implementation in action, let's create an endpoint that fetches a random number.

```java
package com.example.retry;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/random")
public class RandomlyFailingController {

	private final RandomlyFailingService service;

	public RandomlyFailingController(RandomlyFailingService service) {
		this.service = service;
	}

	@GetMapping
	public double getRandom() {
		return service.random();
	}
}
```

Let's also define the `RandomlyFailingService` with a method `random` returning a random number, with a twist: it arbitrarily fails if `Math.random` returns a value less than or equal to 0.5. When the `ArithmeticException` gets thrown, the retry pattern should kick into action and call the method again until it returns a value greater than 0.5 or the number of attempts (3, by default) is exhausted.

```java
package com.example.retry;

import com.example.retry.annotation.RetryOnFailure;
import org.springframework.stereotype.Service;

@Service
public class RandomlyFailingService {

	@RetryOnFailure
	public double random() {
		double random = Math.random();

		if (random <= 0.5) {
			throw new ArithmeticException("Value <= 0.5");
		}

		return random;
	}
}
```

Launch the application and send a few requests to the `/random` endpoint.

```sh prompt{1,3}
curl localhost:8080/random
0.7134497476889079
curl localhost:9080/random
0.9965539095077335
```

Sometimes, the response will be immediately returned but a few times, it may return after a delay (when a failure is being retried). In case of retries, we'd see the retry attempts logged on the console.

```log
2023-11-25T12:18:26.070  WARN 4781 --- [nio-8080-exec-3] c.example.retry.RandomlyFailingService   : 2023-11-25T12:18:26.070018+05:30[Asia/Kolkata]: Retry 'random', waiting PT0.554S until attempt '1'. Last attempt failed with exception 'java.lang.RuntimeException: java.lang.ArithmeticException: Value <= 0.5'.
2023-11-25T12:18:26.633  WARN 4781 --- [nio-8080-exec-3] c.example.retry.RandomlyFailingService   : 2023-11-25T12:18:26.633223+05:30[Asia/Kolkata]: Retry 'random', waiting PT0.875S until attempt '2'. Last attempt failed with exception 'java.lang.RuntimeException: java.lang.ArithmeticException: Value <= 0.5'.
```

Feel free to tweak the values of `@RetryOnFailure` annotation and run it through different scenarios.

## Testing the aspect

To write the tests for `RetryOnFailureAspect`, we'll check if the retry events are logged by the logger on a retry (similar to the strategy used in [Logging methods with AspectJ in a Spring application](/post/2020/09/13/logging-methods-with-aspectj-in-a-spring-application/)).

We'll begin by defining a custom appender that stores logged events in a list.

```java
package com.example.retry.aspect;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;

import java.util.ArrayList;
import java.util.List;

public class AspectAppender extends AppenderBase<ILoggingEvent> {

	List<ILoggingEvent> events = new ArrayList<>();

	protected @Override void append(ILoggingEvent event) {
		events.add(event);
	}
}
```

We'll also create a test service for this purpose where we can trigger a failure on demand (by passing a value less than or equal to 0).

```java
package com.example.retry.aspect;

import com.example.retry.annotation.RetryOnFailure;
import org.springframework.stereotype.Service;

@Service
public class RetryOnFailureTestService {

	@RetryOnFailure
	public double attempt(double value) {
		if (value <= 0) {
			throw new ArithmeticException("Value <= 0");
		}

		return value;
	}
}
```

Finally, we can write our JUnit test using the above implementations.

```java
package com.example.retry.aspect;

import ch.qos.logback.classic.Logger;
import org.assertj.core.api.SoftAssertions;
import org.assertj.core.api.junit.jupiter.SoftAssertionsExtension;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.LoggerFactory;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.DefaultAopProxyFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

@ExtendWith(SoftAssertionsExtension.class)
class RetryOnFailureAspectTest {

	private RetryOnFailureTestService service;
	private AspectAppender appender;

	@BeforeEach
	void setUp() {
		var retryAspect = new RetryOnFailureAspect();
		var aspectJProxyFactory = new AspectJProxyFactory(new RetryOnFailureTestService());
		aspectJProxyFactory.addAspect(retryAspect);
		var aopProxy = new DefaultAopProxyFactory().createAopProxy(aspectJProxyFactory);

		service = (RetryOnFailureTestService) aopProxy.getProxy();
		appender = new AspectAppender();
		appender.start();

		var logger = (Logger) LoggerFactory.getLogger(RetryOnFailureTestService.class);
		logger.addAppender(appender);
	}

	@AfterEach
	void tearDown() {
		appender.stop();
	}

	@Test
	@DisplayName("Advice should fire with retries on failure")
	void adviceShouldFireWithRetriesOnFailure(SoftAssertions softly) {
		var thrown = catchThrowable(() -> service.attempt(0));

		softly.assertThat(appender.events).hasSize(2);
		softly.assertThat(thrown).isInstanceOf(RuntimeException.class);
		softly.assertThat(appender.events.stream().anyMatch(
				event -> event.getMessage().contains("Retry 'attempt', waiting") && event.getMessage()
						.contains("Last attempt failed with exception"))).isTrue();
	}

	@Test
	@DisplayName("Advice should not fire on success")
	void adviceShouldNotFireOnSuccess() {
		service.attempt(1);
		service.attempt(2);

		assertThat(appender.events).isEmpty();
	}
}
```

Let's break down what's happening here.

- In the `setUp` method, we initialize the `RetryOnFailureAspect` and inject it in an `AopProxy`. The `AopProxy` is an interface provided by Spring AOP that returns proxied beans. In our case, this bean is nothing but an instance of `RetryOnFailureTestService`. We also initialize `AspectAppender` and attach it to the logger of `RetryOnFailureTestService`; whenever a retry is made, the `RetryEventPublisher.onRetry` method will log the events that would be available through this instance of `AspectAppender`.
- In the test `Advice should fire with retries on failure`, we simulate a retry scenario and check whether the retry happens. Note that, we're using [`SoftAssertions`](https://assertj.github.io/doc/#assertj-core-soft-assertions) that fail lazily after all the assertions have been executed.
- In the test `Advice should not fire on success`, we test a success scenario where the retry should not happen.
- In the `tearDown` method, we stop the appender.

---

**Previous versions**

- [:time{datetime="2020-09-26T15:17:06.000Z"}](/archive/2020/09/26/retrying-on-failure-with-resilience4j-and-aspects--1/): Discusses method retry on failure with Resilience4J Retry 1.5.0, Spring Boot 2 and Java 15

**Source code**

- [springboot3-aop-retry-on-failure](https://github.com/Microflash/guides/tree/main/spring/springboot3-aop-retry-on-failure)

**Related**

- [Resilience4J Retry docs](https://resilience4j.readme.io/docs/retry)
- [Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
