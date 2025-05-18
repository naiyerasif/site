---
slug: "2022/09/18/detecting-a-connection-leak-with-hikari"
title: "Detecting a connection leak with Hikari"
description: "Database connections are expensive. Unclosed database connections can leak and throttle an application. This post shows how to detect a connection leak using Hikari and fix it."
date: 2022-09-18 17:05:15
update: 2025-05-19 00:52:07
type: "guide"
---

Database connections are expensive application resources. That is why we use a connection pool (such as [Hikari](https://github.com/brettwooldridge/HikariCP)) to manage them. However, if a developer fails to close a connection, it can stay open and may never return to the connection pool, causing a _connection leak_. This can severely degrade the performance of your application.

In this post, we will create a connection leak, and use Hikari to detect it.

:::note{.setup}
The examples in this post use

- Spring Boot 3.4.5
- Java 21
:::

## Putting together a connection leak

Generate a Spring Boot application with Maven using the following `pom.xml`. It uses the H2 in-memory database and Hikari connection pool.


```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.4.5</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>hikari-leak-detection</artifactId>
	<version>3.0.0</version>

	<properties>
		<java.version>21</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
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

We'll use the following table and sample data in our example.

```sql title="data.sql"
create table book (
	id     uuid default random_uuid() primary key,
	title  varchar(255) not null,
	author varchar(255) not null,
	genre  varchar(255) array not null
);

insert into book (title, author, genre)
values ('Royal Gambit', 'Daniel O''Malley', array['Fantasy', 'Science Fiction']),
			 ('Nemesis', 'Gregg Hurwitz', array['Action', 'Thriller']),
			 ('Shroud', 'Adrian Tchaikovsky', array['Science Fiction', 'Horror']),
			 ('Careless People', 'Sarah Wynn-Williams', array['Memoir']),
			 ('Raising Hare', 'Chloe Dalton', array['Memoir']),
			 ('System Collapse', 'Martha Wells', array['Science Fiction', 'Space Opera']);
```

:::commend{title="Tip"}
Put these SQL statements in `src/main/resources/data.sql` file and Spring Boot will automatically run them as a part of [initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-basic-sql-scripts).
:::

Let's model the `book` table using a record.

```java title="Book.java"
package com.example;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(value = { "id" })
public record Book(@Id UUID id, String title, String author, List<String> genre) {}
```

Expose an endpoint to list all books by a specific genre, passed as a query parameter.

```java title="BookController.java"
package com.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/book")
public record BookController(BookRepository repository) {

	@GetMapping
	public List<Book> booksByGenre(@RequestParam String genre) {
		return repository.findAllByGenre(genre).toList();
	}
}
```

The `BookRepository` is a `CrudRepository` where the `findAllByGenre` method returns a `Stream<Book>`.

```java title="BookRepository.java"
package com.example;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;
import java.util.stream.Stream;

public interface BookRepository extends CrudRepository<Book, UUID> {

	@Query("select * from book where array_contains(genre, :genre)")
	Stream<Book> findAllByGenre(String genre);
}
```

In the `application.yml`, configure Hikari to have a maximum of 5 database connections in the pool and a minimum of 2 database connections while idling.

```yml title="application.yml" {3..6}
spring.datasource:
  url: jdbc:h2:mem:sa
  hikari:
    pool-name: H2HikariPool
    maximum-pool-size: 5
    minimum-idle: 2
```

Start the application using this launcher.

```java title="Launcher.java"
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Launcher {

	public static void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}
}
```

Open a terminal and hit the `/book` endpoint in a loop.

```nu prompt{1} output{2..8} {7..8}
for i in 1..7 { curl -s localhost:8080/book?genre=Space%20Opera }
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
{"timestamp":"2025-05-18T22:10:21.605","status":500,"error":"Internal Server Error","path":"/book"}
{"timestamp":"2025-05-18T22:10:51.635","status":500,"error":"Internal Server Error","path":"/book"}
```

:::note
I'm using [Nushell](https://www.nushell.sh)'s [`for`](https://www.nushell.sh/commands/docs/for.html) command to call [`curl`](https://curl.se/docs/manpage.html) in a loop. Depending on your shell, you may have to use a different syntax, for example, for bash and zsh, you can use

```sh
for i in {1..7}; do curl -s 'localhost:8080/book?genre=Space%20Opera'; done
```
:::

Note that after 5 requests, the server started returning a `500 Internal Server Error`. Checking the logs, we find the following exception.

```log {1,3}
2025-05-18T22:50:16.636 ERROR 10392 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection] with root cause

