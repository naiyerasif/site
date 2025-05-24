---
slug: "2021/11/16/working-with-aws-on-local-using-localstack"
title: "Working with AWS on local using LocalStack"
description: "Developing with AWS can be challenging on a local machine. With LocalStack, you can prototype with AWS services without connecting to the actual AWS environment."
date: 2021-11-16 09:12:12
update: 2025-05-24 17:05:24
type: "guide"
---

If your organization has strict policies on cloud resources, prototyping with the AWS services can become a hassle. [LocalStack](https://localstack.cloud/) is a cloud emulation layer that runs offline in a container on your local machine. Using LocalStack, you can run AWS services without connecting to the actual AWS environment. You can use the familiar tools like the official AWS CLI and AWS SDK to interact with LocalStack seamlessly. In this post, we'll setup LocalStack and use it with the AWS CLI.

:::assert{title="Series"}
1. *Working with AWS on local using LocalStack*
2. [Using LocalStack for AWS Lambda with SQS trigger](/post/2024/02/11/using-localstack-for-aws-lambda-with-sqs-trigger/)
3. [Using LocalStack for AWS Lambda with SNS trigger](/post/2024/03/03/using-localstack-for-aws-lambda-with-sns-trigger/)
4. [Using LocalStack for AWS Lambda with EventBridge rule trigger](/post/2024/08/11/using-localstack-for-aws-lambda-with-eventbridge-rule-trigger/)
:::

:::note{.setup}
The examples in this post use

- Docker 27.5.1
- AWS CLI 2.27.19
- LocalStack 4.4.0
:::

## Configure a local AWS account

LocalStack works with an AWS account which you can configure with the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Launch the `aws configure` command as follows.

```sh title="Configuring the AWS account" prompt{1} output{2..5}
aws configure --profile localstack
AWS Access Key ID [None]: gwen
AWS Secret Access Key [None]: stacy
Default region name [None]: us-east-1
Default output format [None]: json
```

:::note
You can put fake _AWS Access Key ID_ and _AWS Secret Access Key_ here. Although LocalStack requires an AWS account configured, it doesn't validate them.
:::

The preceding command creates two files, `credentials` and `config`, at `~/.aws` (on macOS and Linux) or `%USERPROFILE%/.aws` (on Windows). The `credentials` file stores the AWS Access Key ID and AWS Secret Access Key while the `config` file stores the Default region name and Default output format you've just entered.

> You can omit `--profile localstack` in which case the credentials would be saved under the `default` profile. I prefer a dedicated profile to avoid repeating configurations while using AWS CLI with LocalStack.

## Launching the LocalStack container

Create a [Compose file](https://docs.docker.com/compose/compose-file/) as follows.

```yaml title="compose.yml"
services:
  localstack:
    container_name: localstack-with-aws-cli
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

You can now launch the container with the following command.

```sh prompt{1}
docker compose up -d
```

Once the container is up and running, open a terminal and ping the healthcheck endpoint `localhost:4566/_localstack/health`. If things are working, you would see the status of the available services as `available`.

```sh title="Healthcheck for LocalStack container" prompt{1} output{2..42}
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
	"version": "4.4.0"
}
```

## Working with AWS services

You can now use the AWS services (such as S3, SNS (Simple Notification Service), SQS (Simple Queue Service), Secrets Manager, etc) through the port 4566. LocalStack supports a range of AWS services &mdash; see the full list [here](https://docs.localstack.cloud/user-guide/aws/feature-coverage/). Let's explore some services with the AWS CLI now.

### Saving objects on S3

Create a sample JSON file as follows, to save it on S3.

```json title="apod.json"
{
	"copyright": "Panther Observatory",
	"date": "2006-04-15",
	"explanation": "In this stunning cosmic vista, galaxy M81 is on the left surrounded by blue spiral arms.  On the right marked by massive gas and dust clouds, is M82.  These two mammoth galaxies have been locked in gravitational combat for the past billion years.   The gravity from each galaxy dramatically affects the other during each hundred million-year pass.  Last go-round, M82's gravity likely raised density waves rippling around M81, resulting in the richness of M81's spiral arms.  But M81 left M82 with violent star forming regions and colliding gas clouds so energetic the galaxy glows in X-rays.  In a few billion years only one galaxy will remain.",
	"hdurl": "https://apod.nasa.gov/apod/image/0604/M81_M82_schedler_c80.jpg",
	"media_type": "image",
	"service_version": "v1",
	"title": "Galaxy Wars: M81 versus M82",
	"url": "https://apod.nasa.gov/apod/image/0604/M81_M82_schedler_c25.jpg"
}
```

Let's create a [bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#BasicsBucket), say `example-bucket`, as follows.

```sh prompt{1} output{2..4}
aws --endpoint-url http://localhost:4566 s3api create-bucket --bucket example-bucket
{
	"Location": "/example-bucket"
}
```

You can list all the buckets with the following command.

```sh {4..7} prompt{1} output{2..13}
aws --endpoint-url http://localhost:4566 s3api list-buckets
{
	"Buckets": [
		{
			"Name": "example-bucket",
			"CreationDate": "2025-05-24T10:58:21+00:00"
		}
	],
	"Owner": {
		"DisplayName": "webfile",
		"ID": "75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a"
	}
}
```

Now, you can upload the `apod.json` file on the new bucket.

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 s3 cp apod.json s3://example-bucket/inner/apod.json --content-type 'application/json'
upload: ./apod.json to s3://example-bucket/inner/apod.json
```

You can download the existing file from the S3 bucket as follows.

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 s3 cp s3://example-bucket/inner/apod.json apod2.json
download: s3://example-bucket/inner/apod.json to ./apod2.json
```

To delete the file, you can use the following command.

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 s3 rm s3://example-bucket/inner/apod.json
delete: s3://example-bucket/inner/apod.json
```

Finally, you can delete the bucket as follows.

```sh prompt{1}
aws --endpoint-url http://localhost:4566 s3api delete-bucket --bucket example-bucket
```

Check the [s3](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html) and [s3api](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3api/index.html) docs for more operations to try.

:::commend{title="Tip"}
If you don't want to pass `--endpoint-url http://localhost:4566` to AWS CLI repeatedly, open `~/.aws/config` file (`%USERPROFILE%/.aws/config` if you're on Windows) in a text editor and change it as follows.

