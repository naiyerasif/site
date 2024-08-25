---
slug: "2022/09/18/detecting-a-connection-leak-with-hikari"
title: "Detecting a connection leak with Hikari"
description: "Failing to close connections can cause leaks, throttling the application. This post covers creating, detecting, and fixing such leaks using Hikari connection pool."
date: 2022-09-18 17:05:15
update: 2024-07-28 14:16:12
type: "post"
category: "guide"
---

Database connections are one of the most expensive resources in an application. That is why we use connection pools (such as [Hikari](https://github.com/brettwooldridge/HikariCP)) to manage them. However, if a developer fails to close a connection, it can stay open and may never return to the connection pool. This leads to a _connection leak_ which can throttle the application to a standstill.

In this post, we will create a scenario leading to a connection leak, and learn a way to detect and fix it.

:::note{.sm}
The examples in this post use

- Spring Boot 3.3.2
- Java 21
:::

## Putting together the connection leak

Grab the source code from [here](https://github.com/Microflash/guides/tree/main/spring/spring-data-jdbc-hikari-leak-detection) to get started. This is a Spring Boot application that uses the H2 in-memory database and Hikari connection pool.

Let us create an endpoint as follows.

```java
package com.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/book")
public class BookController {

	private final BookRepository repository;

	public BookController(BookRepository repository) {
		this.repository = repository;
	}

	@GetMapping("/{genre}")
	public List<Book> getAllBooksByGenre(@PathVariable Genre genre) {
		return repository.findAllByGenre(genre).toList();
	}
}
```

The `BookRepository` is a `CrudRepository` where we have declared a `findAllByGenre` method that returns a `Stream` of `Book`s. 

```java
package com.example;

import org.springframework.data.repository.CrudRepository;

import java.util.stream.Stream;

public interface BookRepository extends CrudRepository<Book, Long> {

	Stream<Book> findAllByGenre(Genre genre);
}
```

In the `application.yml`, configure Hikari to have a maximum of 5 database connections in the pool and a minimum of 2 database connections while idling.

```yml title="application.yml" {6..9}
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      maximum-pool-size: 5
      minimum-idle: 2
```

Start the application, open a terminal and hit the `/book` endpoint in a loop.

```sh prompt{1} output{2..8} {7..8}
for x in 1..7 { curl -s http://localhost:8080/book/SCI_FI }
[{"id":"08604814-3f3c-497b-aa0a-c9a2e89c1c60","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"08604814-3f3c-497b-aa0a-c9a2e89c1c60","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"08604814-3f3c-497b-aa0a-c9a2e89c1c60","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"08604814-3f3c-497b-aa0a-c9a2e89c1c60","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"08604814-3f3c-497b-aa0a-c9a2e89c1c60","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
{"timestamp":"2024-07-28T07:27:40.475+00:00","status":500,"error":"Internal Server Error","path":"/book/SCI_FI"}
{"timestamp":"2024-07-28T07:28:10.514+00:00","status":500,"error":"Internal Server Error","path":"/book/SCI_FI"}
```

:::note
I am using [Nushell](https://www.nushell.sh)'s [`for`](https://www.nushell.sh/commands/docs/for.html) command to invoke `curl` in a loop.
:::

Note that after 5 requests, the server started returning a `500 Internal Server Error`. Checking the logs, we find the following exception.

```log {1,3,30}
2024-07-28T12:57:40.466 ERROR 1477 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection] with root cause

java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30004ms (total=5, active=5, idle=0, waiting=0)
	at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:686) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:179) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:144) ~[HikariCP-5.1.0.jar:na]
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:127) ~[HikariCP-5.1.0.jar:na]
	at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:160) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:118) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:81) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:653) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:844) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:863) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:237) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.data.jdbc.repository.query.AbstractJdbcQuery.lambda$streamQuery$3(AbstractJdbcQuery.java:162) ~[spring-data-jdbc-3.3.2.jar:3.3.2]
	at org.springframework.data.jdbc.repository.query.PartTreeJdbcQuery.execute(PartTreeJdbcQuery.java:134) ~[spring-data-jdbc-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:170) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:158) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:164) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:143) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:379) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:138) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:223) ~[spring-aop-6.1.11.jar:6.1.11]
	at jdk.proxy2/jdk.proxy2.$Proxy72.findAllByGenre(Unknown Source) ~[na:na]
	at com.example.BookController.getAllBooksByGenre(BookController.java:23) ~[classes/:na]
	...
```

Hikari complains about the connection not being available when the controller calls the `BookRepository.findAllByGenre` method.

## Investigating the connection leak

We can get more information about the exception by turning on the `TRACE` logs for Hikari as follows.

```yml title="application.yml" ins{11..13}
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      maximum-pool-size: 5
      minimum-idle: 2

logging:
  level:
    com.zaxxer.hikari: TRACE
```

Restarting the application and launch `curl` in a loop with the same request as earlier. We get the following logs this time.

```log
2024-07-28T13:06:25.284 DEBUG 1591 --- [nio-8080-exec-1] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Timeout failure stats (total=5, active=5, idle=0, waiting=0)
2024-07-28T13:06:25.296 ERROR 1591 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection] with root cause

java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30002ms (total=5, active=5, idle=0, waiting=0)
...
```

After serving 5 requests, all the connections in the pool stay active and there are no idle connections available to handle further requests. This is a potential connection leak scenario.

To investigate connection leaks, Hikari offers a `leakDetectionThreshold` property which determines for how long a connection can stay out of the pool. Once this threshold crosses, Hikari throws an exception alerting about a potential connection leak. For the current scenario, we can set it to 30 seconds.

```yml title="application.yml" ins{10}
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      maximum-pool-size: 5
      minimum-idle: 2
      leak-detection-threshold: 30000

logging:
  level:
    com.zaxxer.hikari: TRACE
```

After the application restart, when we launch `curl` in a loop again, we get the following logs.

```log {1,3,9,27}
2024-07-28T13:13:58.432  WARN 1697 --- [ool housekeeper] com.zaxxer.hikari.pool.ProxyLeakTask     : Connection leak detection triggered for conn0: url=jdbc:h2:mem:sa user=SA on thread http-nio-8080-exec-1, stack trace follows

java.lang.Exception: Apparent connection leak detected
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:127) ~[HikariCP-5.1.0.jar:na]
	at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:160) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:118) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:81) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:653) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:844) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:863) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:237) ~[spring-jdbc-6.1.11.jar:6.1.11]
	at org.springframework.data.jdbc.repository.query.AbstractJdbcQuery.lambda$streamQuery$3(AbstractJdbcQuery.java:162) ~[spring-data-jdbc-3.3.2.jar:3.3.2]
	at org.springframework.data.jdbc.repository.query.PartTreeJdbcQuery.execute(PartTreeJdbcQuery.java:134) ~[spring-data-jdbc-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:170) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:158) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:164) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:143) ~[spring-data-commons-3.3.2.jar:3.3.2]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:379) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:138) ~[spring-tx-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.11.jar:6.1.11]
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:223) ~[spring-aop-6.1.11.jar:6.1.11]
	at jdk.proxy2/jdk.proxy2.$Proxy72.findAllByGenre(Unknown Source) ~[na:na]
	at com.example.BookController.getAllBooksByGenre(BookController.java:23) ~[classes/:na]
	...
```

The exception indicates that there is a potential connection when the controller calls the `BookRepository.findAllByGenre` method.

## Fixing the connection leak

Looking at the logs related to the connection leak, we find that the issue originates from `JdbcTemplate.queryForStream` method. The [docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html#queryForStream(java.lang.String,org.springframework.jdbc.core.RowMapper)) for this method state that:

> [The `queryForStream` method returns] the result Stream, containing mapped objects, needing to be closed once fully processed (e.g. through a try-with-resources clause).

So, closing the `Stream` should return the connection to the pool. We can do this by wrapping the `findAllByGenre` call in a try-with-resources which closes the `Stream` after usage.

```java del{29} ins{9,23,25..27,30}
package com.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/book")
public class BookController {

	private final BookRepository repository;

	public BookController(BookRepository repository) {
		this.repository = repository;
	}

	@GetMapping("/{genre}")
	public List<Book> getAllBooksByGenre(@PathVariable Genre genre) {
		final List<Book> books;

		try (final Stream<Book> booksByGenre = repository.findAllByGenre(genre)) {
			books = booksByGenre.toList();
		}

		return repository.findAllByGenre(genre).toList();
		return books;
	}
}
```

Alternatively, we can return a `Collection` instead of a `Stream` from the repository.

```java del{6,10} ins{5,11}
package com.example;

import org.springframework.data.repository.CrudRepository;

import java.util.Collection;
import java.util.stream.Stream;

public interface BookRepository extends CrudRepository<Book, Long> {

	Stream<Book> findAllByGenre(Genre genre);
	Collection<Book> findAllByGenre(Genre genre);
}
```

After any of the preceding changes, the `curl` requests work without any problem.

```sh prompt{1} output{2..8}
for x in 1..7 { curl -s http://localhost:8080/book/SCI_FI }
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
[{"id":"17f25fa3-7016-4526-bd0d-2c95a33c0401","title":"Dark Matter","genre":"SCI_FI","author":"Blake Crouch"}]
```

The following logs show that the connections are no longer active indicating that the active connections return to the pool.

```log
2024-07-28T13:26:42.317 DEBUG 1867 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Before cleanup stats (total=2, active=0, idle=2, waiting=0)
2024-07-28T13:26:42.318 DEBUG 1867 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After cleanup  stats (total=2, active=0, idle=2, waiting=0)
2024-07-28T13:26:42.318 DEBUG 1867 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool has sufficient level or currently being filled.
```

---

**Source code**

- [spring-data-jdbc-hikari-leak-detection](https://github.com/Microflash/guides/tree/main/spring/spring-data-jdbc-hikari-leak-detection)

**Related**

- [Randomly HikariPool pool becomes zero and HikariCP is not renewing/creating new connections](https://github.com/brettwooldridge/HikariCP/issues/1256)
- [Streaming Query Results](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-streaming)

