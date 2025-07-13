---
slug: "2025/07/13/how-to-implement-an-aws-lambda-function-using-micronaut"
title: "How to implement an AWS Lambda function using Micronaut"
description: "Trying out AWS Lambda with Java? In this post, we look at how to get started with Micronaut and use its dependency injection to simplify the development experience."
date: 2025-07-13 16:36:59
update: 2025-07-13 16:36:59
type: "guide"
---

Micronaut is an open source Java framework designed to build microservices and serverless applications. Unlike other frameworks that use reflection-based dependency injection, Micronaut performs most of this work at compile time, improving performance and efficiency. This makes it handy for writing cloud-native applications, such as an AWS Lambda function. In this post, we'll do exactly this.

:::note{.setup}
The examples in this post use

- Micronaut 4.9.1
- Java 21
- Maven 3.9.10
- AWS CLI 2.27.49
- Docker 28.2.2
:::

## Implementing the function

Create a Maven project using the following `pom.xml` file.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>io.micronaut.platform</groupId>
		<artifactId>micronaut-parent</artifactId>
		<version>4.9.1</version>
	</parent>

	<groupId>com.example</groupId>
	<artifactId>mn4-aws-lambda-with-eventbridge</artifactId>
	<version>1.0.0</version>
	<packaging>jar</packaging>

	<properties>
		<jdk.version>21</jdk.version>
		<release.version>21</release.version>
		<micronaut.version>4.9.1</micronaut.version>
		<micronaut.runtime>lambda</micronaut.runtime>
	</properties>

	<dependencies>
		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-lambda-java-events</artifactId>
			<scope>compile</scope>
		</dependency>
		<dependency>
			<groupId>io.micronaut.aws</groupId>
			<artifactId>micronaut-function-aws</artifactId>
			<scope>compile</scope>
		</dependency>
		<dependency>
			<groupId>io.micronaut.aws</groupId>
			<artifactId>micronaut-aws-lambda-events-serde</artifactId>
			<scope>compile</scope>
		</dependency>
		<dependency>
			<groupId>io.micronaut.serde</groupId>
			<artifactId>micronaut-serde-jackson</artifactId>
			<scope>compile</scope>
		</dependency>
		<dependency>
			<groupId>com.fasterxml.jackson.core</groupId>
			<artifactId>jackson-databind</artifactId>
			<scope>compile</scope>
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
	</dependencies>
	<build>
		<plugins>
			<plugin>
				<groupId>io.micronaut.maven</groupId>
				<artifactId>micronaut-maven-plugin</artifactId>
				<configuration>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-enforcer-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<annotationProcessorPaths combine.self="override">
						<path>
							<groupId>io.micronaut</groupId>
							<artifactId>micronaut-inject-java</artifactId>
							<version>${micronaut.core.version}</version>
						</path>
						<path>
							<groupId>io.micronaut.serde</groupId>
							<artifactId>micronaut-serde-processor</artifactId>
							<version>${micronaut.serialization.version}</version>
							<exclusions>
								<exclusion>
									<groupId>io.micronaut</groupId>
									<artifactId>micronaut-inject</artifactId>
								</exclusion>
							</exclusions>
						</path>
					</annotationProcessorPaths>
					<compilerArgs>
						<arg>-Amicronaut.processing.group=com.example</arg>
						<arg>-Amicronaut.processing.module=mn4-aws-lambda-with-eventbridge</arg>
					</compilerArgs>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

Let's create a `RequestHandler`, which will serve as the entrypoint of the function.

```java
package com.example;

import io.micronaut.function.aws.MicronautRequestHandler;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import jakarta.inject.Inject;

public class FunctionRequestHandler extends MicronautRequestHandler<ScheduledEvent, Void> {

	private @Inject ScheduledEventService eventService;

	@Override
	public Void execute(ScheduledEvent event) {
		this.eventService.process(event);
		return null;
	}
}
```

