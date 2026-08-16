---
slug: "post/2026/06/07/how-to-use-aws-cli-with-floci-for-local-development"
title: "How to use AWS CLI with Floci for local development"
date: 2026-06-07 15:47:57
update: 2026-08-16 17:52:17
category: "guide"
---

Testing against real AWS services often feels like a chore. We have to juggle account configurations, suffer the network latency tax, and dodge state collisions with team members. And let's not forget about the constant paranoia of surprise cloud bills. It often kills the fast feedback loop we need to build good software.

So, how do we get around this? We bring AWS to `localhost` using [Floci](https://github.com/floci-io/floci). It is an open-source local AWS emulator which plays nice with the AWS CLI and other AWS tooling. It lets us work without a real cloud environment, or a credit card. Let's spin it up with Docker and use it with AWS CLI to explore S3, SQS, and Secrets Manager.

:::assert{title="Series"}
1. *How to use AWS CLI with Floci for local development*
2. [How to run SQS-triggered Lambda locally with Floci](/post/2026/08/16/how-to-run-sqs-triggered-lambda-locally-with-floci/)
:::

:::note{title="Environment"}
- Docker 29.4.0
- AWS CLI 2.36.24
- Floci 1.6.0
:::

## Configure AWS credentials

AWS CLI requires credentials and sometimes a region for authenticated operations to manage AWS resources. A neat way to provide these details is through a dedicated AWS profile. Since Floci is an emulator, you can put dummy nonempty values for *AWS Access Key ID* and *AWS Secret Access Key*.

```sh title="Configure an AWS profile" prompt{1} output{2..5}
aws configure --profile floci
AWS Access Key ID [None]: gwen
AWS Secret Access Key [None]: stacy
Default region name [None]: us-east-1
Default output format [None]: json
```

You can omit `--profile floci` flag, in which case these configurations save directly to your default profile. However, it is a good practice to use a dedicated profile to isolate Floci-specific configuration.

This command creates two files, `credentials` and `config`, at `~/.aws` (on macOS and Linux) or `%USERPROFILE%/.aws` (on Windows). The `credentials` file stores the AWS Access Key ID and AWS Secret Access Key while the `config` file stores the Default region name and Default output format you've just entered.

## Launch the Floci container

You can run Floci as a container through `docker compose up -d` command using the following Compose file.

```yaml title="compose.yml"
services:
  aws:
    container_name: floci-with-aws-cli
    image: floci/floci:1.6.0
    ports:
      - "4566:4566"
    volumes:
      - "./data:/app/data"
```

Once the container is up, you can hit the healthcheck endpoint to list the available services ready for our use.

```sh title="Healthcheck for Floci container" prompt{1} output{2..62}
curl -s http://localhost:4566/_floci/health
{
	"version": "1.6.0",
	"original_edition": "floci-always-free",
	"edition": "community",
	"services": {
		# list of available AWS services
	}
}
```

## Working with AWS services

With Floci up and running on port 4566, let's explore some of the AWS services using AWS CLI.

### Storing and retrieving S3 objects

Create an `apod.json` file with the following content:

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

Let's create a [bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#BasicsBucket), which we'll call `local-bucket`, using the following command:

```sh prompt{1} output{2..4}
aws --endpoint-url http://localhost:4566 --profile floci s3api create-bucket --bucket local-bucket
{
	"Location": "/local-bucket"
}
```

You can list all the buckets with the following command:

```sh {4..7} prompt{1} output{2..14}
aws --endpoint-url http://localhost:4566 --profile floci s3api list-buckets
{
	"Buckets": [
		{
			"Name": "local-bucket",
			"CreationDate": "2026-08-16T12:10:54+00:00"
		}
	],
	"Owner": {
		"DisplayName": "owner",
		"ID": "owner"
	},
	"Prefix": null
}
```

Now, you can upload the `apod.json` file to the new bucket:

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 --profile floci s3 cp apod.json s3://local-bucket/inner/apod.json --content-type 'application/json'
upload: ./apod.json to s3://local-bucket/inner/apod.json
```

To download the file back from the bucket:

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 --profile floci s3 cp s3://local-bucket/inner/apod.json apod2.json
download: s3://local-bucket/inner/apod.json to ./apod2.json
```

To delete the file, use the following command:

```sh prompt{1} output{2}
aws --endpoint-url http://localhost:4566 --profile floci s3 rm s3://local-bucket/inner/apod.json
delete: s3://local-bucket/inner/apod.json
```

Finally, you can delete the bucket itself:

```sh prompt{1}
aws --endpoint-url http://localhost:4566 --profile floci s3api delete-bucket --bucket local-bucket
```

Check the [s3](https://docs.aws.amazon.com/cli/latest/reference/s3/) and [s3api](https://docs.aws.amazon.com/cli/latest/reference/s3api/) docs for more operations to try.

:::commend{title="Set global endpoint for all AWS services"}
To avoid typing `--endpoint-url http://localhost:4566` for every single command, open `~/.aws/config` file (or `%USERPROFILE%/.aws/config` on Windows) and update your profile:

```ini {4,5}
[profile floci]
region = us-east-1
output = json
ignore_configure_endpoint_urls = true
endpoint_url = http://localhost:4566
```

The `ignore_configure_endpoint_urls` flag tells the AWS CLI to ignore the official endpoint URLs, while the `endpoint_url` explicitly routes all commands to Floci. Once this is set, you can append `--profile floci` to your AWS CLI commands, and they will automatically use `http://localhost:4566` as the endpoint.

Alternatively, you can skip the config file and set these environment variables in your current shell session:

```sh
export AWS_IGNORE_CONFIGURED_ENDPOINT_URLS=true
export AWS_ENDPOINT_URL=http://localhost:4566
```

Or, just create an alias:

```sh
alias awslocal = aws --endpoint-url http://localhost:4566 --profile floci
```

I'll be using the `awslocal` alias for the subsequent examples.
:::

### Publishing and consuming SQS messages

You can use the following command to create a queue called `local-queue`:

```sh prompt{1} output{2..4}
awslocal sqs create-queue --queue-name local-queue
{
	"QueueUrl": "http://localhost:4566/000000000000/local-queue"
}
```

To verify if the queue is available, list all the queues as follows:

```sh prompt{1} output{2..6}
awslocal sqs list-queues
{
	"QueueUrls": [
		"http://localhost:4566/000000000000/local-queue"
	]
}
```

Let's publish a message using the `send-message` command:

```sh prompt{1} output{2..5}
awslocal sqs send-message --queue-url http://localhost:4566/000000000000/local-queue --message-body "Gwen"
{
	"MD5OfMessageBody": "030997f386c4663f2c3e9594308c60b4",
	"MessageId": "8adb0f5f-80b8-47e5-a082-ead8ddfa5d78"
}
```
You can read the published messages through the `receive-message` command:

```sh prompt{1} output{2..11}
awslocal sqs receive-message --queue-url http://localhost:4566/000000000000/local-queue
{
	"Messages": [
		{
			"MessageId": "8adb0f5f-80b8-47e5-a082-ead8ddfa5d78",
			"ReceiptHandle": "eb2b5c02-ba73-44e6-8def-edff0f154b97",
			"MD5OfBody": "030997f386c4663f2c3e9594308c60b4",
			"Body": "Gwen"
		}
	]
}
```

Finally, to delete a message, you can use the `delete-message` command as follows. To delete the queue entirely, use the `delete-queue` command:

```sh prompt{1,3}
awslocal sqs delete-message --queue-url http://localhost:4566/000000000000/local-queue --receipt-handle eb2b5c02-ba73-44e6-8def-edff0f154b97

awslocal sqs delete-queue --queue-url http://localhost:4566/000000000000/local-queue
```

For more operations, check the [sqs](https://docs.aws.amazon.com/cli/latest/reference/sqs/) docs.

### Creating and reading secrets

To create a secret, use the `create-secret` command as follows:

```sh prompt{1} output{2..6}
awslocal secretsmanager create-secret --name local-secret --secret-string '{"PASSWORD":"stacy"}'
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:local-secret-N52O72",
	"Name": "local-secret",
	"VersionId": "b4cc76aa-80d1-49fc-842b-0031f59919b4"
}
```

You can also list all the secrets currently available in Secrets Manager:

```sh prompt{1} output{2..14}
awslocal secretsmanager list-secrets
{
	"SecretList": [
		{
			"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:local-secret-N52O72",
			"Name": "local-secret",
			"RotationEnabled": false,
			"LastChangedDate": "2026-08-16T17:46:30.628000+05:30",
			"Tags": [],
			"CreatedDate": "2026-08-16T17:46:30.628000+05:30"
		}
	]
}
```

To read the secret's value, use the `get-secret-value` command:

```sh prompt{1} output{2..9}
awslocal secretsmanager get-secret-value --secret-id local-secret
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:local-secret-N52O72",
	"Name": "local-secret",
	"VersionId": "b4cc76aa-80d1-49fc-842b-0031f59919b4",
	"SecretString": "{\"PASSWORD\":\"stacy\"}",
	"VersionStages": [
		"AWSCURRENT"
	],
	"CreatedDate": "2026-08-16T17:46:30.628000+05:30"
}
```

Finally, you can delete a secret using its ARN (Amazon Resource Name):

```sh prompt{1} output{2..6}
awslocal secretsmanager delete-secret --secret-id arn:aws:secretsmanager:us-east-1:000000000000:secret:local-secret-N52O72
{
	"ARN": "arn:aws:secretsmanager:us-east-1:000000000000:secret:local-secret-N52O72",
	"Name": "local-secret",
	"DeletionDate": "2026-09-15T17:48:35.303000+05:30"
}
```

For more operations, check the [secretsmanager](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/) docs.

## Wrapping up

- Since Floci communicates using the standard AWS wire protocol, it works seamlessly not just with the AWS CLI, but with any standard AWS SDK you want to use with it.
- At the time of writing, Floci can emulate [72 AWS services](https://floci.io/floci/services/).
- If you want to spin up ephemeral environments for integration testing, Floci provides official [Testcontainers modules](https://floci.io/floci/testcontainers/) for Java, Python, JavaScript, and more.
- It also supports full per-account resource isolation, making it well-suited for testing multi-tenant configurations.

---

**Source code**

- [floci-with-aws-cli](https://github.com/naiyerasif/backstage/tree/main/aws/floci-with-aws-cli)

**Related**

- [Floci docs](https://floci.io/)
- [Floci on Docker Hub](https://hub.docker.com/r/floci/floci)
- [AWS Command Line Interface Documentation](https://docs.aws.amazon.com/cli/)
