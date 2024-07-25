---
slug: "2023/09/08/improved-local-development-using-containers-in-spring-boot-3-1"
title: "Improved local development using containers in Spring Boot 3.1"
description: "Spring Boot 3.1 introduces new Docker Compose and Testcontainers integrations, simplifying local development by automating container management."
date: 2023-09-08 00:13:21
update: 2023-09-08 00:13:21
type: "post"
category: "guide"
---

Spring Boot 3.1 added important integrations with [Docker Compose](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.docker-compose) and [Testcontainers](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.testing.testcontainers). With these integrations, you won't have to manage your containers manually while bringing up the local development environment on your machine. Spring Boot will automatically manage this for you.

Let's take a look at these features with an example project.

:::note{.sm}
The examples in this post use

- Spring Boot 3.1.3
- Java 17
- Postgres 15
- Docker 24.0.5
- Maven 3.9.4
:::

## Local development before Spring Boot 3.1

Let's create a Spring Boot app that exposes some endpoints with Spring Data REST. We'll use Postgres as the database for this example. Create a Maven project with the following `pom.xml`.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.1.3</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot3-local-dev</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>17</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-rest</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Let's represent a note with a `Note` record. We'll create a table called `notes` to store the data in database.

```java
package com.example.localdev;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("notes")
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record Note(
		@Id
		UUID id,
		String title,
		String body,
		boolean readOnly) {
}
```

To perform database operations, let's create a `CrudRepository` for the `Notes` record.

```java
package com.example.localdev;

import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface NotesRepository extends CrudRepository<Note, UUID> {
}
```

Spring Boot automatically enables Spring Data REST when it finds a configuration annotated with `@SpringBootApplication` or `@EnableAutoConfiguration.`. In our case, we will create a launcher annotated with `@SpringBootApplication` as follows.

```java
package com.example.localdev;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Launcher {

	public static void main(String... args) {
		SpringApplication.run(Launcher.class, args);
	}
}
```

You'd need a Postgres database running on local for this app. Let's create a Compose file, `compose.yml`, to describe the database image and set the credentials and database name.

```yml title="compose.yml"
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: gwen
      POSTGRES_PASSWORD: stacy
      POSTGRES_DB: brooklyn
```

### Automatic database initialization

For local development, you might need to run some initialization script to create a table and dump some sample data. Fortunately, Spring Boot offers automatic database initialization using SQL scripts.

Create a file `src/main/resources/schema.sql` and dump the following `create` statements in it.

```sql title="src/main/resources/schema.sql"
create extension if not exists "uuid-ossp";

create table notes (
	id         uuid primary key      default uuid_generate_v1(),
	title      varchar(255) not null,
	body       text,
	read_only  boolean      not null default false
);
```

> You need to run `create extension if not exists "uuid-ossp"` to automatically generate UUID with the `uuid_generate_v1()` function; this function isn't available by default.

To add some sample data, create a file `src/main/resources/data.sql` and add the following statement.

```sql title="src/main/resources/data.sql"
insert into notes (title, body, read_only)
values ('Blocking OpenAI web crawler', 'Disallow routes for GPTBot in robots.txt', false),
       ('Goodhart`s Law', 'When a measure becomes a target, it ceases to be a good measure.', false),
       ('Prune homebrew dependencies', 'Run `brew autoremove` to prune unused dependencies', true);
```

Spring Boot automatically executes the scripts `schema.sql` and `data.sql` on the classpath for the _embedded_ databases. Since Postgres isn't an embedded database, we need to explicitly enable this behavior with the following configuration in the `src/main/resources/application.yml` file.

```yml title="src/main/resources/application.yml"
spring.sql.init.mode: always
```

You'd also need to configure the datasource to connect to the database.

```yml title="src/main/resources/application.yml" {2..5}
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/brooklyn
    username: gwen
    password: stacy

  sql.init.mode: always
```

### Starting the local environment with Docker CLI

Let's bring up Postgres by launching the container with Docker CLI.

```sh prompt{1}
docker compose up -d
```

Once the container is healthy, you can launch the app with `Launcher`. You can then try the following requests to verify that things are working.

```sh prompt{2,5,8,11}
# list all notes
curl -s http://localhost:8080/notes

# fetch a note by id, substitue <id> with a real id
curl -s http://localhost:8080/notes/<id>

