---
slug: "2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger"
title: "Using LocalStack for AWS Lambda with SNS trigger"
description: "You can use SNS to build pubsub workflows and fan-out processes. This guide explains how you can invoke Lambda via SNS subscription using LocalStack."
date: 2024-03-03 21:05:49
update: 2024-03-03 21:05:49
category: "guide"
---

<abbr title="Simple Notification Service">SNS</abbr> is often used to tackle a [pubsub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) workflow. You can also use it to [fan-out](https://en.wikipedia.org/wiki/Fan-out_(software)) a process. In many such cases, you may want to trigger an AWS Lambda function when an event arrives to a topic. In this post, I'll walk through how you can invoke an AWS Lambda through an SNS subscription using [LocalStack](https://localstack.cloud/).

:::assert{title=Series}
1. [Working with AWS on local using LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/)
2. [Using LocalStack for AWS Lambda with SQS trigger](/post/2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger/)
3. *Using LocalStack for AWS Lambda with SNS trigger*
:::

:::setup
The examples in this post use

- Java 21
- Docker 25.0.3
- AWS CLI 2.15.25
- LocalStack 3
:::

You can start with [configuring a local AWS account for LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/#configure-a-local-aws-account) and [launching the LocalStack container](/post/2021/11/16/working-with-aws-on-local-using-localstack/#launching-the-localstack-container).

## Writing a handler for Lambda

Create a Maven project with the following `pom.xml` file.

```xml caption="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>localstack-lambda-with-sns-trigger</artifactId>
	<version>0.0.1</version>

	<properties>
		<encoding>UTF-8</encoding>
		<project.build.sourceEncoding>${encoding}</project.build.sourceEncoding>
		<project.reporting.outputEncoding>${encoding}</project.reporting.outputEncoding>
		<java.version>21</java.version>
		<maven.compiler.source>${java.version}</maven.compiler.source>
		<maven.compiler.target>${java.version}</maven.compiler.target>
	</properties>

	<dependencies>
		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-lambda-java-core</artifactId>
			<version>1.2.3</version>
		</dependency>
		<dependency>
			<groupId>com.amazonaws</groupId>
			<artifactId>aws-lambda-java-events</artifactId>
			<version>3.11.4</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-shade-plugin</artifactId>
				<version>3.5.1</version>
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

Let's write a handler that would print the message from an SNS event.

```java
package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;

import java.util.List;

public class SnsRequestHandler implements RequestHandler<SNSEvent, List<String>> {

	@Override
	public List<String> handleRequest(SNSEvent event, Context context) {
		final LambdaLogger logger = context.getLogger();
		final List<String> messages = event.getRecords().stream()
				.map(SNSEvent.SNSRecord::getSNS)
				.map(SNSEvent.SNS::getMessage)
				.toList();
		messages.forEach(System.out::println);
		return messages;
	}
}
```

Build the project with `mvn clean package`. This command generates a JAR file.

## Deploying the function

Run the following command to deploy the JAR file.

```sh prompt{1}
aws --profile localstack lambda create-function --function-name localstack-lambda-with-sns-trigger --runtime java21 --role arn:aws:iam::000000000000:role/example-lambda-noop-role --handler com.example.SnsRequestHandler --zip-file $"fileb://(pwd)/target/(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar" --timeout 120
{
	"FunctionName": "localstack-lambda-with-sns-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sns-trigger",
	"Runtime": "java21",
	"Role": "arn:aws:iam::000000000000:role/example-lambda-noop-role",
	"Handler": "com.example.SnsRequestHandler",
	"CodeSize": 1082800,
	"Description": "",
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2024-03-03T15:10:59.593325+0000",
	"CodeSha256": "hTYxcYTH7CxpfIxKWSZgMzrC+qXaE7b/o0ixLoap9A0=",
	"Version": "$LATEST",
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "b14d617b-e72a-4a8f-876d-e48848b3fba9",
	"State": "Pending",
	"StateReason": "The function is being created.",
	"StateReasonCode": "Creating",
	"PackageType": "Zip",
	"Architectures": [
		"x86_64"
	],
	"EphemeralStorage": {
		"Size": 512
	},
	"SnapStart": {
		"ApplyOn": "None",
		"OptimizationStatus": "Off"
	},
	"RuntimeVersionConfig": {
		"RuntimeVersionArn": "arn:aws:lambda:us-east-1::runtime:8eeff65f6809a3ce81507fe733fe09b835899b99481ba22fd75b5a7338290ec1"
	}
}
```

- `mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout` prints out the project name and `mvn help:evaluate -Dexpression=project.version -q -DforceStdout` prints out the version specified in the `pom.xml` file. Thus, `(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar` evaluates to `localstack-lambda-with-sns-trigger-0.0.1.jar`.
- The role ARN `arn:aws:iam::000000000000:role/example-lambda-noop-role` is a fake role <abbr title="Amazon Resource Name">ARN</abbr> to satisfy AWS CLI which requires it for the `create-function` command. You can specify any arbitrary role ARN here.

> I'm using [Nushell](https://www.nushell.sh/) to run these commands. Depending on your shell, you might have to tweak them a bit.

## Creating a topic

Now, let's create a topic to publish our events.

```sh prompt{1}
aws --profile localstack sns create-topic --name example-topic
{
	"TopicArn": "arn:aws:sns:us-east-1:000000000000:example-topic"
}
```

## Creating a subscription

Let's create a subscription on the `example-topic`. This will trigger the Lambda when we publish an event to the topic.

```sh prompt{1}
aws --profile localstack sns subscribe --protocol lambda --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic --notification-endpoint arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sns-trigger
{
	"SubscriptionArn": "arn:aws:sns:us-east-1:000000000000:example-topic:2b999ba0-55fe-4abe-91e2-ce047ced5d8a"
}
```

Now, we can test if this setup works correctly.

## Invoking the function

Publish an event to the topic.

```sh prompt{1}
aws --profile localstack sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic --message "Don't mess with my food!"
{
	"MessageId": "3140b462-a20f-40f3-970c-d1c72886fb57"
}
```

To verify if the Lambda was invoked, check the logs of the container used for running the function.

```sh {2} prompt{1}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/java:21 -q)"
Don't mess with my food!
```

Well, there's your message printed by the function.

> LocalStack uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from `public.ecr.aws/lambda/` to run a function in a container. That's why, we're fetching the container id of the container using `public.ecr.aws/lambda/java:21` and passing it to `docker logs` command to print the logs.

## Cleaning up the resources

To finish things, you can delete the AWS resources with the following commands.

```sh prompt{1..3}
aws --profile localstack sns unsubscribe --subscription-arn arn:aws:sns:us-east-1:000000000000:example-topic:2b999ba0-55fe-4abe-91e2-ce047ced5d8a
aws --profile localstack lambda delete-function --function-name localstack-lambda-with-sns-trigger
aws --profile localstack sns delete-topic --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic
```

You can also bring the container down.

```sh prompt{1}
docker compose down
```

---

**Source code**

- [localstack-lambda-with-sns-trigger](https://github.com/Microflash/guides/tree/main/aws/localstack-lambda-with-sns-trigger)

**Related**

- [LocalStack Lambda docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
- AWS CLI Documentation for [lambda](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lambda/index.html) and [sns](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sns/index.html)