- `FunctionRequestHandler` extends `MicronautRequestHandler`, which internally implements the `handleRequest` method, the entrypoint of the function. Within this method, Micronaut initializes the `ApplicationContext`, the dependency injection container that resolves all beans. This enables us to use dependency injection with the `@Inject` annotation, as we've done here with `ScheduledEventService`.
- To implement custom logic, we override the `execute` method of `MicronautRequestHandler`; the `handleRequest` method internally calls it during execution.

Here's the implementation of `ScheduledEventService`.

```java
package com.example;

import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Singleton;

@Singleton
public class ScheduledEventService {

	private final ObjectMapper mapper = new ObjectMapper();

	record EventDetails(String message) {}

	public void process(ScheduledEvent event) {
		var eventDetails = mapper.convertValue(event.getDetail(), EventDetails.class);
		System.out.println(eventDetails.message());
	}
}
```

We're not doing anything fancy here &mdash; just printing the message received in the details of a Cloudwatch event (referred to by AWS as a `ScheduledEvent`).

## Testing the function

First, build the application using `mvn clean package`. To test the function locally, Use the following Compose file to launch a LocalStack container with `docker compose up -d`.

```yml
services:
  localstack:
    container_name: mn4-aws-lambda-with-eventbridge
    image: localstack/localstack:4.4.0
    ports:
      - "4566:4566"
    environment:
      - DEBUG=${DEBUG:-0}
      # improve working completely offline
      # see: https://github.com/localstack/localstack/issues/4840
      - SKIP_SSL_CERT_DOWNLOAD=1
      - DISABLE_EVENTS=1
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
```

Deploy the function JAR file with the following command.

```nu prompt{1} output{2..38}
aws --profile localstack lambda create-function --function-name mn4-aws-lambda-with-eventbridge --runtime java21 --role arn:aws:iam::000000000000:role/example-lambda-noop-role --handler com.example.FunctionRequestHandler --zip-file $"fileb://(pwd)/target/(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar" --timeout 120
{
	"FunctionName": "mn4-aws-lambda-with-eventbridge",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:mn4-aws-lambda-with-eventbridge",
	"Runtime": "java21",
	"Role": "arn:aws:iam::000000000000:role/example-lambda-noop-role",
	"Handler": "com.example.FunctionRequestHandler",
	"CodeSize": 13174368,
	"Description": "",
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2025-07-13T09:46:36.879872+0000",
	"CodeSha256": "VZBQQUuKtHweIXI6yWrvlQ4XU+C9oRPgLhKOZQQ99/Y=",
	"Version": "$LATEST",
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "4261ae5d-f677-4d85-8204-29d55dde0e3e",
	"State": "Pending",
	"StateReason": "The function is being created.",
	"StateReasonCode": "Creating",
	"PackageType": "Zip",
	"Architectures": ["x86_64"],
	"EphemeralStorage": {
		"Size": 512
	},
	"SnapStart": {
		"ApplyOn": "None",
		"OptimizationStatus": "Off"
	},
	"RuntimeVersionConfig": {
		"RuntimeVersionArn": "arn:aws:lambda:us-east-1::runtime:8eeff65f6809a3ce81507fe733fe09b835899b99481ba22fd75b5a7338290ec1"
	},
	"LoggingConfig": {
		"LogFormat": "Text",
		"LogGroup": "/aws/lambda/mn4-aws-lambda-with-eventbridge"
	}
}
```

The command `mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout` prints the project's artifactId, while `mvn help:evaluate -Dexpression=project.version -q -DforceStdout` outputs the version defined in the `pom.xml`. Combined, these values form the name of JAR file. For example, this evaluates to `mn4-aws-lambda-with-eventbridge-1.0.0.jar`.

:::note
- I'm using [Nushell](https://www.nushell.sh) to run these commands. Depending on your shell, you may have to tweak this command. For more details, check [Using LocalStack for AWS Lambda with SNS trigger](/post/2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger/).
- To learn more about how to configure Localstack to work with AWS CLI, check [Working with AWS on local using LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/).
:::

