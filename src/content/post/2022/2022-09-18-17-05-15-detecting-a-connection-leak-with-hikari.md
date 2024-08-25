---
slug: "2022/09/18/detecting-a-connection-leak-with-hikari"
title: "Detecting a connection leak with Hikari"
description: "If a developer fails to close a database connection, it may never be returned to the connection pool. This leads to a connection leak which can throttle an app to a standstill. Learn a way to detect it using Hikari."
date: "2022-09-18 17:05:15"
update: "2022-09-18 17:05:15"
category: "guide"
tags: ["hikari", "jdbc", "database"]
---

Database connections are one of the most expensive resources for an app. That's why we use connection pools (like [Hikari](https://github.com/brettwooldridge/HikariCP)) to manage them. However, if a developer doesn't close a connection, it can stay open and may never be returned to the connection pool. This leads to a _connection leak_ which can throttle the app to a standstill.

In this post, we'll create a connection leak scenario, and learn a way to detect and fix it.

:::setup
The examples in this post use

- Spring Boot 2.7.3
- Java 17
:::

## Putting together the connection leak

Grab the source code from [here](https://github.com/Microflash/guides/tree/main/spring/spring-data-jdbc-hikari-leak-detection) to get started. This is a Spring Boot app that uses the H2 in-memory database and Hikari connection pool.

Let's expose an endpoint as follows.

```java
package dev.mflash.guides.spring.hikari.leakdetection;

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
		return repository.findAllByGenre(genre).collect(Collectors.toList());
	}
}
```

The `BookRepository` is a `CrudRepository` where we've declared a `findAllByGenre` method that returns a `Stream` of `Book`s. 

```java
package dev.mflash.guides.spring.hikari.leakdetection;

import org.springframework.data.repository.CrudRepository;

import java.util.stream.Stream;

public interface BookRepository extends CrudRepository<Book, Long> {

	Stream<Book> findAllByGenre(Genre genre);
}
```

In the `application.yml`, we'll configure Hikari to have a maximum of 10 database connections in the pool and a minimum of 5 database connections while idling.

```yml caption='application.yml' {6-9}
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      max-pool-size: 10
      min-idle: 5
```

Launch the app. After it is available for use, open a terminal and hit the `/book` endpoint in a loop.

```sh prompt{1} {12-13}
for x in 1..12 { curl http://localhost:8080/book/THRILLER }
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"f949e352-1adb-4fc4-81e3-2fb31857c927","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
{"timestamp":"2022-09-18T09:22:19.536+00:00","status":500,"error":"Internal Server Error","path":"/book/THRILLER"}
{"timestamp":"2022-09-18T09:22:49.563+00:00","status":500,"error":"Internal Server Error","path":"/book/THRILLER"}
```

:::note
I'm using [Nushell](https://www.nushell.sh)'s [`for`](https://www.nushell.sh/book/commands/for.html) command to launch `curl` in a loop.
:::

Note that after the initial 10 requests, the server started returning a `500 Internal Server Error`. Checking the logs, we find the following exception.

```log {1,3,31}
2022-09-18 14:56:24.269 ERROR 31080 --- [nio-8080-exec-3] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30009ms.] with root cause

java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30009ms.
	at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:696) ~[HikariCP-4.0.3.jar:na]
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:197) ~[HikariCP-4.0.3.jar:na]
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:162) ~[HikariCP-4.0.3.jar:na]
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128) ~[HikariCP-4.0.3.jar:na]
	at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:159) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:117) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:80) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:646) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:834) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:853) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:228) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.data.jdbc.repository.query.AbstractJdbcQuery.lambda$streamQuery$2(AbstractJdbcQuery.java:150) ~[spring-data-jdbc-2.4.2.jar:2.4.2]
	at org.springframework.data.jdbc.repository.query.PartTreeJdbcQuery.execute(PartTreeJdbcQuery.java:131) ~[spring-data-jdbc-2.4.2.jar:2.4.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:137) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:121) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:160) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:139) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:123) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:388) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:137) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:215) ~[spring-aop-5.3.22.jar:5.3.22]
	at jdk.proxy2/jdk.proxy2.$Proxy65.findAllByGenre(Unknown Source) ~[na:na]
	at dev.mflash.guides.spring.hikari.leakdetection.BookController.getAllBooksByGenre(BookController.java:23) ~[classes/:na]
	...
```

Hikari complains about the connection not being available when the `BookRepository.findAllByGenre` is called.

## Investigating the connection leak

We can get more information about the exception by turning on the `TRACE` logs for Hikari as follows.

```yml caption='application.yml' {11-13}
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      max-pool-size: 10
      min-idle: 5

logging:
  level:
    com.zaxxer.hikari: TRACE
```

After restarting the app and launching the `curl` in a loop with the same request as earlier, we get the following logs.

```log {3-5}
2022-09-18 15:00:26.063 DEBUG 22540 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After adding stats (total=10, active=0, idle=10, waiting=0)
...
2022-09-18 15:00:56.071 DEBUG 22540 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Pool stats (total=10, active=10, idle=0, waiting=1)
2022-09-18 15:00:56.071 DEBUG 22540 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool is at sufficient level.
2022-09-18 15:01:06.645 DEBUG 22540 --- [nio-8080-exec-6] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Timeout failure stats (total=10, active=10, idle=0, waiting=0)
2022-09-18 15:01:06.652 ERROR 22540 --- [nio-8080-exec-6] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30003ms.] with root cause
...
```

As seen in the logs, after serving 10 requests, all the connections in the pool stay active and there are no idle connections that can be used in further requests. This is a potential connection leak scenario.

To investigate connection leaks, Hikari offers a `leakDetectionThreshold` property which determines for how long a connection can stay out of the pool. Once this threshold is crossed, Hikari throws an exception alerting about a potential connection leak. For the current scenario, we can set it to 30 seconds.

```yml {10} caption='application.yml'
spring:
  datasource:
    url: jdbc:h2:mem:sa
    username: sa
    password: password
    hikari:
      pool-name: H2HikariPool
      max-pool-size: 10
      min-idle: 5
      leak-detection-threshold: 30000

logging:
  level:
    com.zaxxer.hikari: TRACE
```

After the app restart, when we launch the `curl` in a loop again, we encounter the following logs.

```log {3-5,30}
2022-09-18 15:07:31.168 DEBUG 52980 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Pool stats (total=10, active=10, idle=0, waiting=1)
2022-09-18 15:07:31.169 DEBUG 52980 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool is at sufficient level.
2022-09-18 15:07:48.494  WARN 52980 --- [ool housekeeper] com.zaxxer.hikari.pool.ProxyLeakTask     : Connection leak detection triggered for conn0: url=jdbc:h2:mem:sa user=SA on thread http-nio-8080-exec-1, stack trace follows

java.lang.Exception: Apparent connection leak detected
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128) ~[HikariCP-4.0.3.jar:na]
	at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:159) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:117) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:80) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:646) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:834) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:853) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:228) ~[spring-jdbc-5.3.22.jar:5.3.22]
	at org.springframework.data.jdbc.repository.query.AbstractJdbcQuery.lambda$streamQuery$2(AbstractJdbcQuery.java:150) ~[spring-data-jdbc-2.4.2.jar:2.4.2]
	at org.springframework.data.jdbc.repository.query.PartTreeJdbcQuery.execute(PartTreeJdbcQuery.java:131) ~[spring-data-jdbc-2.4.2.jar:2.4.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:137) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:121) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:160) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:139) ~[spring-data-commons-2.7.2.jar:2.7.2]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:123) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:388) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:137) ~[spring-tx-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186) ~[spring-aop-5.3.22.jar:5.3.22]
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:215) ~[spring-aop-5.3.22.jar:5.3.22]
	at jdk.proxy2/jdk.proxy2.$Proxy65.findAllByGenre(Unknown Source) ~[na:na]
	at dev.mflash.guides.spring.hikari.leakdetection.BookController.getAllBooksByGenre(BookController.java:23) ~[classes/:na]
	...
```

The exception indicates that there's a potential connection when `BookRepository.findAllByGenre` method is called.

## Fixing the connection leak

Looking at the logs related to the connection leak, we find that the issue originates from `JdbcTemplate.queryForStream` method. The [docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html#queryForStream-org.springframework.jdbc.core.PreparedStatementCreator-org.springframework.jdbc.core.PreparedStatementSetter-org.springframework.jdbc.core.RowMapper-) for this method state that:

> [The `queryForStream` method returns] the result Stream, containing mapped objects, needing to be closed once fully processed (e.g. through a try-with-resources clause).

So, closing the `Stream` should return the connection to the pool. This can be done by wrapping the `findAllByGenre` call in a try-with-resources which takes care of closing the `Stream` after usage.

```java {10,24-30}
package dev.mflash.guides.spring.hikari.leakdetection;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
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
			books = booksByGenre.collect(Collectors.toList());
		}

		return books;
	}
}
```

Alternatively, we can return a `Collection` instead of a `Stream` from the repository.

```java {5,9}
package dev.mflash.guides.spring.hikari.leakdetection;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface BookRepository extends CrudRepository<Book, Long> {

	List<Book> findAllByGenre(Genre genre);
}
```

After any of the preceding changes, the `curl` requests work without any problem.

```sh prompt{1}
for x in 1..12 { curl http://localhost:8080/book/THRILLER }
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
[{"id":"aba72d83-df7f-4c4b-9578-67906eca1e8b","title":"No Plan B","genre":"THRILLER","author":"Lee Child"}]
```

After serving the preceding requests, the logs below show that the connections are no longer active indicating that the active connections are being returned to the pool.

```log {1}
2022-09-18 15:18:08.055 DEBUG 7104 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Pool stats (total=10, active=0, idle=10, waiting=0)
2022-09-18 15:18:08.055 DEBUG 7104 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool is at sufficient level.
```

---

**Source code**

- [spring-data-jdbc-hikari-leak-detection](https://github.com/Microflash/guides/tree/main/spring/spring-data-jdbc-hikari-leak-detection)

**Related**

- [Randomly HikariPool pool becomes zero and HikariCP is not renewing/creating new connections](https://github.com/brettwooldridge/HikariCP/issues/1256)
- [Streaming Query Results](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-streaming)