# create new note
curl -s -X POST http://localhost:8080/notes --json '{"title": "curl`s --json flag","body": "Use `--json` flag to avoid setting content-type and accept headers","readOnly": false}'

# delete a note, substitute <id> with a real id
curl -s -X DELETE http://localhost:8080/notes/<id>
```

There are some genuine inconveniences with this approach.

- Managing the containers with Docker CLI is a manual process. This can quickly become a hassle when you need to run multiple applications.
- For multiple applications using Postgres running simultaneously, you need to change the port mapping in the Compose file for each of them since the `5432` port on host can be in use by only one container. You'll have to update the `application.yml` whenever you change the port mapping.
- You have to maintain the database configuration in the Compose file and `application.yml`. If these configurations are not in sync, your local development environment will break.

## Local development with Docker Compose support in Spring Boot 3.1

With Docker Compose support in Spring Boot 3.1, Spring Boot can automatically start the containers when our app launches and stop them when it shuts down. Even better, Spring Boot can automatically inject the configurations specified in the Compose file in the app using [Service Connections](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.1-Release-Notes#service-connections) defined by `ConnectionDetails` beans. Let's try this integration to see how it helps the local development workflow.

Add the `spring-boot-docker-compose` dependency in the `pom.xml`.

```xml title="pom.xml" {43..48}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.1.3</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot3-local-dev-docker-compose</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>17</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-rest</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-docker-compose</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Since Docker Support module will automatically inject the database configuration from Compose file, let's remove the datasource properties from `application.yml`.

```yml title="src/main/resources/application.yml"
spring.sql.init.mode: always
```

We can also get rid of port mapping `5432:5432` in the `Compose` file.

```yml title="compose.yml" {5}
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - 5432
    environment:
      POSTGRES_USER: gwen
      POSTGRES_PASSWORD: stacy
      POSTGRES_DB: brooklyn
```

In this case, Docker will dynamically assign a host port available to it and Spring Boot will automatically detect and connect with the correct port.

### Docker Compose integration in action

Start the app by running the `Launcher`. As the app comes up, Spring Boot searches for the Compose file, calls `docker compose up` and waits till the container becomes healthy.

```log {3..12}
2023-09-08T00:40:39.376+05:30  INFO 16119 --- [           main] com.example.localdev.Launcher            : Starting Launcher using Java 17.0.6 with PID 16119 (/Users/demo/guides/spring/springboot3-local-dev-docker-compose/target/classes started by demo in /Users/demo/guides/spring/springboot3-local-dev-docker-compose)
2023-09-08T00:40:39.377+05:30  INFO 16119 --- [           main] com.example.localdev.Launcher            : No active profile set, falling back to 1 default profile: "default"
2023-09-08T00:40:39.398+05:30  INFO 16119 --- [           main] .s.b.d.c.l.DockerComposeLifecycleManager : Using Docker Compose file '/Users/demo/guides/spring/springboot3-local-dev-docker-compose/compose.yml'
2023-09-08T00:40:39.922+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Network springboot3-local-dev-docker-compose_default  Creating
2023-09-08T00:40:39.947+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Network springboot3-local-dev-docker-compose_default  Created
2023-09-08T00:40:39.947+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Creating
2023-09-08T00:40:39.966+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Created
2023-09-08T00:40:39.967+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Starting
2023-09-08T00:40:40.118+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Started
2023-09-08T00:40:40.118+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Waiting
2023-09-08T00:40:40.621+05:30  INFO 16119 --- [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container springboot3-local-dev-docker-compose-postgres-1  Healthy
...
```