Next, create an event bus to receive Cloudwatch events.

```nu prompt{1} output{2..4}
aws --profile localstack events create-event-bus --name example-event-bus
{
	"EventBusArn": "arn:aws:events:us-east-1:000000000000:event-bus/example-event-bus"
}
```

We also need to create a rule that triggers on events with `source` set to `example-source`, and routes them to our Lambda function.

```nu prompt{1} output{2..4}
aws --profile localstack events put-rule --name ScheduledEventLambdaInvocationRule --event-pattern "{\"source\":[\"example-source\"]}" --state ENABLED --event-bus-name example-event-bus
{
	"RuleArn": "arn:aws:events:us-east-1:000000000000:rule/example-event-bus/ScheduledEventLambdaInvocationRule"
}
```

Configure this rule as an event source for the Lambda function.

```nu prompt{1} output{2..5}
aws --profile localstack events put-targets --rule ScheduledEventLambdaInvocationRule --event-bus-name example-event-bus --targets Id=1,Arn=arn:aws:lambda:us-east-1:000000000000:function:mn4-aws-lambda-with-eventbridge
{
	"FailedEntryCount": 0,
	"FailedEntries": []
}
```

With this setup, we're ready to test the function. Create a JSON file containing the following event.

```json
[
	{
		"Source": "example-source",
		"Detail": "{ \"message\": \"Hello, Gwen!\" }",
		"DetailType": "Scheduled Event sent through EventBridge",
		"EventBusName": "example-event-bus"
	}
]
```

Publish this event to the event bus using the following command.

```sh prompt{1} output{2..9}
aws --profile localstack events put-events --entries file://events.json
{
	"FailedEntryCount": 0,
	"Entries": [
		{
			"EventId": "1438419a-25b3-46af-863f-ffdb42025cca"
		}
	]
}
```

This should trigger the rule, which in turn invokes the Lambda function. You can verify this by checking the function logs as follows.

```sh prompt{1} output{2} {2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/java:21 -q)"
Hello, Gwen!
```

:::note
LocalStack uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're fetching the container id using `public.ecr.aws/lambda/java:21` and passing it to `docker logs` command to print the logs.
:::

You can write a unit test for this scenario as follows.

```java
package com.example;

import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import io.micronaut.context.ApplicationContext;
import org.junit.jupiter.api.AutoClose;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FunctionRequestHandlerTest {

	@AutoClose
	private final ApplicationContext context = ApplicationContext.run();
	private final FunctionRequestHandler handler = context.getBean(FunctionRequestHandler.class);

	@Test
	@DisplayName("Should print message in event detail")
	void shouldPrintMessageInEventDetail() throws IOException {
		try (var outputStream = new ByteArrayOutputStream();
				 var redirectedStream = new PrintStream(outputStream)) {
			System.setOut(redirectedStream);

			String message = "Hello World!";
			var event = new ScheduledEvent();
			event.setDetail(Map.of("message", message));
			handler.execute(event);

			String loggedMessage = outputStream.toString().trim();
			assertEquals(message, loggedMessage);
		}
	}
}
```

- We manually initialize the `ApplicationContext`, then retrieve the `FunctionRequestHandler` bean from it.
- In the `shouldPrintMessageInEventDetail` test method, we first redirect `System.out` to a custom `OutputStream` to capture the logs. Next, we invoke the function by passing a `ScheduledEvent` to the handler. On calling the `execute` method, the function should print the expected message in the logs, that is what we assert in the test.

---

**Source code**

- [mn4-aws-lambda-with-eventbridge](https://github.com/Microflash/guides/tree/main/micronaut/mn4-aws-lambda-with-eventbridge)

**Related**

- [Micronaut AWS Lambda support](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#lambda)
- [LocalStack Lambda docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
- AWS CLI Documentation for [lambda](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lambda/index.html) and [events](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/events/index.html)
