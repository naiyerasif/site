---
slug: "2021/11/16/working-with-aws-on-local-using-localstack"
title: "Working with AWS on local using LocalStack"
description: "Developing with AWS can be challenging on a local machine. With LocalStack, you can prototype with AWS services without connecting to the actual AWS environment."
date: "2021-11-16 09:12:12"
update: "2023-05-28 11:46:56"
category: "guide"
tags: ["cloud", "localstack", "aws"]
---

Developing with AWS comes with its own set of challenges. If your organization has strict policies on cloud resources, prototyping with the AWS services can become a hassle. [LocalStack](https://localstack.cloud/) is a cloud emulation layer that runs offline in a container on your local machine. Using LocalStack, you can run AWS services and Lambda functions without connecting to the actual AWS environment. You can use the familiar tools like the official AWS CLI and AWS SDK to interact with LocalStack seamlessly. In this guide, I'll talk about how to setup LocalStack and use it with the AWS CLI.

:::setup
The examples in this post use

- Docker 23.0.5
- AWS CLI 2.11.23
- LocalStack 2.1.0
:::

## Configure a local AWS account

LocalStack works with a local AWS account which you can configure with the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Launch the `aws configure` command as follows.

```sh caption='Configuring the AWS account' prompt{1}
aws configure
AWS Access Key ID [None]: gwen
AWS Secret Access Key [None]: stacy
Default region name [None]: us-east-1
Default output format [None]: json
```

> You can put fake _AWS Access Key ID_ and _AWS Secret Access Key_ here. Although LocalStack requires an AWS account configured, it doesn't validate them.

## Launching the LocalStack container

Pull the latest LocalStack image from Docker (v2.1.0 at the time of writing).

```sh prompt{1}
docker pull localstack/localstack:2.1.0
```

Create a [Compose file](https://docs.docker.com/compose/compose-file/) as follows.

```yaml caption='localstack.yml'
version: '3'

services:
  aws:
    image: localstack/localstack:2.1.0
    environment:
      DEBUG: 1
      LAMBDA_DOCKER_NETWORK: my-local-aws-network
      LAMBDA_REMOTE_DOCKER: 0
      SERVICES: s3,sqs,secretsmanager
    ports:
      - 4566:4566
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

networks:
  default:
    name: my-local-aws-network
```

You can now launch the container with the following command.

```sh prompt{1}
docker compose -f localstack.yml up -d
```

Once the container is up and running, open a terminal and ping the healthcheck endpoint. If things are working, you would see the status of the available services as "available".

```sh prompt{1} caption='Healthcheck for LocalStack container'
curl localhost:4566/health
{
	"services": {
		"acm": "available",
		"apigateway": "available",
		"cloudformation": "available",
		"cloudwatch": "available",
		"config": "available",
		"dynamodb": "available",
		"dynamodbstreams": "available",
		"ec2": "available",
		"es": "available",
		"events": "available",
		"firehose": "available",
		"iam": "available",
		"kinesis": "available",
		"kms": "available",
		"lambda": "available",
		"logs": "available",
		"opensearch": "available",
		"redshift": "available",
		"resource-groups": "available",
		"resourcegroupstaggingapi": "available",
		"route53": "available",
		"route53resolver": "available",
		"s3": "available",
		"s3control": "available",
		"secretsmanager": "available",
		"ses": "available",
		"sns": "available",
		"sqs": "available",
		"ssm": "available",
		"stepfunctions": "available",
		"sts": "available",
		"support": "available",
		"swf": "available",
		"transcribe": "available"
	},
	"version": "2.0.3.dev"
}
```

## Working with AWS services

You can now use the AWS services (such as S3, SNS, SQS, Secrets Manager, etc) through the port 4566. You can find the list of the core AWS services available on LocalStack [here](https://docs.localstack.cloud/aws/feature-coverage/). Let's explore some services with the AWS CLI now.

### Saving objects on S3

Create a sample JSON file as follows, to save it on S3.

```json caption='sample.json'
{
	"name": "Madame Uppercut",
	"age": 39,
	"secretIdentity": "Jane Wilson",
	"powers": [
		"Million tonne punch",
		"Damage resistance",
		"Superhuman reflexes"
	]
}
```

Let's create a [bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#BasicsBucket), say `my-bucket`, as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3api create-bucket --bucket my-bucket --region us-east-1
{
	"Location": "/my-bucket"
}
```

You can list all the buckets with the following command.

```sh {4-7} prompt{1}
aws --endpoint-url http://localhost:4566 s3api list-buckets
{
	"Buckets": [
		{
			"Name": "my-bucket",
			"CreationDate": "2022-07-12T13:44:44+00:00"
		}
	],
	"Owner": {
		"DisplayName": "webfile",
		"ID": "bcaf1ffd86f41161ca5fb16fd081034f"
	}
}
```

Now, you can upload the `sample.json` file on the new bucket.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 cp sample.json s3://my-bucket/inner/sample.json --content-type 'application/json'
upload: ./sample.json to s3://my-bucket/inner/sample.json
```

You can download the existing file from the S3 bucket as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 cp s3://my-bucket/inner/sample.json sample2.json --content-type 'application/json'
download: s3://my-bucket/inner/sample.json to ./sample2.json
```

To delete the file, you can use the following command.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 rm s3://my-bucket/inner/sample.json
delete: s3://my-bucket/inner/sample.json
```

Finally, you can delete the bucket as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3api delete-bucket --bucket my-bucket
```

Refer to the [s3](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html) and [s3api](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) docs for more operations to try with LocalStack.

### Publishing events with SQS

You can use the following command to create a queue called `my-queue`.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 sqs create-queue --queue-name my-queue
{
	"QueueUrl": "http://localhost:4566/000000000000/my-queue"
}
```

To verify if the queue is available, list all the queues as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 sqs list-queues
{
	"QueueUrls": [
		"http://localhost:4566/000000000000/my-queue"
	]
}
```

Let's publish a message using the `send-message` command.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 sqs send-message --queue-url http://localhost:4566/000000000000/my-queue --message-body "Gwen"
{
	"MD5OfMessageBody": "030997f386c4663f2c3e9594308c60b4",
	"MessageId": "8c6257d2-84c8-4689-a6a1-1a37b1faa3ec"
}
```
You can read the published messages through the `receive-message` command.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 sqs receive-message --queue-url http://localhost:4566/000000000000/my-queue
{
	"Messages": [
		{
			"MessageId": "8c6257d2-84c8-4689-a6a1-1a37b1faa3ec",
			"ReceiptHandle": "ZDYzMmRjMmUtNWY2Yi00NzRmLWI1ZjQtYTYwNGJiZGRkMGFjIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6bXktcXVldWUgOGM2MjU3ZDItODRjOC00Njg5LWE2YTEtMWEzN2IxZmFhM2VjIDE2NTc2MzQwMDIuNzE3MDIyNA==",
			"MD5OfBody": "030997f386c4663f2c3e9594308c60b4",
			"Body": "Gwen"
		}
	]
}
```

Finally, to delete a message, you can use the `delete-message` command as follows. To delete the queue, use the `delete-queue` command.

```sh prompt{1,3}
aws --endpoint-url http://localhost:4566 sqs delete-message --queue-url http://localhost:4566/000000000000/my-queue --receipt-handle ZDYzMmRjMmUtNWY2Yi00NzRmLWI1ZjQtYTYwNGJiZGRkMGFjIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6bXktcXVldWUgOGM2MjU3ZDItODRjOC00Njg5LWE2YTEtMWEzN2IxZmFhM2VjIDE2NTc2MzQwMDIuNzE3MDIyNA==

aws --endpoint-url http://localhost:4566 sqs delete-queue --queue-url http://localhost:4566/000000000000/my-queue
```

For more operations, refer to the [sqs](https://docs.aws.amazon.com/cli/latest/reference/sqs/index.html) docs.

### Creating secrets with SecretsManager

To create a secret, you can use the `create-secret` command as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 secretsmanager create-secret --name my-secret --secret-string '{"PG_PASSWORD":"stacy"}'
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:my-secret-b3dd81",
	"Name": "my-secret",
	"VersionId": "33395f3b-6f75-4c48-9424-33c730538063"
}
```

You can also list all the secrets available on the Secrets Manager.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 secretsmanager list-secrets
{
	"SecretList": [
		{
			"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:my-secret-b3dd81",
			"Name": "my-secret",
			"LastChangedDate": "2022-07-12T19:27:05.440032+05:30",
			"Tags": [],
			"SecretVersionsToStages": {
				"33395f3b-6f75-4c48-9424-33c730538063": [
					"AWSCURRENT"
				]
			},
			"CreatedDate": "2022-07-12T19:27:05.440032+05:30"
		}
	]
}
```

You can read the secrets with the `get-secret-value` command

```sh prompt{1}
aws --endpoint-url http://localhost:4566 secretsmanager get-secret-value --secret-id my-secret
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:my-secret-b3dd81",
	"Name": "my-secret",
	"VersionId": "33395f3b-6f75-4c48-9424-33c730538063",
	"SecretString": "{\"PG_PASSWORD\":\"stacy\"}",
	"VersionStages": [
		"AWSCURRENT"
	],
	"CreatedDate": "2022-07-12T19:27:05.440032+05:30"
}
```

Finally, you can delete a secret with its ARN.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 secretsmanager delete-secret --secret-id arn:aws:secretsmanager:us-east-1:000000000000:secret:my-secret-b3dd81
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:my-secret-b3dd81",
	"Name": "my-secret",
	"DeletionDate": "2022-08-11T19:29:39.904093+05:30"
}
```

For more operations, refer to the [secretsmanager](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/index.html) docs.

## Conclusion

- LocalStack works pretty nicely with command line tools. If you need a desktop app, you can try out [Commandeer](https://getcommandeer.com/), or LocalStack subscriptions which offer a Web UI.
- Support for some [AWS services](https://docs.localstack.cloud/user-guide/aws/feature-coverage/) (such as ElastiCache, ECS, EKS, etc) requires a subscription.

---

**Source code**

- [localstack-introduction](https://github.com/Microflash/guides/tree/main/cloud/localstack-introduction)

**Related**

- [LocalStack docs](https://docs.localstack.cloud/overview/)
- [Locker at Docker Hub](https://hub.docker.com/r/localstack/localstack)
- [AWS Command Line Interface Documentation](https://docs.aws.amazon.com/cli/index.html)