Once the app is up, you can try the [sample requests](#using-docker-command-line-for-local-development) to test the endpoints.

### Supported Docker images

Docker Compose support automatically infers configurations from Compose file. This works for [many Docker images](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.docker-compose.service-connections), such as `redis`, `postgres` (used in our example), `rabbitmq`, etc.

### Support for custom Docker images

You can use custom images as long as they behave the same way as the standard images. This means you can use that handcrafted Postgres Docker image that your company maintains in its private artifactory.

If the custom image has a different name, for example `mycompany/postgres` instead of `postgres`, you'll have to specify a label to help Spring Boot map an image configuration to a correct service connection.

```yml title="compose.yml" {10,11}
services:
  postgres:
    image: mycompany/postgres:15-alpine
    ports:
      - 5432
    environment:
      POSTGRES_USER: gwen
      POSTGRES_PASSWORD: stacy
      POSTGRES_DB: brooklyn
    labels:
      org.springframework.boot.service-connection: postgres
```

### Skipping specific containers from Docker Support

Sometimes, you may want to turn off Docker Support for some containers. You can exclude them by adding a label `org.springframework.boot.ignore: true`.

```yml title="compose.yml" {6,7}
services:
  redis:
    image: redis:6-alpine
    ports:
      - 6379
    labels:
      org.springframework.boot.ignore: true

  postgres:
    image: postgres:15-alpine
    ports:
      - 5432
```

In this case, Spring Boot won't manage the `redis` container automatically.

## Local development with Testcontainers in Spring Boot 3.1

While Docker Compose support is convenient, it is limited to a small set of images. Furthermore, it is as flexible as the corresponding `ConnectionDetails` implementation allow it to be. If you need to use a container not supported by Docker Compose module or you need more flexibility in configuring such containers, the [Testcontainers](https://testcontainers.com/) local development mode is a convenient alternative.

To use the Testcontainers local development mode, remove the `spring-boot-docker-compose` dependency from the `pom.xml`, and add the Testcontainers dependencies.

```xml title="pom.xml" {48..62}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.1.3</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.example</groupId>
	<artifactId>springboot3-local-dev-testcontainers</artifactId>
	<version>1.0.0</version>

	<properties>
		<java.version>17</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-rest</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-testcontainers</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>junit-jupiter</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>postgresql</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Note that these are `test` dependencies. That's why we need to create a `LocalLauncher` in the `src/test/java` package.

```java {8,9}
import com.example.localdev.Launcher;
import org.springframework.boot.SpringApplication;

public class LocalLauncher {

	public static void main(String... args) {
		SpringApplication
				.from(Launcher::main)
				.with(LocalContainerConfiguration.class)
				.run(args);
	}
}
```

Note that the `LocalLauncher` delegates the app launch to the original `Launcher` class, with an additional `LocalContainerConfiguration` which has the following implementation.

```java {9..13}
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class LocalContainerConfiguration {

	@Bean
	@ServiceConnection
	public PostgreSQLContainer<?> postgreSQLContainer() {
		return new PostgreSQLContainer<>("postgres:15-alpine");
	}
}
```

The `@ServiceConnection` annotation on a `@Bean` creates a `ConnectionDetails` bean with which Spring Boot automatically starts and stops the `postgres` container. Since container is now managed through this `@TestConfiguration`, we no longer need the Compose file.

### Testcontainers local development mode in action

To start the app, we'll run `LocalLauncher`. Spring Boot detects the image specified by the `ConnectionDetails` bean and launches it along with `testcontainers/ryuk` container. Ryuk monitors the Testcontainers containers and helps terminate them cleanly when you stop the app.

```log {10..28}
2023-09-08T01:32:58.160+05:30  INFO 19673 --- [           main] com.example.localdev.Launcher            : Starting Launcher using Java 17.0.6 with PID 19673 (/Users/demo/guides/spring/springboot3-local-dev-testcontainers/target/classes started by demo in /Users/demo/guides/spring/springboot3-local-dev-testcontainers)
2023-09-08T01:32:58.162+05:30  INFO 19673 --- [           main] com.example.localdev.Launcher            : No active profile set, falling back to 1 default profile: "default"
2023-09-08T01:32:58.424+05:30  INFO 19673 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JDBC repositories in DEFAULT mode.
2023-09-08T01:32:58.439+05:30  INFO 19673 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 13 ms. Found 1 JDBC repository interfaces.
2023-09-08T01:32:58.666+05:30  INFO 19673 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2023-09-08T01:32:58.670+05:30  INFO 19673 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2023-09-08T01:32:58.670+05:30  INFO 19673 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.12]
2023-09-08T01:32:58.708+05:30  INFO 19673 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2023-09-08T01:32:58.708+05:30  INFO 19673 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 523 ms
2023-09-08T01:32:58.741+05:30  INFO 19673 --- [           main] o.t.utility.ImageNameSubstitutor         : Image name substitution will be performed by: DefaultImageNameSubstitutor (composite of 'ConfigurationFileImageNameSubstitutor' and 'PrefixingImageNameSubstitutor')
2023-09-08T01:32:58.826+05:30  INFO 19673 --- [           main] o.t.d.DockerClientProviderStrategy       : Loaded org.testcontainers.dockerclient.UnixSocketClientProviderStrategy from ~/.testcontainers.properties, will try it first
2023-09-08T01:32:58.942+05:30  INFO 19673 --- [           main] o.t.d.DockerClientProviderStrategy       : Found Docker environment with local Unix socket (unix:///var/run/docker.sock)
2023-09-08T01:32:58.943+05:30  INFO 19673 --- [           main] org.testcontainers.DockerClientFactory   : Docker host IP address is localhost
2023-09-08T01:32:58.959+05:30  INFO 19673 --- [           main] org.testcontainers.DockerClientFactory   : Connected to docker: 
  Server Version: 24.0.5
  API Version: 1.43
  Operating System: Docker Desktop
  Total Memory: 984 MB
2023-09-08T01:32:58.971+05:30  INFO 19673 --- [           main] tc.testcontainers/ryuk:0.5.1             : Creating container for image: testcontainers/ryuk:0.5.1
2023-09-08T01:32:59.189+05:30  INFO 19673 --- [           main] tc.testcontainers/ryuk:0.5.1             : Container testcontainers/ryuk:0.5.1 is starting: 030e120068f9670d4098531a047bb2a7f58fcb4cdde67e3e220eae5c278d768b
2023-09-08T01:32:59.373+05:30  INFO 19673 --- [           main] tc.testcontainers/ryuk:0.5.1             : Container testcontainers/ryuk:0.5.1 started in PT0.410003S
2023-09-08T01:32:59.377+05:30  INFO 19673 --- [           main] o.t.utility.RyukResourceReaper           : Ryuk started - will monitor and terminate Testcontainers containers on JVM exit
2023-09-08T01:32:59.377+05:30  INFO 19673 --- [           main] org.testcontainers.DockerClientFactory   : Checking the system...
2023-09-08T01:32:59.377+05:30  INFO 19673 --- [           main] org.testcontainers.DockerClientFactory   : ✔︎ Docker server version should be at least 1.6.0
2023-09-08T01:32:59.377+05:30  INFO 19673 --- [           main] tc.postgres:15-alpine                    : Creating container for image: postgres:15-alpine
2023-09-08T01:32:59.397+05:30  INFO 19673 --- [           main] tc.postgres:15-alpine                    : Container postgres:15-alpine is starting: da87938034f692a7a591ba8baa5eabb5c674ab9c83ec72f4944975b9397eeb50
2023-09-08T01:33:00.369+05:30  INFO 19673 --- [           main] tc.postgres:15-alpine                    : Container postgres:15-alpine started in PT0.991467S
2023-09-08T01:33:00.370+05:30  INFO 19673 --- [           main] tc.postgres:15-alpine                    : Container is started (JDBC URL: jdbc:postgresql://localhost:51453/test?loggerLevel=OFF)
...
```

Once the app is up, you can use the [sample requests](#using-docker-command-line-for-local-development) to test the endpoints.

### Dynamic properties at runtime

One benefit of using Testcontainers is that you can inject custom configurations from the container to the Spring Boot app using the `DynamicPropertyRegistry`. Here's an example of registering Postgres connection details using the `DynamicPropertyRegistry`.

```java {10..16}
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.testcontainers.containers.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class LocalContainerConfiguration {

	@Bean
	public PostgreSQLContainer<?> postgreSQLContainer(DynamicPropertyRegistry props) {
		var container = new PostgreSQLContainer<>("postgres:15-alpine");
		props.add("spring.datasource.url", container::getJdbcUrl);
		props.add("spring.datasource.username", container::getUsername);
		props.add("spring.datasource.password", container::getPassword);
		return container;
	}
}
```

Using the `@ServiceConnection` is generally recommended. However, dynamic properties can be useful when there's no `@ServiceConnection` support.

---

**Source code**

- [springboot3-local-dev-docker-compose](https://github.com/Microflash/guides/tree/main/spring/springboot3-local-dev-docker-compose)
- [springboot3-local-dev-testcontainers](https://github.com/Microflash/guides/tree/main/spring/springboot3-local-dev-testcontainers)

**Related**

- [Docker Compose Support](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.docker-compose)
- [Using Testcontainers at Development Time](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.testing.testcontainers.at-development-time)
- [Spring Data REST Reference Guide](https://docs.spring.io/spring-data/rest/docs/current/reference/html/)
- [Database Initialization](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization)