java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30005ms (total=5, active=5, idle=0, waiting=0)
  at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:686) ~[HikariCP-5.1.0.jar:na]
  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:179) ~[HikariCP-5.1.0.jar:na]
  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:144) ~[HikariCP-5.1.0.jar:na]
  at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:127) ~[HikariCP-5.1.0.jar:na]
  at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:160) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:118) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:81) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:653) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:844) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:863) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:237) ~[spring-jdbc-6.2.6.jar:6.2.6]
> <14 folded frames>
  at com.example.BookController.booksByGenre(BookController.java:16) ~[classes/:na]
> <48 folded frames>
```

Hikari complains about the unavailability of connection when the controller calls the `BookRepository.findAllByGenre` method.

We can get more information about the exception by switching on the `TRACE` logs for Hikari as follows.

```yml title="application.yml" ins{8..10}
spring.datasource:
  url: jdbc:h2:mem:sa
  hikari:
    pool-name: H2HikariPool
    maximum-pool-size: 5
    minimum-idle: 2

logging:
  level:
    com.zaxxer.hikari: TRACE
```

Restart the application and call `curl` in a loop with the same request as earlier. We get the following logs this time.

```log {10,12,14,15}
2025-05-18T23:08:48.269  INFO 10683 --- [           main] com.zaxxer.hikari.HikariDataSource       : H2HikariPool - Starting...
2025-05-18T23:08:48.338  INFO 10683 --- [           main] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Added connection conn0: url=jdbc:h2:mem:sa user=SA
2025-05-18T23:08:48.338  INFO 10683 --- [           main] com.zaxxer.hikari.HikariDataSource       : H2HikariPool - Start completed.
2025-05-18T23:08:48.443 DEBUG 10683 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Before cleanup stats (total=1, active=0, idle=1, waiting=0)
2025-05-18T23:08:48.444 DEBUG 10683 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After cleanup  stats (total=1, active=0, idle=1, waiting=0)
2025-05-18T23:08:48.444 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Added connection conn1: url=jdbc:h2:mem:sa user=SA
2025-05-18T23:08:48.478 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After adding stats (total=2, active=0, idle=2, waiting=0)
...
2025-05-18T23:08:52.048 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Added connection conn2: url=jdbc:h2:mem:sa user=SA
2025-05-18T23:08:52.083 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Connection not added, stats (total=3, active=3, idle=0, waiting=1)
2025-05-18T23:08:52.083 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Added connection conn3: url=jdbc:h2:mem:sa user=SA
2025-05-18T23:08:52.117 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Connection not added, stats (total=4, active=4, idle=0, waiting=1)
2025-05-18T23:08:52.118 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Added connection conn4: url=jdbc:h2:mem:sa user=SA
2025-05-18T23:08:52.150 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Connection not added, stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:08:52.150 DEBUG 10683 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Connection not added, stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:09:18.444 DEBUG 10683 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Before cleanup stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:09:18.445 DEBUG 10683 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After cleanup  stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:09:18.445 DEBUG 10683 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool has sufficient level or currently being filled.
2025-05-18T23:09:22.131 DEBUG 10683 --- [nio-8080-exec-1] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Timeout failure stats (total=5, active=5, idle=0, waiting=0)
```

In these logs, note that the connections are not returning back to the pool. For new requests, Hikari keeps generating new connections until it hits the maximum pool size limit (set to 5 in the `application.yml`). At this point, we start seeing `CannotGetJdbcConnectionException` complaining about connection not being available in the pool for further requests. We've successfully created a connection leak!

## Investigating the connection leak

To investigate connection leaks, Hikari offers a `leakDetectionThreshold` property which sets the duration a connection can stay out of the pool. Once this threshold duration crosses, Hikari throws an exception alerting about a potential connection leak. In this particular case, we can set it to 30 seconds.

```yml title="application.yml" ins{7}
spring.datasource:
  url: jdbc:h2:mem:sa
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