```ini {4,5}
[profile localstack]
region = us-east-1
output = json
ignore_configure_endpoint_urls = true
endpoint_url = http://localhost:4566
```

The `ignore_configure_endpoint_urls` flag configures the AWS CLI to ignore the official endpoint URLs, and the `endpoint_url` sets LocalStack's endpoint URL. After this configuration, you can use AWS CLI commands with `--profile localstack` and it will use `http://localhost:4566` as the endpoint URL.
:::

### Publishing messages with SQS

You can use the following command to create a queue called `example-queue`.

```sh prompt{1} output{2..4}
aws --profile localstack sqs create-queue --queue-name example-queue
{
	"QueueUrl": "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue"
}
```

To verify if the queue is available, list all the queues as follows.

```sh prompt{1} output{2..6}
aws --profile localstack sqs list-queues
{
	"QueueUrls": [
		"http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue"
	]
}
```

Let's publish a message using the `send-message` command.

```sh prompt{1} output{2..5}
aws --profile localstack sqs send-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue --message-body "Gwen"
{
	"MD5OfMessageBody": "030997f386c4663f2c3e9594308c60b4",
	"MessageId": "0a0a23c9-1e13-4072-aad6-fb2e87f9ec54"
}
```
You can read the published messages through the `receive-message` command.

