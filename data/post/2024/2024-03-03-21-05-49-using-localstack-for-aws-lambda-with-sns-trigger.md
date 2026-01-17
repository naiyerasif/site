---
slug: "2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger"
title: "Using LocalStack for AWS Lambda with SNS trigger"
date: 2024-03-03 21:05:49
update: 2025-05-24 19:27:45
type: "guide"
---

SNS (Simple Notification Service) is often used to tackle a [pubsub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) workflow. You can also use it to [fan-out](https://en.wikipedia.org/wiki/Fan-out_(software)) a process. In many such cases, you may want to trigger an AWS Lambda function when an event arrives to a topic. In this post, we'll deploy an AWS Lambda and trigger it through an SNS subscription using [LocalStack](https://localstack.cloud/).

:::assert{title="Series"}
1. [Working with AWS on local using LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/)
2. [Using LocalStack for AWS Lambda with SQS trigger](/post/2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger/)
3. *Using LocalStack for AWS Lambda with SNS trigger*
4. [Using LocalStack for AWS Lambda with EventBridge rule trigger](/post/2024/08/11/using-localstack-for-aws-lambda-with-eventbridge-rule-trigger/)
:::

:::note{.setup}
The examples in this post use

- Docker 27.5.1
- AWS CLI 2.27.19
- LocalStack 4.4.0
- Java 21
:::

You can start with [configuring a local AWS account for LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/#configure-a-local-aws-account) and [launching the LocalStack container](/post/2021/11/16/working-with-aws-on-local-using-localstack/#launching-the-localstack-container).

## Writing a handler for Lambda

Create a Maven project with the following `pom.xml` file.

```xml title="pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>localstack-lambda-with-sns-trigger</artifactId>
	<version>0.0.2</version>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
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
			<version>3.15.0</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-shade-plugin</artifactId>
				<version>3.6.0</version>
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
		messages.forEach(System.out::println);
		return messages;
	}
}
```

Build the project with `mvn clean package` to generate a JAR file.

## Deploying the function

Run the following command to deploy the JAR file.

```sh prompt{1} output{2..38}
aws --profile localstack lambda create-function --function-name localstack-lambda-with-sns-trigger --runtime java21 --role arn:aws:iam::000000000000:role/example-lambda-noop-role --handler com.example.SnsRequestHandler --zip-file $"fileb://(pwd)/target/(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar" --timeout 120
{
	"FunctionName": "localstack-lambda-with-sns-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sns-trigger",
	"Runtime": "java21",
	"Role": "arn:aws:iam::000000000000:role/example-lambda-noop-role",
	"Handler": "com.example.SnsRequestHandler",
	"CodeSize": 1162197,
	"Description": "",
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2025-05-24T13:44:50.191647+0000",
	"CodeSha256": "4n8mX+5l2Hlj5ZApDqCgfiwm8Bby+935h98DDDNonTg=",
	"Version": "$LATEST",
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "7e6575b3-1fb1-4350-83b6-9fb0dba7b89a",
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
		"LogGroup": "/aws/lambda/localstack-lambda-with-sns-trigger"
	}
}
```

- `mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout` prints out the project name and `mvn help:evaluate -Dexpression=project.version -q -DforceStdout` prints out the version specified in the `pom.xml` file. Thus, `(mvn help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-(mvn help:evaluate -Dexpression=project.version -q -DforceStdout).jar` evaluates to `localstack-lambda-with-sns-trigger-0.0.2.jar`.
- The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/example-lambda-noop-role` is a fake role ARN to satisfy AWS CLI which requires it for the `create-function` command. You can specify any arbitrary role ARN here.

:::note
I'm using [Nushell](https://www.nushell.sh/) to run these commands. Depending on your shell, you might have to tweak them a bit.
:::

## Creating a topic

Now, let's create a topic to publish our events.

```sh prompt{1} output{2..4}
aws --profile localstack sns create-topic --name example-topic
{
	"TopicArn": "arn:aws:sns:us-east-1:000000000000:example-topic"
}
```

## Creating a subscription

Let's create a subscription on the `example-topic`. This will trigger the Lambda when we publish an event to the topic.

```sh prompt{1} output{2..4}
aws --profile localstack sns subscribe --protocol lambda --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic --notification-endpoint arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sns-trigger
{
	"SubscriptionArn": "arn:aws:sns:us-east-1:000000000000:example-topic:257206c1-75c2-4982-9f58-0e5d2a075507"
}
```

Now, we can test if this setup works correctly.

## Triggering the function

Publish an event to the topic.

```sh prompt{1} output{2..4}
aws --profile localstack sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic --message "Liberty, equality, fraternity!"
{
	"MessageId": "61a57d29-14e4-4dd8-b1a5-392b4e90bdda"
}
```

To verify if the Lambda was triggered, check the logs of the container used for running the function.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/java:21 -q)"
Liberty, equality, fraternity!
```

Well, there's your message printed by the function.

:::note
LocalStack uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're fetching the container id using `public.ecr.aws/lambda/java:21` and passing it to `docker logs` command to print the logs.
:::

## Cleaning up the resources

To finish things, you can delete the AWS resources with the following commands.

```sh prompt{1..3}
aws --profile localstack sns unsubscribe --subscription-arn arn:aws:sns:us-east-1:000000000000:example-topic:257206c1-75c2-4982-9f58-0e5d2a075507
aws --profile localstack lambda delete-function --function-name localstack-lambda-with-sns-trigger
aws --profile localstack sns delete-topic --topic-arn arn:aws:sns:us-east-1:000000000000:example-topic
```

---

**Source code**

- [localstack-lambda-with-sns-trigger](https://github.com/Microflash/guides/tree/main/aws/localstack-lambda-with-sns-trigger)

**Related**

- [LocalStack Lambda docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
- AWS CLI Documentation for [lambda](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lambda/index.html) and [sns](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sns/index.html)
