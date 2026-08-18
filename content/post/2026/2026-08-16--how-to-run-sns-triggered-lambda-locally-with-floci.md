---
slug: "post/2026/08/16/how-to-run-sns-triggered-lambda-locally-with-floci"
title: "How to run SNS-triggered Lambda locally with Floci"
date: 2026-08-16 20:36:01
update: 2026-08-18 23:04:23
category: "guide"
---

SNS (Simple Notification Service) is often used to implement a [pubsub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) workflow, or to [fan-out](https://en.wikipedia.org/wiki/Fan-out_(software)) a process. In such cases, you may want to trigger an AWS Lambda function when an event arrives to a topic. In this post, we'll deploy an AWS Lambda and trigger it through an SNS subscription using [Floci](https://floci.io/).

:::assert{title="Series"}
1. [How to use AWS CLI with Floci for local development](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/)
2. [How to run SQS-triggered Lambda locally with Floci](/post/2026/08/16/how-to-run-sqs-triggered-lambda-locally-with-floci/)
3. *How to run SNS-triggered Lambda locally with Floci*
4. [How to run EventRule-triggered Lambda locally with Floci](/post/2026/08/18/how-to-run-eventrule-triggered-lambda-locally-with-floci/)
:::

:::note{title="Environment"}
- Docker 29.4.0
- AWS CLI 2.36.25
- Floci 1.7.0
- Java 25
:::

Configure a [local AWS account for Floci](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/#configure-aws-credentials) and [launch the Floci container](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/#launch-the-floci-container) using the following Compose file before you continue further.

```yml title="compose.yml"
services:
  floci:
    container_name: floci
    image: floci/floci:1.7.0
    ports:
      - "4566:4566"
    volumes:
      - "./data:/app/data"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

## Create a Lambda function

Create a Maven project with the following `pom.xml` file.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>floci-lambda-with-sns-trigger</artifactId>
	<version>0.0.3</version>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<java.version>25</java.version>
		<maven.compiler.source>${java.version}</maven.compiler.source>
		<maven.compiler.target>${java.version}</maven.compiler.target>
	</properties>

	<dependencies>
		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-lambda-java-core</artifactId>
			<version>1.4.0</version>
		</dependency>
		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-lambda-java-events</artifactId>
			<version>3.16.1</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-shade-plugin</artifactId>
				<version>3.6.2</version>
				<configuration>
					<createDependencyReducedPom>false</createDependencyReducedPom>
				</configuration>
				<executions>
					<execution>
						<phase>package</phase>
						<goals>
							<goal>shade</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>

</project>
```

Write a handler that would print the message from an SNS event.

```java
package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;

import java.util.List;

public class SnsRequestHandler implements RequestHandler<SNSEvent, List<String>> {

	@Override
	public List<String> handleRequest(SNSEvent event, Context context) {
		final List<String> messages = event.getRecords().stream()
				.map(SNSEvent.SNSRecord::getSNS)
				.map(SNSEvent.SNS::getMessage)
				.toList();
		messages.forEach(IO::println);
		return messages;
	}
}
```

Build the project with `mvn clean package` to generate a JAR file. Run the following command to deploy this JAR file.

```sh prompt{1} output{2..28}
aws --profile floci lambda create-function --function-name floci-lambda-with-sns-trigger --runtime java25 --role arn:aws:iam::000000000000:role/local-lambda-noop-role --handler com.example.SnsRequestHandler --zip-file $"fileb://(pwd)/target/(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar" --timeout 120
{
	"FunctionName": "floci-lambda-with-sns-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-sns-trigger",
	"Runtime": "java25",
	"Role": "arn:aws:iam::000000000000:role/local-lambda-noop-role",
	"Handler": "com.example.SnsRequestHandler",
	"CodeSize": 1167193,
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2026-08-18T17:30:04.011+0000",
	"CodeSha256": "WCkoGkTsdxYaZVbNRxPonEIzNDcrfRSg86+P2Xzbx94=",
	"Version": "$LATEST",
	"Environment": {},
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "deddc59d-4470-45cc-ba19-8a5db028119b",
	"State": "Active",
	"LastUpdateStatus": "Successful",
	"PackageType": "Zip",
	"Architectures": [
		"x86_64"
	],
	"EphemeralStorage": {
		"Size": 512
	}
}
```

- `mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout` prints out the project name and `mvn help:evaluate -Dexpression=project.version -q -DforceStdout` prints out the version specified in the `pom.xml` file. Thus, `(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar` evaluates to `floci-lambda-with-sns-trigger-0.0.3.jar`.
- The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/local-lambda-noop-role` is a fake role ARN to satisfy AWS CLI which requires it for the `create-function` command. You can specify any arbitrary role ARN here.

:::note
I'm using [Nushell](https://www.nushell.sh/) to run these commands. Depending on your shell, you might have to tweak them a bit.
:::

## Create a topic

Now, let's create a topic to publish our events.

```sh prompt{1} output{2..4}
aws --profile floci sns create-topic --name local-topic
{
	"TopicArn": "arn:aws:sns:us-east-1:000000000000:local-topic"
}
```

## Configure the topic subscription as trigger

Create a subscription on the `local-topic`. This will trigger the Lambda when we publish an event to the topic.

```sh prompt{1} output{2..4}
aws --profile floci sns subscribe --protocol lambda --topic-arn arn:aws:sns:us-east-1:000000000000:local-topic --notification-endpoint arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-sns-trigger
{
	"SubscriptionArn": "arn:aws:sns:us-east-1:000000000000:local-topic:3dd89731-6892-4e13-8ce7-5de8ba9ff9c0"
}
```

Now, we can test if this setup works correctly.

## Trigger the function

Publish an event to the topic.

```sh prompt{1} output{2..4}
aws --profile floci sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:local-topic --message "Liberty, equality, fraternity!"
{
	"MessageId": "b5d1942b-9ff7-481d-8df2-8cf5c05d574b"
}
```

To verify if the Lambda was triggered, check the logs of the container used for running the function.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/java:25 -q)"
Liberty, equality, fraternity!
```

Well, there's your message printed by the function.

:::note
Floci uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're querying the container id with `public.ecr.aws/lambda/java:25` and passing it to `docker logs` to print the logs.
:::

## Clean up the resources

To finish things, you can delete the AWS resources with the following commands.

```sh prompt{1..3}
aws --profile floci sns unsubscribe --subscription-arn arn:aws:sns:us-east-1:000000000000:local-topic:3dd89731-6892-4e13-8ce7-5de8ba9ff9c0
aws --profile floci lambda delete-function --function-name floci-lambda-with-sns-trigger
aws --profile floci sns delete-topic --topic-arn arn:aws:sns:us-east-1:000000000000:local-topic
```

---

**Source code**

- [floci-lambda-with-sns-trigger](https://github.com/naiyerasif/backstage/tree/main/aws/floci-lambda-with-sns-trigger)

**Related**

- [Floci - Running with Docker](https://floci.io/floci/configuration/docker-compose/)
- AWS CLI Documentation for [lambda](https://docs.aws.amazon.com/cli/latest/reference/lambda/) and [sns](https://docs.aws.amazon.com/cli/latest/reference/sns/)
