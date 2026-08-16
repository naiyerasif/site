---
slug: "post/2026/08/16/how-to-run-sqs-triggered-lambda-locally-with-floci"
title: "How to run SQS-triggered Lambda locally with Floci"
date: 2026-08-16 18:02:46
update: 2026-08-16 18:02:46
category: "guide"
---

One of the common ways to run asynchronous workloads is through an AWS Lambda function triggered by a message from SQS (Simple Queue Service). SQS helps control the order of processing, and serves as a buffer to handle temporary spikes in load on a system. Let's explore how we can do this locally using [Floci](https://github.com/floci-io/floci).

:::assert{title="Series"}
1. [How to use AWS CLI with Floci for local development](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/)
2. *How to run SQS-triggered Lambda locally with Floci*
:::

:::note{title="Environment"}
- Docker 29.4.0
- AWS CLI 2.36.24
- Floci 1.6.0
- Node.js 24
:::

Configure a [local AWS account for Floci](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/#configure-aws-credentials) and [launch the Floci container](/post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development/#launch-the-floci-container) before you continue further.

## Create a Lambda function

Write a minimal [handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) in JavaScript that prints the message from an SQS event.

```js title="index.mjs"
export const handler = async (event) => {
	const messages = event.Records.map(record => record.body);
	messages.forEach(message => console.log(message));
	return messages;
};
```

Note that this is an [ESM](https://nodejs.org/api/esm.html) handler (indicated by `.mjs` extension). To deploy this handler, we can upload it either as a zip archive or a container image. For this example, we'll use the former. Let's copy `index.mjs` file into a zip archive.

```sh prompt{1}
zip function.zip index.mjs
```

:::note
You can use a different utility (for example, [7zip](https://www.7-zip.org/)) to create the zip archive if the `zip` command isn't available on your operating system.
:::

Now, run the following command to deploy the `function.zip` file.

```sh prompt{1} output{2..28}
aws --profile floci lambda create-function --function-name floci-lambda-with-sqs-trigger --runtime nodejs24.x --role arn:aws:iam::000000000000:role/local-lambda-noop-role --handler index.handler --zip-file fileb://function.zip --timeout 120
{
	"FunctionName": "floci-lambda-with-sqs-trigger",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-sqs-trigger",
	"Runtime": "nodejs24.x",
	"Role": "arn:aws:iam::000000000000:role/local-lambda-noop-role",
	"Handler": "index.handler",
	"CodeSize": 586,
	"Timeout": 120,
	"MemorySize": 128,
	"LastModified": "2026-08-16T14:29:33.431+0000",
	"CodeSha256": "bW7fkI0KPxasJPkPtA1iMXjdQO/tBl+fISPEDz63Cls=",
	"Version": "$LATEST",
	"Environment": {},
	"TracingConfig": {
		"Mode": "PassThrough"
	},
	"RevisionId": "f2b35a05-0e55-456e-822d-3e69560bc3c4",
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

The role ARN (Amazon Resource Name) `arn:aws:iam::000000000000:role/local-lambda-noop-role` is a fake role ARN to satisfy AWS CLI; it's a required parameter for `create-function` command. Floci doesn't care about this role; and you can specify any arbitrary role ARN.

## Create a queue

Create a queue with the following command.

```sh prompt{1} output{2..4}
aws --profile floci sqs create-queue --queue-name LocalQueue
{
	"QueueUrl": "http://localhost:4566/000000000000/LocalQueue"
}
```

## Configure the queue as trigger

Next, configure the `LocalQueue` as a trigger on the Lambda. To do this, we need the ARN of the queue, which we can obtain with the following command.

```sh {4} prompt{1} output{2..6}
aws --profile floci sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/LocalQueue --attribute-names QueueArn
{
	"Attributes": {
		"QueueArn": "arn:aws:sqs:us-east-1:000000000000:LocalQueue"
	}
}
```

Configure the queue using this ARN as a trigger on the Lambda.

```sh prompt{1} output{2..10}
aws --profile floci lambda create-event-source-mapping --function-name floci-lambda-with-sqs-trigger --batch-size 10 --event-source-arn arn:aws:sqs:us-east-1:000000000000:LocalQueue
{
	"UUID": "6dcd4a93-0998-42fa-a018-9b32e225476e",
	"BatchSize": 10,
	"EventSourceArn": "arn:aws:sqs:us-east-1:000000000000:LocalQueue",
	"FunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:floci-lambda-with-sqs-trigger",
	"LastModified": "2026-08-16T20:00:38.556000+05:30",
	"State": "Enabled",
	"FunctionResponseTypes": []
}
```

Now, we're ready to test if this setup works as we expect.

## Trigger the function

Publish a message on the queue.

```sh prompt{1} output{2..5}
aws --profile floci sqs send-message --queue-url http://localhost:4566/000000000000/LocalQueue --message-body "Hello, Gwen!"
{
	"MD5OfMessageBody": "9552fd83e6071cf096ab709f9ccac0bc",
	"MessageId": "44cb0755-cedd-41d6-9bc2-8a8f3c30b6b4"
}
```

Check the logs of the container used for running the function to verify if it is invoked successfully.

```sh {2} prompt{1} output{2}
docker logs $"(docker ps --filter ancestor=public.ecr.aws/lambda/nodejs:24 -q)"
2026-08-16T14:32:50.903Z	f478ad39-7811-438b-bb1b-08cd776e3cbc	INFO	Hello, Gwen!
```

:::note
Floci uses the [official AWS Docker base images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) pulled from [Amazon ECR registry](https://gallery.ecr.aws/lambda/) to run a function in a container. That's why, we're querying the container id with `public.ecr.aws/lambda/nodejs:24` and passing it to `docker logs` to print the logs.
:::


## Clean up the resources

To finish things, you can tear down the AWS resources with the following commands.

```sh prompt{1..2}
aws --profile floci lambda delete-function --function-name floci-lambda-with-sqs-trigger
aws --profile floci sqs delete-queue --queue-url http://localhost:4566/000000000000/LocalQueue
```

---

**Source code**

- [floci-lambda-with-sqs-trigger](https://github.com/naiyerasif/backstage/tree/main/aws/floci-lambda-with-sqs-trigger)

**Related**

- [Floci - Running with Docker](https://floci.io/floci/configuration/docker-compose/)
- AWS CLI Documentation for [lambda](https://docs.aws.amazon.com/cli/latest/reference/lambda/) and [sqs](https://docs.aws.amazon.com/cli/latest/reference/sqs/)
