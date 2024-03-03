---
slug: "2021/11/16/working-with-aws-on-local-using-localstack"
title: "Working with AWS on local using LocalStack"
description: "Developing with AWS can be challenging on a local machine. With LocalStack, you can prototype with AWS services without connecting to the actual AWS environment."
date: 2021-11-16 09:12:12
update: 2024-02-10 21:40:36
category: "guide"
---

Developing with AWS comes with its own set of challenges. If your organization has strict policies on cloud resources, prototyping with the AWS services can become a hassle. [LocalStack](https://localstack.cloud/) is a cloud emulation layer that runs offline in a container on your local machine. Using LocalStack, you can run AWS services without connecting to the actual AWS environment. You can use the familiar tools like the official AWS CLI and AWS SDK to interact with LocalStack seamlessly. In this guide, I'll talk about how to setup LocalStack and use it with the AWS CLI.

:::assert{title=Series}
1. *Working with AWS on local using LocalStack*
2. [Using LocalStack for AWS Lambda with SQS trigger](/post/2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger/)
3. [Using LocalStack for AWS Lambda with SNS trigger](/post/2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger/)
:::

:::setup
The examples in this post use

- Docker 25.0.2
- AWS CLI 2.15.18
- LocalStack 3
:::

## Configure a local AWS account

LocalStack works with a local AWS account which you can configure with the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Launch the `aws configure` command as follows.

```sh caption='Configuring the AWS account' prompt{1}
aws configure --profile localstack
AWS Access Key ID [None]: gwen
AWS Secret Access Key [None]: stacy
Default region name [None]: us-east-1
Default output format [None]: json
```

> You can put fake _AWS Access Key ID_ and _AWS Secret Access Key_ here. Although LocalStack requires an AWS account configured, it doesn't validate them.

The preceding command creates two files, `credentials` and `config`, at `~/.aws` (on macOS and Linux) or `%USERPROFILE%/.aws` (on Windows). The `credentials` file stores the AWS Access Key ID and AWS Secret Access Key while the `config` file stores the Default region name and Default output format you've just entered.

> You can omit `--profile localstack` in which case the credentials would be saved under the `default` profile. I prefer a dedicated profile to avoid repeating configurations while using AWS CLI with LocalStack.

## Launching the LocalStack container

Create a [Compose file](https://docs.docker.com/compose/compose-file/) as follows.

```yaml caption='compose.yml'
services:
  localstack:
    container_name: localstack-with-aws-cli
    image: localstack/localstack:3
    ports:
      - "4566:4566"
    environment:
      - DEBUG=${DEBUG:-0}
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
```

You can now launch the container with the following command.

```sh prompt{1}
docker compose up -d
```

Once the container is up and running, open a terminal and ping the healthcheck endpoint. If things are working, you would see the status of the available services as "available".

```sh prompt{1} caption='Healthcheck for LocalStack container'
curl http://localhost:4566/_localstack/health
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
		"scheduler": "available",
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
	"edition": "community",
	"version": "3.1.0"
}
```

## Working with AWS services

You can now use the AWS services (such as S3, <abbr title="Simple Notification Service">SNS</abbr>, <abbr title="Simple Queue Service">SQS</abbr>, Secrets Manager, etc) through the port 4566. You can find the list of the core AWS services available on LocalStack [here](https://docs.localstack.cloud/user-guide/aws/feature-coverage/). Let's explore some services with the AWS CLI now.

### Saving objects on S3

Create a sample JSON file as follows, to save it on S3.

```json caption='sample.json'
{
	"key": "contributor_covenant",
	"name": "Contributor Covenant",
	"url": "https://api.github.com/codes_of_conduct/contributor_covenant",
	"html_url": "https://www.contributor-covenant.org/version/2/0/code_of_conduct/"
}
```

Let's create a [bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#BasicsBucket), say `example-bucket`, as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3api create-bucket --bucket example-bucket
{
	"Location": "/example-bucket"
}
```

You can list all the buckets with the following command.

```sh {4-7} prompt{1}
aws --endpoint-url http://localhost:4566 s3api list-buckets
{
	"Buckets": [
		{
			"Name": "example-bucket",
			"CreationDate": "2024-02-10T14:58:19+00:00"
		}
	],
	"Owner": {
		"DisplayName": "webfile",
		"ID": "75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a"
	}
}
```

Now, you can upload the `sample.json` file on the new bucket.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 cp sample.json s3://example-bucket/inner/sample.json --content-type 'application/json'
upload: ./sample.json to s3://example-bucket/inner/sample.json
```

You can download the existing file from the S3 bucket as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 cp s3://example-bucket/inner/sample.json sample2.json --content-type 'application/json'
download: s3://example-bucket/inner/sample.json to ./sample2.json
```

To delete the file, you can use the following command.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3 rm s3://example-bucket/inner/sample.json
delete: s3://example-bucket/inner/sample.json
```

Finally, you can delete the bucket as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3api delete-bucket --bucket example-bucket
```

Refer to the [s3](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html) and [s3api](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3api/index.html) docs for more operations to try with LocalStack.

:::commend{title="Tip"}
If you don't want to pass `--endpoint-url http://localhost:4566` to AWS CLI repeatedly, open `~/.aws/config` file (`%USERPROFILE%/.aws/config` if you're on Windows) in a text editor and change it as follows.

```ini {4,5}
[profile localstack]
region = us-east-1
output = json
ignore_configure_endpoint_urls = true
endpoint_url = http://localhost:4566
```

The `ignore_configure_endpoint_urls` flag configures the AWS CLI to ignore the official endpoint URLs, and the `endpoint_url` sets LocalStack's endpoint URL. After this configuration, you can invoke AWS CLI with `--profile localstack` and it'll automatically pick up `http://localhost:4566` as the endpoint URL.
:::

### Publishing messages with SQS

You can use the following command to create a queue called `example-queue`.

```sh prompt{1}
aws --profile localstack sqs create-queue --queue-name example-queue
{
	"QueueUrl": "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue"
}
```

To verify if the queue is available, list all the queues as follows.

```sh prompt{1}
aws --profile localstack sqs list-queues
{
	"QueueUrls": [
		"http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue"
	]
}
```

Let's publish a message using the `send-message` command.

```sh prompt{1}
aws --profile localstack sqs send-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue --message-body "Gwen"
{
	"MD5OfMessageBody": "030997f386c4663f2c3e9594308c60b4",
	"MessageId": "5210a0a7-f94c-477b-9724-a105c0db1922"
}
```
You can read the published messages through the `receive-message` command.

```sh prompt{1}
aws --profile localstack sqs receive-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue
{
	"Messages": [
		{
			"MessageId": "5210a0a7-f94c-477b-9724-a105c0db1922",
			"ReceiptHandle": "ODExZmU4NTMtZjYwNy00MjFjLTg1YTEtYTUyN2Q1Nzk2YWE4IGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZXhhbXBsZS1xdWV1ZSA1MjEwYTBhNy1mOTRjLTQ3N2ItOTcyNC1hMTA1YzBkYjE5MjIgMTcwNzU3OTE0Ni4yMTU0MjY=",
			"MD5OfBody": "030997f386c4663f2c3e9594308c60b4",
			"Body": "Gwen"
		}
	]
}
```

Finally, to delete a message, you can use the `delete-message` command as follows. To delete the queue, use the `delete-queue` command.

```sh prompt{1,3}
aws --profile localstack sqs delete-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue --receipt-handle ODExZmU4NTMtZjYwNy00MjFjLTg1YTEtYTUyN2Q1Nzk2YWE4IGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZXhhbXBsZS1xdWV1ZSA1MjEwYTBhNy1mOTRjLTQ3N2ItOTcyNC1hMTA1YzBkYjE5MjIgMTcwNzU3OTE0Ni4yMTU0MjY=

aws --profile localstack sqs delete-queue --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue
```

For more operations, refer to the [sqs](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sqs/index.html) docs.

### Creating secrets with SecretsManager

To create a secret, you can use the `create-secret` command as follows.

```sh prompt{1}
aws --profile localstack secretsmanager create-secret --name example-secret --secret-string '{"PG_PASSWORD":"stacy"}'
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-SfIEUp",
	"Name": "example-secret",
	"VersionId": "7484bffb-e295-423f-8db6-eb484f392ab5"
}
```

You can also list all the secrets available on the Secrets Manager.

```sh prompt{1}
aws --profile localstack secretsmanager list-secrets
{
	"SecretList": [
		{
			"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-SfIEUp",
			"Name": "example-secret",
			"LastChangedDate": "2024-02-10T21:07:51.489199+05:30",
			"SecretVersionsToStages": {
				"7484bffb-e295-423f-8db6-eb484f392ab5": [
					"AWSCURRENT"
				]
			},
			"CreatedDate": "2024-02-10T21:07:51.489199+05:30"
		}
	]
}
```

You can read the secrets with the `get-secret-value` command

```sh prompt{1}
aws --profile localstack secretsmanager get-secret-value --secret-id example-secret
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-SfIEUp",
	"Name": "example-secret",
	"VersionId": "7484bffb-e295-423f-8db6-eb484f392ab5",
	"SecretString": "{\"PG_PASSWORD\":\"stacy\"}",
	"VersionStages": [
		"AWSCURRENT"
	],
	"CreatedDate": "2024-02-10T21:07:51+05:30"
}
```

Finally, you can delete a secret with its <abbr title="Amazon Resource Name">ARN</abbr>.

```sh prompt{1}
aws --profile localstack secretsmanager delete-secret --secret-id arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-SfIEUp
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-SfIEUp",
	"Name": "example-secret",
	"DeletionDate": "2024-03-11T21:09:59.118999+05:30"
}
```

For more operations, refer to the [secretsmanager](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/secretsmanager/index.html) docs.

## Conclusion

- LocalStack works pretty nicely with command line tools. If you need a desktop app, you can try out [Commandeer](https://getcommandeer.com/), or LocalStack's [Resource Browser](https://docs.localstack.cloud/user-guide/web-application/resource-browser/).
- Support for some [AWS services](https://docs.localstack.cloud/user-guide/aws/feature-coverage/) (such as Autoscaling, <abbr title="Elastic Container Service">ECS</abbr>, ElastiCache, <abbr title="Relational Database Service">RDS</abbr>, X-Ray, etc) requires a subscription.

---

**Source code**

- [localstack-with-aws-cli](https://github.com/Microflash/guides/tree/main/aws/localstack-with-aws-cli)

**Related**

- [LocalStack docs](https://docs.localstack.cloud/overview/)
- [LocalStack on Docker Hub](https://hub.docker.com/r/localstack/localstack)
- [AWS Command Line Interface Documentation](https://docs.aws.amazon.com/cli/)
