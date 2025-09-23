---
slug: "2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger"
title: "Using LocalStack for AWS Lambda with SQS trigger"
description: "In event-driven systems, you may trigger AWS Lambda with SQS messages for ordered processing and buffered backlog handling. Explore deploying and triggering Lambda with SQS locally using LocalStack."
date: 2024-02-11 17:38:21
update: 2025-05-24 18:30:11
type: "guide"
---

In an event-driven architecture, you might trigger an AWS Lambda function by a message from SQS (Simple Queue Service). SQS helps control the order of message processing, and serves as a buffer to handle temporary spikes in load on a system. In this post, we'll deploy an AWS Lambda, and trigger it through SQS locally using [LocalStack](https://localstack.cloud/).

:::assert{title="Series"}
1. [Working with AWS on local using LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/)
2. *Using LocalStack for AWS Lambda with SQS trigger*
3. [Using LocalStack for AWS Lambda with SNS trigger](/post/2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger/)
4. [Using LocalStack for AWS Lambda with EventBridge rule trigger](/post/2024/08/11/using-localstack-for-aws-lambda-with-eventbridge-rule-trigger/)
:::

:::note{.setup}
The examples in this post use

- Docker 27.5.1
- AWS CLI 2.27.19
- LocalStack 4.4.0
- Node.js 22
:::

Start with [configuring a local AWS account for LocalStack](/post/2021/11/16/working-with-aws-on-local-using-localstack/#configure-a-local-aws-account) and [launching the LocalStack container](/post/2021/11/16/working-with-aws-on-local-using-localstack/#launching-the-localstack-container).

## Writing a handler for Lambda

Let's write a [handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) in JavaScript that would print the message from an SQS event.

```js title="index.mjs"
export const handler = async (event) => {
	const messages = event.Records.map(record => record.body);
	messages.forEach(message => console.log(message));
	return messages;
};
```

Note that the extension of the file of this handler is `.mjs` to force AWS Lambda runtime to treat it as an [ECMAScript module](https://nodejs.org/api/esm.html). If you use `.js` extension, AWS Lambda runtime will treat it as a [CommonJS module](https://nodejs.org/api/modules.html) (and will throw error at runtime when you try to trigger the function). There are [other ways](https://aws.amazon.com/blogs/compute/using-node-js-es-modules-and-top-level-await-in-aws-lambda/) to signal the module type (for example, through `"type": "module"` property in the `package.json`).

You can deploy this handler by uploading it in either a zip archive or a container image. For the sake of simplicity, let's copy this file into a zip archive.

```sh prompt{1}
zip function.zip index.mjs
```

:::note
You can download and use other utilities (for example, [7zip](https://www.7-zip.org/)) to create the zip archive if the `zip` command isn't available on your operating system.
:::

## Deploying the function

Run the following command to deploy the `function.zip` file.

```sh prompt{1} output{2..38}
aws --profile localstack lambda create-function --function-name localstack-lambda-with-sqs-trigger --runtime nodejs22.x --role arn:aws:iam::000000000000:role/example-lambda-noop-role --handler index.handler --zip-file fileb://function.zip --timeout 120
{
	"FunctionName": "localstack-lambda-with-sqs-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sqs-trigger",
	"Runtime": "nodejs22.x",
	"Role": "arn:aws:iam::000000000000:role/example-lambda-noop-role",
	"Handler": "index.handler",
	"CodeSize": 292,
	"Description": "",
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2025-05-24T12:44:51.361044+0000",
	"CodeSha256": "g9W44igGTtptMuYJTzSETkm6Ar29+rrJXkMOUZE2/9k=",
	"Version": "$LATEST",
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "eda6a90e-a10c-4e43-8404-fecfcbdf7e50",
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
		"LogGroup": "/aws/lambda/localstack-lambda-with-sqs-trigger"
	}
}
```

The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/example-lambda-noop-role` is a fake role ARN to satisfy AWS CLI; it's a required parameter for `create-function` command. LocalStack doesn't care about this role; and you're free to specify any arbitrary role ARN.

## Creating a queue

Now, let's create a queue to publish our messages.

```sh prompt{1} output{2..4}
aws --profile localstack sqs create-queue --queue-name ExampleQueue
{
	"QueueUrl": "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/ExampleQueue"
}
```

## Configuring the queue as an event source

To trigger the Lambda for the messages published on the `ExampleQueue`, we need to configure it as an event source. But first, we need the ARN of this queue.

```sh {4} prompt{1} output{2..6}
aws --profile localstack sqs get-queue-attributes --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/ExampleQueue --attribute-names QueueArn
{
	"Attributes": {
		"QueueArn": "arn:aws:sqs:us-east-1:000000000000:ExampleQueue"
	}
}
```

Let's configure the queue using this ARN to be event source of the Lambda.

```sh prompt{1} output{2..13}
aws --profile localstack lambda create-event-source-mapping --function-name localstack-lambda-with-sqs-trigger --batch-size 10 --event-source-arn arn:aws:sqs:us-east-1:000000000000:ExampleQueue
{
	"UUID": "6b2fc2d6-b588-476d-a2c5-e2b0521879e1",
	"BatchSize": 10,
	"MaximumBatchingWindowInSeconds": 0,
	"EventSourceArn": "arn:aws:sqs:us-east-1:000000000000:ExampleQueue",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:localstack-lambda-with-sqs-trigger",
	"LastModified": "2025-05-24T18:20:21.564100+05:30",
	"State": "Creating",
	"StateTransitionReason": "USER_INITIATED",
	"FunctionResponseTypes": [],
	"EventSourceMappingArn": "arn:aws:lambda:us-east-1:000000000000:event-source-mapping:6b2fc2d6-b588-476d-a2c5-e2b0521879e1"
}
```

Now, we're ready to test if this setup works correctly.

## Triggering the function

Publish a message on the queue.

```sh prompt{1} output{2..5}
aws --profile localstack sqs send-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/ExampleQueue --message-body "Hello, Gwen!"
{
	"MD5OfMessageBody": "9552fd83e6071cf096ab709f9ccac0bc",
	"MessageId": "dcf46713-e2f1-4aec-be9b-40a685e25b4d"
}
```

To verify if the Lambda invocation, check the logs of the container used for running the function.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/nodejs:22 -q)"
2025-05-24T12:51:27.661Z        c85f6d82-ebbe-4b1e-8f58-7e65b256b214    INFO    Hello, Gwen!
```

:::note
LocalStack uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're fetching the container id using `public.ecr.aws/lambda/nodejs:22` and passing it to `docker logs` command to print the logs.
:::

Looking at the logs, you can verify that the function is getting triggered since the message `Hello, Gwen!` that we just published on the queue is getting printed.

## Cleaning up the resources

To finish things, you can tear down the AWS resources with the following commands.

```sh prompt{1..2}
aws --profile localstack lambda delete-function --function-name localstack-lambda-with-sqs-trigger
aws --profile localstack sqs delete-queue --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/ExampleQueue
```

---

**Source code**

- [localstack-lambda-with-sqs-trigger](https://github.com/Microflash/guides/tree/main/aws/localstack-lambda-with-sqs-trigger)

**Related**

- [LocalStack Lambda docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
- [Using Node.js ES modules and top-level await in AWS Lambda](https://aws.amazon.com/blogs/compute/using-node-js-es-modules-and-top-level-await-in-aws-lambda/)
- AWS CLI Documentation for [lambda](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lambda/index.html) and [sqs](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sqs/index.html)