```log {5..7,28}
2025-05-18T23:24:54.189 DEBUG 10931 --- [onnection adder] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Connection not added, stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:25:20.978 DEBUG 10931 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Before cleanup stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:25:20.979 DEBUG 10931 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After cleanup  stats (total=5, active=5, idle=0, waiting=1)
2025-05-18T23:25:20.979 DEBUG 10931 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool has sufficient level or currently being filled.
2025-05-18T23:25:24.009  WARN 10931 --- [ool housekeeper] com.zaxxer.hikari.pool.ProxyLeakTask     : Connection leak detection triggered for conn0: url=jdbc:h2:mem:sa user=SA on thread http-nio-8080-exec-1, stack trace follows

java.lang.Exception: Apparent connection leak detected
  at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:127) ~[HikariCP-5.1.0.jar:na]
  at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:160) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:118) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:81) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:653) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:844) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:863) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:237) ~[spring-jdbc-6.2.6.jar:6.2.6]
> <63 folded frames>

2025-05-18T23:25:54.233 ERROR 10931 --- [nio-8080-exec-2] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection] with root cause

java.sql.SQLTransientConnectionException: H2HikariPool - Connection is not available, request timed out after 30005ms (total=5, active=5, idle=0, waiting=0)
...
  at org.springframework.jdbc.core.JdbcTemplate.execute(JdbcTemplate.java:653) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:844) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.JdbcTemplate.queryForStream(JdbcTemplate.java:863) ~[spring-jdbc-6.2.6.jar:6.2.6]
  at org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate.queryForStream(NamedParameterJdbcTemplate.java:237) ~[spring-jdbc-6.2.6.jar:6.2.6]
...
  at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:223) ~[spring-aop-6.2.6.jar:6.2.6]
  at jdk.proxy2/jdk.proxy2.$Proxy75.findAllByGenre(Unknown Source) ~[na:na]
> at com.example.BookController.booksByGenre(BookController.java:16) ~[classes/:na]
> at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.40.jar:6.0]
> at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.40.jar:6.0]
```

Hikari now warns that there may be a potential connection leak in the application. By looking at the stack trace, you'll notice the exception to be originating from `jdk.proxy2.$Proxy75.findAllByGenre` method. Spring [implements](https://docs.spring.io/spring-data/relational/reference/repositories/create-instances.html) a `CrudRepository` interface using a proxy, which means the issue could be in the implementation of the `BookRepository.findAllByGenre` method.

## Fixing the connection leak

Under the hood, Spring Data JDBC uses `JdbcTemplate` to perform the database operations declared in a `Repository` interface. Looking at the logs related to the connection leak, we find that Spring uses `JdbcTemplate.queryForStream` method to implement the `BookRepository.findAllByGenre` method. The [docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html#queryForStream(java.lang.String,org.springframework.jdbc.core.RowMapper)) for this method state that:

> [The `queryForStream` method returns] the result Stream, containing mapped objects, needing to be closed once fully processed (for example, through a try-with-resources clause)

So, closing the `Stream` should return the connection to the pool. We can do this by wrapping the `findAllByGenre` call in a try-with-resources.

```java title="BookController.java" ins{9,17,19..21,24} del{23}
package com.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/book")
public record BookController(BookRepository repository) {

	@GetMapping
	public List<Book> booksByGenre(@RequestParam String genre) {
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

```java title="BookRepository.java" ins{6,14} del{8,13}
package com.example;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Stream;

public interface BookRepository extends CrudRepository<Book, UUID> {

	@Query("select * from book where array_contains(genre, :genre)")
	Stream<Book> findAllByGenre(String genre);
	Collection<Book> findAllByGenre(String genre);
}
```

After either of these changes, the application works as expected.

```nu prompt{1} output{2..8}
for i in 1..7 { curl -s localhost:8080/book?genre=Space%20Opera }
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
[{"title":"System Collapse","author":"Martha Wells","genre":["Science Fiction","Space Opera"]}]
```

The following logs show that the connections are no longer active indicating that they finally return to the pool.

```log
...
2025-05-19T00:25:30.426 DEBUG 11711 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Before cleanup stats (total=2, active=0, idle=2, waiting=0)
2025-05-19T00:25:30.426 DEBUG 11711 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - After cleanup  stats (total=2, active=0, idle=2, waiting=0)
2025-05-19T00:25:30.427 DEBUG 11711 --- [ool housekeeper] com.zaxxer.hikari.pool.HikariPool        : H2HikariPool - Fill pool skipped, pool has sufficient level or currently being filled.
```

---

**Source code**

- [spring-data-jdbc-hikari-leak-detection](https://github.com/Microflash/guides/tree/main/spring/spring-data-jdbc-hikari-leak-detection)

**Related**

- [Randomly HikariPool pool becomes zero and HikariCP is not renewing/creating new connections](https://github.com/brettwooldridge/HikariCP/issues/1256)
- [Streaming Query Results](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-streaming)
