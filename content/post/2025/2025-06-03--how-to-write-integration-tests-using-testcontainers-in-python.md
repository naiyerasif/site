---
slug: "post/2025/06/03/how-to-write-integration-tests-using-testcontainers-in-python"
title: "How to write integration tests using Testcontainers in Python"
date: 2025-06-03 21:48:03
update: 2026-08-22 17:00:59
category: "guide"
---

When an application uses external components such as databases or cloud services, it's important to test how everything works together. That's where integration tests come in. They help ensure your application behaves as expected in an environment that resembles production. [Testcontainers](https://testcontainers.com/) makes these tests possible by simulating real dependencies using Docker.

In this post, we'll build a small application that reads a file location from Postgres, downloads the file from [S3](https://aws.amazon.com/s3/), and returns its contents. Then, we'll test the whole path with Testcontainers.

:::note{title="Environment"}
- Python 3.14
- Docker 29.4.0
- Floci 1.7.0
- Postgres 18
- uv 0.12.5
:::

## Building the application

Let's start by setting up a Python project with the following `pyproject.toml` file.

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

Run `uv sync` and [uv](https://docs.astral.sh/uv/) automatically installs the correct Python version (if needed), creates a virtual environment, and downloads all dependencies.

To connect to Postgres and reach into S3, the application needs some configuration which we can read with the `Configuration` utility:

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

`BaseSettings` maps the environment variables to properties automatically. It is a good practice to securely store passwords using services such as [AWS SecretsManager](https://aws.amazon.com/secrets-manager/), [Vault](https://www.hashicorp.com/en/products/vault), and so on. We're reading the database password from SecretsManager.

We're importing the specific AWS clients using `boto3` as follows.

```python title="app/aws.py"
import boto3

s3 = boto3.client("s3")
secretsmanager = boto3.client("secretsmanager")
```

You might wonder&mdash;why not use `boto3` directly?

If we do that, we'll have to mock `boto3` in our tests. This can be messy since `boto3` is a generic library with a large API surface. By wrapping only the clients we need in a separate module, we only have to mock `s3` and `secretsmanager`.

Next, let's create a utility to connect to the database.

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

To safely close a [cursor](https://www.psycopg.org/psycopg3/docs/api/cursors.html) after use, we're using a context manager. To clean up gracefully, we're registering the `Connection.close` with an exit handler so the connection is automatically closed when the application shuts down.

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

`download_file_as_bytes` fetches an object from S3 and returns it as a byte array. `read_text_file` looks up an object's location in the database using a given `id`, downloads it, and reads it as text.

## Writing the integration test

To write an integration test, we need to set up a test environment with the following requirements.

- A password stored in SecretsManager and environment variables to initialize the configuration
- A database table to store the object locations
- An S3 bucket the application can read from

The following fixture sets it all.

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

- We begin by launching [Floci](https://floci.io/) and Postgres containers managed by Testcontainers.
- We mock `app.aws` module so that our test uses Floci emulated AWS services, such as S3 and SecretsManager. (More on how `mock_module` works in an earlier post [here](/post/2025/05/31/how-to-mock-a-module-import-in-python/))
- Next, we set the required environment variables, some of which use the properties of the `PostgresContainer`. We also store a secret in SecretsManager to hold the database password.
- Finally, we create an S3 bucket and a database table, both of which we'll use later in our test.

We've annotated `setup` with `@pytest.fixture(scope="module", autouse=True)`, so that every test in this module gets this environment automatically, and the containers only start once per module rather than once per test.

With the environment in place, the test itself is short:

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

In `test_read_text_file`, we upload a text file to the S3 bucket, inserting its location in the database, then call `read_text_file`, and check the returned string matches what was uploaded. It reads almost like a description of the feature itself, which is what we want from an integration test: to verify the same path a real request would take.

You can run this test as follows.

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

:::warn{title="Before you run it"}
- Make sure Docker is running, and you're connected to internet.
- On the first run, Testcontainers pulls the Floci and Postgres images using your internet connection, which may take a moment. Subsequent runs work offline and are faster.
:::

---

**Source code**

- [testcontainers-integration-tests-with-pytest](https://github.com/naiyerasif/backstage/tree/main/python/testcontainers-integration-tests-with-pytest)
