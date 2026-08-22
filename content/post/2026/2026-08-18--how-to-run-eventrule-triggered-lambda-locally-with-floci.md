---
slug: "post/2026/08/18/how-to-run-eventrule-triggered-lambda-locally-with-floci"
title: "How to run EventRule-triggered Lambda locally with Floci"
date: 2026-08-18 23:10:49
update: 2026-08-18 23:10:49
category: "guide"
series: "2026--floci"
---

[Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html) is a serverless solution to build event-driven workflows. For example, it can trigger an AWS Lambda function based on a rule. This can be used to run operations like optimizing images after uploading them to S3, generating aggregated reports from DynamoDB updates, or reacting to changes in other AWS resources. In this post, we'll deploy a Lambda function, and trigger it with an EventBridge rule on local using [Floci](https://github.com/floci-io/floci).

:::note{title="Environment"}
- Docker 29.4.0
- AWS CLI 2.36.25
- Floci 1.7.0
- Python 3.14
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

Write a [handler](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html) in Python to print the message from an EventBridge [event](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html).

```python title="main.py"
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(event['detail']['Message'])
```

You can deploy this handler by uploading it as a zip archive or container image. For our example, let's create a zip archive.

```sh prompt{1}
zip function.zip main.py
```

Run the following command to deploy the `function.zip` file.

```sh prompt{1} output{2..28}
aws --profile floci lambda create-function --function-name floci-lambda-with-eventbridge-rule-trigger --runtime python3.14 --role arn:aws:iam::000000000000:role/local-lambda-noop-role --handler main.lambda_handler --zip-file fileb://function.zip --timeout 120
{
	"FunctionName": "floci-lambda-with-eventbridge-rule-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-eventbridge-rule-trigger",
	"Runtime": "python3.14",
	"Role": "arn:aws:iam::000000000000:role/local-lambda-noop-role",
	"Handler": "main.lambda_handler",
	"CodeSize": 575,
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2026-08-18T17:54:00.133+0000",
	"CodeSha256": "UWUnFN5ieKa74i6RaEQnoXJUl+i7+XNNd3EQ2In66vs=",
	"Version": "$LATEST",
	"Environment": {},
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "c7a67a0e-3551-427b-b164-a7d7fffa29c2",
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

The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/local-lambda-noop-role` is a fake role ARN. AWS CLI requires it for `create-function` command. Floci doesn't care about this role; you're free to specify any arbitrary role ARN.

## Create an event bus and event rule

Next, create an event bus and event rule using the following commands.

```sh prompt{1,6} output{2..4,7..9}
aws --profile floci events create-event-bus --name local-event-bus
{
	"EventBusArn": "arn:aws:events:us-east-1:000000000000:event-bus/local-event-bus"
}

aws --profile floci events put-rule --name ScheduledEventLambdaInvocationRule --event-pattern "{\"source\":[\"local-source\"]}" --state ENABLED --event-bus-name local-event-bus
{
	"RuleArn": "arn:aws:events:us-east-1:000000000000:rule/local-event-bus/ScheduledEventLambdaInvocationRule"
}
```

The `ScheduledEventLambdaInvocationRule` rule will forward an event with the `source` set as `local-source` published on the `local-event-bus` to our Lambda function. For this to work, we've to configure the Lambda as a target of the rule.

```sh prompt{1} output{2..5}
aws --profile floci events put-targets --rule ScheduledEventLambdaInvocationRule --event-bus-name local-event-bus --targets Id=1,Arn=arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-eventbridge-rule-trigger
{
	"FailedEntryCount": 0,
	"FailedEntries": []
}
```

Now, we can test if this setup works correctly.

## Trigger the function

Create a JSON file with a sample event as follows. Set the source as `local-source`, else the `ScheduledEventLambdaInvocationRule` won't get activated and the Lambda function won't be triggered.

```json title="events.json" {3,6}
[
	{
		"Source": "local-source",
		"Detail": "{ \"Message\": \"Hello, Gwen!\" }",
		"DetailType": "Scheduled Event sent through EventBridge",
		"EventBusName": "local-event-bus"
	}
]
```

Let's put the event on the event bus.

```sh prompt{1} output{2..9}
aws --profile floci events put-events --entries file://events.json
{
	"FailedEntryCount": 0,
	"Entries": [
		{
			"EventId": "6975fdcc-1467-4d63-93e7-43b8840e2a10"
		}
	]
}
```

To verify the Lambda invocation, check the logs of the container used for running the function.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/python:3.14 -q)"
[INFO]	2026-08-18T17:59:08.904Z	165e8ed2-03e3-450a-9804-c01724ea4814	Hello, Gwen
```

We do see our message, `Hello, Gwen!`, printed in the logs confirming that the function is getting triggered.

:::note
Floci uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're querying the container id with `public.ecr.aws/lambda/python:3.14` and passing it to `docker logs` to print the logs.
:::

## Clean up the resources

To finish things, you can tear down the AWS resources with the following commands.

```sh prompt{1..4}
aws --profile floci lambda delete-function --function-name floci-lambda-with-eventbridge-rule-trigger
aws --profile floci events remove-targets --rule ScheduledEventLambdaInvocationRule --ids 1 --event-bus-name local-event-bus
aws --profile floci events delete-rule --name ScheduledEventLambdaInvocationRule --event-bus-name local-event-bus
aws --profile floci events delete-event-bus --name local-event-bus
```

---

**Source code**

- [floci-lambda-with-eventbridge-rule-trigger](https://github.com/naiyerasif/backstage/tree/main/aws/floci-lambda-with-eventbridge-rule-trigger)

**Related**

- [Floci - Running with Docker](https://floci.io/floci/configuration/docker-compose/)
- AWS CLI Documentation for [lambda](https://docs.aws.amazon.com/cli/latest/reference/lambda/) and [events](https://docs.aws.amazon.com/cli/latest/reference/events/)