```sh prompt{1} output{2..11}
aws --profile localstack sqs receive-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue
{
	"Messages": [
		{
			"MessageId": "0a0a23c9-1e13-4072-aad6-fb2e87f9ec54",
			"ReceiptHandle": "NjBlZGI4MmQtNDVhOC00YTQ0LWE1N2ItNWZmZWUyYzI3OTIzIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZXhhbXBsZS1xdWV1ZSAwYTBhMjNjOS0xZTEzLTQwNzItYWFkNi1mYjJlODdmOWVjNTQgMTc0ODA4NTE5OS4yODc0NjQx",
			"MD5OfBody": "030997f386c4663f2c3e9594308c60b4",
			"Body": "Gwen"
		}
	]
}
```

Finally, to delete a message, you can use the `delete-message` command as follows. To delete the queue, use the `delete-queue` command.

```sh prompt{1,3}
aws --profile localstack sqs delete-message --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue --receipt-handle NjBlZGI4MmQtNDVhOC00YTQ0LWE1N2ItNWZmZWUyYzI3OTIzIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZXhhbXBsZS1xdWV1ZSAwYTBhMjNjOS0xZTEzLTQwNzItYWFkNi1mYjJlODdmOWVjNTQgMTc0ODA4NTE5OS4yODc0NjQx

aws --profile localstack sqs delete-queue --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/example-queue
```

For more operations, check the [sqs](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sqs/index.html) docs.

### Creating secrets with SecretsManager

To create a secret, you can use the `create-secret` command as follows.

```sh prompt{1} output{2..6}
aws --profile localstack secretsmanager create-secret --name example-secret --secret-string '{"PG_PASSWORD":"stacy"}'
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-eVflrW",
	"Name": "example-secret",
	"VersionId": "758a6902-e973-4da1-9a87-dabb2ba2415d"
}
```

You can also list all the secrets available on the Secrets Manager.

```sh prompt{1} output{2..14}
aws --profile localstack secretsmanager list-secrets
{
	"SecretList": [
		{
			"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-eVflrW",
			"Name": "example-secret",
			"LastChangedDate": "2025-05-24T16:48:08.871645+05:30",
			"SecretVersionsToStages": {
				"758a6902-e973-4da1-9a87-dabb2ba2415d": ["AWSCURRENT"]
			},
			"CreatedDate": "2025-05-24T16:48:08.871645+05:30"
		}
	]
}
```

You can read the secrets with the `get-secret-value` command

```sh prompt{1} output{2..9}
aws --profile localstack secretsmanager get-secret-value --secret-id example-secret
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-eVflrW",
	"Name": "example-secret",
	"VersionId": "758a6902-e973-4da1-9a87-dabb2ba2415d",
	"SecretString": "{\"PG_PASSWORD\":\"stacy\"}",
	"VersionStages": ["AWSCURRENT"],
	"CreatedDate": "2025-05-24T16:48:08+05:30"
}
```

Finally, you can delete a secret with its ARN (Amazon Resource Name).

```sh prompt{1} output{2..6}
aws --profile localstack secretsmanager delete-secret --secret-id arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-eVflrW
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:example-secret-eVflrW",
	"Name": "example-secret",
	"DeletionDate": "2025-06-23T16:52:36.897494+05:30"
}
```

For more operations, check the [secretsmanager](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/secretsmanager/index.html) docs.

## Outro

- LocalStack works well with command line tools. If you need a desktop app, you can try out [Commandeer](https://getcommandeer.com/), [LocalStack Desktop](https://docs.localstack.cloud/user-guide/tools/localstack-desktop/), or [LocalStack Docker Desktop extension](https://hub.docker.com/extensions/localstack/localstack-docker-desktop).
- Support for some [AWS services](https://docs.localstack.cloud/user-guide/aws/feature-coverage/) (such as ECS (Elastic Container Service), ElastiCache, RDS (Relational Database Service), X-Ray, and so on) requires a subscription.

---

**Source code**

- [localstack-with-aws-cli](https://github.com/Microflash/guides/tree/main/aws/localstack-with-aws-cli)

**Related**

- [LocalStack docs](https://docs.localstack.cloud/overview/)
- [LocalStack on Docker Hub](https://hub.docker.com/r/localstack/localstack)
- [AWS Command Line Interface Documentation](https://docs.aws.amazon.com/cli/)
