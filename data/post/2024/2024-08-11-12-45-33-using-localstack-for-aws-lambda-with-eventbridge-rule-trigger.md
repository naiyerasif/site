---
slug: "2024/08/11/using-localstack-for-aws-lambda-with-eventbridge-rule-trigger"
title: "Using LocalStack for AWS Lambda with EventBridge rule trigger"
description: "Amazon EventBridge is a serverless service that can be used to trigger AWS Lambda through rules. This posts shows how to do this locally using LocalStack."
date: 2024-08-11 12:45:33
update: 2025-05-24 22:44:21
type: "guide"
---

[Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html) is a serverless service for building event-driven loosely coupled workflows. It can trigger AWS Lambda functions based on specific rules. This is really handy for tasks like optimizing images after S3 uploads, generating aggregated reports from DynamoDB updates, or reacting to changes in other AWS resources. In this post, we'll deploy a Lambda function, and trigger it through an EventBridge rule locally using [LocalStack](https://localstack.cloud/).

:::assert{label="Series"}
1. [Working with AWS on local using LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/)
2. [Using LocalStack for AWS Lambda with SQS trigger](/post/2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger/)
3. [Using LocalStack for AWS Lambda with SNS trigger](/post/2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger/)
4. *Using LocalStack for AWS Lambda with EventBridge rule trigger*
:::

:::note{.setup}
The examples in this post use

- Docker 27.5.1
- AWS CLI 2.27.19
- LocalStack 4.4.0
- Python 3.13
:::

Start with [configuring a local AWS account for LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/#configure-a-local-aws-account) and [launching the LocalStack container](/post/2021/11/16/working-with-aws-on-local-using-localstack/#launching-the-localstack-container).

## Writing a handler for Lambda

Let's write a [handler](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html) in Python to print the message in an [event](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html) from EventBridge.

```python title="main.py"
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(event['detail']['Message'])
```

You can deploy this handler by uploading it as a zip archive or container image. For our example, let's create a zip archive for deployment.

```sh prompt{1}
zip function.zip main.py
```

## Deploying the function

Run the following command to deploy the `function.zip` file.

```sh prompt{1} output{2..38}
aws --profile localstack lambda create-function --function-name localstack-lambda-with-eventbridge-rule-trigger --runtime python3.13 --role arn:aws:iam::000000000000:role/example-lambda-noop-role --handler main.lambda_handler --zip-file fileb://function.zip --timeout 120
{
	"FunctionName": "localstack-lambda-with-eventbridge-rule-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-eventbridge-rule-trigger",
	"Runtime": "python3.13",
	"Role": "arn:aws:iam::000000000000:role/example-lambda-noop-role",
	"Handler": "main.lambda_handler",
	"CodeSize": 307,
	"Description": "",
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2025-05-24T14:27:57.513778+0000",
	"CodeSha256": "CBYQUqfcWB77fP++tat0NGjL1FEq4RYgwu7+IfTqg0Q=",
	"Version": "$LATEST",
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "84eb9269-b79c-43bd-af97-0e1fea7a0a99",
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
		"LogGroup": "/aws/lambda/localstack-lambda-with-eventbridge-rule-trigger"
	}
}
```

The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/example-lambda-noop-role` is a fake role ARN. AWS CLI requires it for `create-function` command. LocalStack doesn't care about this role; and you're free to specify any arbitrary role ARN.

## Creating an event bus and event rule

Now, let's create an event bus and event rule.

```sh prompt{1,6} output{2..4,7..9}
aws --profile localstack events create-event-bus --name example-event-bus
{
	"EventBusArn": "arn:aws:events:us-east-1:000000000000:event-bus/example-event-bus"
}

aws --profile localstack events put-rule --name ScheduledEventLambdaInvocationRule --event-pattern "{\"source\":[\"example-source\"]}" --state ENABLED --event-bus-name example-event-bus
{
	"RuleArn": "arn:aws:events:us-east-1:000000000000:rule/example-event-bus/ScheduledEventLambdaInvocationRule"
}
```

The `ScheduledEventLambdaInvocationRule` rule will forward an event with the source set as `example-source` published on the `example-event-bus` to our Lambda function. However, for that to happen, we've to configure the Lambda as a target of the rule.

```sh prompt{1} output{2..6}
aws --profile localstack events put-targets --rule ScheduledEventLambdaInvocationRule --event-bus-name example-event-bus --targets Id=1,Arn=arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-eventbridge-rule-trigger
{
	"FailedEntryCount": 0,
	"FailedEntries": []
}
```

We're ready to test if this setup works correctly.

## Triggering the function

Create a JSON file with a sample event that we can put on the event bus.

```json title="events.json" {3,6}
[
	{
		"Source": "example-source",
		"Detail": "{ \"Message\": \"Hello, Gwen!\" }",
		"DetailType": "Scheduled Event sent through EventBridge",
		"EventBusName": "example-event-bus"
	}
]
```

:::assert
Don't forget to set the source as `example-source`. Else the `ScheduledEventLambdaInvocationRule` won't get activated and the Lambda function won't be triggered.
:::

Let's put the event on the event bus.

```sh prompt{1} output{2..9}
aws --profile localstack events put-events --entries file://events.json
{
	"FailedEntryCount": 0,
	"Entries": [
		{
			"EventId": "ba0064df-06c5-4a4c-b145-379fde27d859"
		}
	]
}
```

To verify the Lambda invocation, check the logs of the container used for running the function.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/python:3.13 -q)"
[INFO]  2025-05-24T14:37:15.291Z        28dcdc60-2d88-49b7-b866-994c408d16da    Hello, Gwen!
```

:::note
LocalStack uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're fetching the container id using `public.ecr.aws/lambda/python:3.13` and passing it to `docker logs` command to print the logs.
:::

We do see our message, `Hello, Gwen!`, being printed in the logs confirming that the function is getting triggered.

## Cleaning up the resources

To finish things, you can tear down the AWS resources with the following commands.

```sh prompt{1..4}
aws --profile localstack lambda delete-function --function-name localstack-lambda-with-eventbridge-rule-trigger
aws --profile localstack events remove-targets --rule ScheduledEventLambdaInvocationRule --ids 1 --event-bus-name example-event-bus
aws --profile localstack events delete-rule --name ScheduledEventLambdaInvocationRule --event-bus-name example-event-bus
aws --profile localstack events delete-event-bus --name example-event-bus
```

---

**Source code**

- [localstack-lambda-with-eventbridge-rule-trigger](https://github.com/Microflash/guides/tree/main/aws/localstack-lambda-with-eventbridge-rule-trigger)

**Related**

- [LocalStack Lambda docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
- AWS CLI Documentation for [lambda](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lambda/index.html) and [events](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/events/index.html)
