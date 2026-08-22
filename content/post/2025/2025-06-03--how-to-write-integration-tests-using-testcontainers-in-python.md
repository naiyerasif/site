---
slug: "post/2025/06/03/how-to-write-integration-tests-using-testcontainers-in-python"
title: "How to write integration tests using Testcontainers in Python"
date: 2025-06-03 21:48:03
update: 2026-08-22 17:00:59
category: "guide"
---

When your application uses external components such as databases or cloud services, it's important to test how everything works together. That's where integration tests come in. They help ensure your application behaves as expected in an environment that resembles production. [Testcontainers](https://testcontainers.com/) is a popular library that spins up real dependencies using Docker to run your tests. Let's write a small application that uses [S3](https://aws.amazon.com/s3/) and Postgres, and explore how to test it using Testcontainers.

:::note{title="Environment"}
- Python 3.14
- Docker 29.4.0
- Floci 1.7.0
- Postgres 18
- uv 0.12.5
:::

## Writing the application to test

We'll write an application that retrieves a file location from a database table, downloads the file from S3, and reads its content. For simplicity, we'll assume the files are plain text that we can read as strings.

Let's start by setting up a project using the following `pyproject.toml` file.

```toml title="pyproject.toml"
[project]
name = "testcontainers-integration-tests-with-pytest"
version = "0.0.2"
description = "Integration tests using testcontainers and pytest"
readme = "README.md"
requires-python = ">=3.14"
dependencies = [
    "boto3>=1.43.78",
    "psycopg[binary]>=3.3.4",
    "pydantic-settings>=2.15.0",
]

[dependency-groups]
dev = [
    "pytest>=9.1.1",
    "testcontainers-floci>=0.1.1",
    "testcontainers[postgres]>=4.15.0",
]
```

With [uv](https://docs.astral.sh/uv/), you can run `uv sync`. It will automatically install the correct Python version (if needed), create a virtual environment, and install all dependencies.

We'll need some configuration to connect to the database and access S3. Let's write a `Configuration` utility to do this.

```python title="app/conf.py"
import json

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.aws import secretsmanager


class Configuration(BaseSettings):
    bucket_name: str | None = None
    db_url: str | None = None
    db_name: str | None = None
    db_user: str | None = None
    db_host: str | None = None
    db_port: str | None = None
    db_secret: str | None = None

    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def construct_db_url(self) -> Configuration:
        if self.db_url is None and self.db_secret is not None:
            secret = json.loads(secretsmanager.get_secret_value(SecretId=self.db_secret)["SecretString"])

            self.db_url = (
                f"dbname={self.db_name} "
                f"user={self.db_user} "
                f"password={secret['password']} "
                f"host={self.db_host} "
                f"port={self.db_port}"
            )

        return self


conf = Configuration()
```

The `BaseSettings` will automatically map the environment variables to properties. It is a good practice to securely store passwords using services such as [AWS SecretsManager](https://aws.amazon.com/secrets-manager/), [Vault](https://www.hashicorp.com/en/products/vault), and so on. We're reading the database password from SecretsManager.

We're importing the specific AWS clients using `boto3` as follows.

```python title="app/aws.py"
import boto3

s3 = boto3.client("s3")
secretsmanager = boto3.client("secretsmanager")
```

You might be wondering&mdash;why not use `boto3` directly? If we do that, we'll have to mock `boto3` in our tests. This can be tricky since `boto3` is a generic library with a large API surface. By wrapping only the clients we need in a separate module, we only have to mock `s3` and `secretsmanager`.

Now that the groundwork is in place, let's create a utility to connect to the database.

```python title="app/dbclient.py"
import atexit
from contextlib import contextmanager
from dataclasses import dataclass

from psycopg import Connection, connect

from app.conf import conf


@dataclass
class ConnectionContext:
    _connection: Connection

    def __init__(self, db_url):
        conn = connect(conninfo=db_url, autocommit=True)
        object.__setattr__(self, "_connection", conn)
        atexit.register(conn.close)

    @contextmanager
    def cursor(self):
        with self._connection.cursor() as cursor:
            yield cursor


connection = ConnectionContext(conf.db_url)
```

To safely close a [cursor](https://www.psycopg.org/psycopg3/docs/api/cursors.html) after use, we're using a context manager. To clean up gracefully, we're registering the `Connection.close` function with an exit handler so the connection is automatically closed when the application shuts down.

Now, it's time to implement the core workflow.

```python title="app/main.py"
from app.aws import s3
from app.conf import conf
from app.dbclient import connection


def download_file_as_bytes(object_key: str) -> bytes:
    response = s3.get_object(Bucket=conf.bucket_name, Key=object_key)
    return response["Body"].read()


def read_text_file(file_id: int):
    with connection.cursor() as cur:
        object_key = cur.execute("select object_key from files where id = %(id)s", {"id": file_id}).fetchone()[0]
        data = download_file_as_bytes(object_key)
        return data.decode("utf-8")
```

The `download_file_as_bytes` function fetches a file from S3 and returns its contents as a byte array. The `read_text_file` function looks up the file location in the database using a given `id` and returns its contents as a string.

## Writing the integration test

To write an integration test, we need to set up a test environment with the following requirements.

- A password stored in SecretsManager and environment variables to initialize the configuration
- A database table to store the file locations
- An S3 bucket from where the application can retrieve the files

Let's implement this setup in a fixture.

```python title="tests/test_main.py"
import json
import os

import boto3
import pytest
from floci import FlociContainer
from testcontainers.postgres import PostgresContainer

from tests.mockutils import mock_module

object_key = "/root/text.txt"
test_content = b"Hello from Testcontainers!"


def floci_client(service_name, floci_container):
    return boto3.client(
        service_name,
        endpoint_url=floci_container.get_endpoint(),
        region_name=floci_container.get_region(),
        aws_access_key_id=floci_container.get_access_key(),
        aws_secret_access_key=floci_container.get_secret_key(),
    )


@pytest.fixture(scope="module", autouse=True)
def setup():
    with (
        FlociContainer(image="floci/floci:1.7.0") as floci,
        PostgresContainer(image="postgres:18-alpine") as postgres,
        mock_module(
            "app.aws",
            s3=floci_client("s3", floci),
            secretsmanager=floci_client("secretsmanager", floci),
        ),
    ):
        os.environ["APP_BUCKET_NAME"] = "test-bucket"
        os.environ["APP_DB_NAME"] = postgres.dbname
        os.environ["APP_DB_USER"] = postgres.username
        os.environ["APP_DB_HOST"] = postgres.get_container_host_ip()
        os.environ["APP_DB_PORT"] = str(postgres.get_exposed_port(5432))
        secret_name = "db/secret"
        os.environ["APP_DB_SECRET"] = secret_name

        from app.aws import s3, secretsmanager

        secretsmanager.create_secret(
            Name=secret_name,
            SecretString=json.dumps({"password": postgres.password}),
        )

        from app.conf import conf

        s3.create_bucket(Bucket=conf.bucket_name)

        from app.dbclient import connection

        with connection.cursor() as cursor:
            cursor.execute(
                """
                create table files (
                    id int generated always as identity primary key, 
                    object_key text not null
                );
                """
            )
        yield
```

- We begin by starting [Floci](https://floci.io/) and Postgres containers using Testcontainers.
- We mock `app.aws` module so that our test uses Floci emulated AWS services, such as S3 and SecretsManager. (You can find the details about `mock_module` function in an earlier post [here](/post/2025/05/31/how-to-mock-a-module-import-in-python/).)
- Next, we set the required environment variables, some of which use the properties of the `PostgresContainer`. We also store a secret in SecretsManager to hold the database password.
- This is enough to mock the configuration, and allow us to import it.
- We also create an S3 bucket and a database table, both of which we'll use later in our test.

We've annotated `setup` function with `@pytest.fixture(scope="module", autouse=True)`, so that tests in `test_main` module can use it automatically.

Now, let's write the test.

```python title="tests/test_main.py" ins{69..86}
import json
import os

import boto3
import pytest
from floci import FlociContainer
from testcontainers.postgres import PostgresContainer

from tests.mockutils import mock_module

object_key = "/root/text.txt"
test_content = b"Hello from Testcontainers!"


def floci_client(service_name, floci_container):
    return boto3.client(
        service_name,
        endpoint_url=floci_container.get_endpoint(),
        region_name=floci_container.get_region(),
        aws_access_key_id=floci_container.get_access_key(),
        aws_secret_access_key=floci_container.get_secret_key(),
    )


@pytest.fixture(scope="module", autouse=True)
def setup():
    with (
        FlociContainer(image="floci/floci:1.7.0") as floci,
        PostgresContainer(image="postgres:18-alpine") as postgres,
        mock_module(
            "app.aws",
            s3=floci_client("s3", floci),
            secretsmanager=floci_client("secretsmanager", floci),
        ),
    ):
        os.environ["APP_BUCKET_NAME"] = "test-bucket"
        os.environ["APP_DB_NAME"] = postgres.dbname
        os.environ["APP_DB_USER"] = postgres.username
        os.environ["APP_DB_HOST"] = postgres.get_container_host_ip()
        os.environ["APP_DB_PORT"] = str(postgres.get_exposed_port(5432))
        secret_name = "db/secret"
        os.environ["APP_DB_SECRET"] = secret_name

        from app.aws import s3, secretsmanager

        secretsmanager.create_secret(
            Name=secret_name,
            SecretString=json.dumps({"password": postgres.password}),
        )

        from app.conf import conf

        s3.create_bucket(Bucket=conf.bucket_name)

        from app.dbclient import connection

        with connection.cursor() as cursor:
            cursor.execute(
                """
                create table files (
                    id int generated always as identity primary key, 
                    object_key text not null
                );
                """
            )
        yield


def test_read_text_file():
    from app.dbclient import connection

    with connection.cursor() as cursor:
        from app.aws import s3
        from app.conf import conf

        s3.put_object(Bucket=conf.bucket_name, Key=object_key, Body=test_content)
        file_id = cursor.execute(
            """
            insert into files (object_key) values (%(objectKey)s) returning id
            """,
            {"objectKey": object_key},
        ).fetchone()[0]

        from app.main import read_text_file

        assert read_text_file(file_id) == test_content.decode("utf-8")
```

In `test_read_text_file`, we begin by uploading a sample text file to the S3 bucket and inserting its location in the database. Then, we call the `read_text_file` function and check that the returned string matches the content of the file we uploaded.

You can now run this test as follows.

```sh prompt{1} output{2..10}
uv run -m pytest -p no:warnings
========================= test session starts ==========================
platform darwin -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
rootdir: ~/backstage/python/testcontainers-integration-tests-with-pytest
configfile: pyproject.toml
collected 1 item

tests/test_main.py .                                              [100%]

========================== 1 passed in 4.71s ===========================
```

:::warn{title="A few things to be aware of before launching the test"}
- Make sure that Docker is up and running, and you're connected to internet.
- If you run this test for the first time, it may take a while since Testcontainers will pull the required Docker images using your internet connection. Once the images are available on your machine, you can run the tests without internet connection.
:::

---

**Source code**

- [testcontainers-integration-tests-with-pytest](https://github.com/naiyerasif/backstage/tree/main/python/testcontainers-integration-tests-with-pytest)
