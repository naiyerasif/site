---
slug: "post/2025/05/31/how-to-mock-a-module-import-in-python"
title: "How to mock a module import in Python"
date: 2025-05-31 01:47:07
update: 2026-08-22 17:00:28
category: "guide"
---

When writing tests, it is quite common to mock a module. It can be a database, an API, or a cloud service for which you need a testable alternative. [One way](https://stackoverflow.com/a/48290984) is to inject a custom module into `sys.modules`, Python's built-in registry of every module that's been imported.

```python
import sys

import boto3
from floci import FlociContainer


def mock_module(floci_container: FlociContainer):
    mocked_module = type(sys)('clients')
    mocked_module.s3 = boto3.client(
        's3',
        endpoint_url=floci_container.get_endpoint(),
        region_name=floci_container.get_region(),
        aws_access_key_id=floci_container.get_access_key(),
        aws_secret_access_key=floci_container.get_secret_key(),
    )
    sys.modules['clients'] = mocked_module
```

:::note
This example mocks the following module:

```python title="clients.py"
import boto3

s3 = boto3.client("s3")
```
:::

Alternatively, you can be more explicit using `ModuleType`:

```python del{9} ins{2,10}
import sys
from types import ModuleType

import boto3
from floci import FlociContainer


def mock_module(floci_container: FlociContainer):
    mocked_module = type(sys)('clients')
    mocked_module = ModuleType('clients')
    mocked_module.s3 = boto3.client(
        's3',
        endpoint_url=floci_container.get_endpoint(),
        region_name=floci_container.get_region(),
        aws_access_key_id=floci_container.get_access_key(),
        aws_secret_access_key=floci_container.get_secret_key(),
    )
    sys.modules['clients'] = mocked_module
```

Both versions do exactly the same thing.

Once done with running tests, you may want to remove the mocked module.

```python
sys.modules.pop('clients', None)
```

You can refactor this into a more generalized utility.

```python title="mockutils.py"
import sys
from typings import ModuleType


def mock_module(module_name: str, **attributes):
    mocked_module = ModuleType(module_name)
    for name, value in attributes.items():
        setattr(mocked_module, name, value)
    sys.modules[module_name] = mocked_module
```

Now any module can be mocked like this:

```python
import sys

import boto3
from floci import FlociContainer
from mockutils import mock_module

floci_container = FlociContainer(image='floci/floci:1.7.0')

mock_module(
    'clients',
    s3=boto3.client(
        's3',
        endpoint_url=floci_container.get_endpoint(),
        region_name=floci_container.get_region(),
        aws_access_key_id=floci_container.get_access_key(),
        aws_secret_access_key=floci_container.get_secret_key(),
    ),
)
# do something with your mock
# cleanup
sys.modules.pop('clients', None)
```

_What if you forget to manually clean up the mocked module?_ To make sure it is automically cleaned up, you can convert `mock_module` into a context manager.

```python title="mockutils.py" ins{2,6,8,14..20}
import sys
from contextlib import contextmanager
from types import ModuleType


@contextmanager
def mock_module(module_name: str, **attributes):
    original_module = sys.modules.get(module_name)
    mocked_module = ModuleType(module_name)
    for name, value in attributes.items():
        setattr(mocked_module, name, value)
    sys.modules[module_name] = mocked_module

    try:
        yield
    finally:
        if original_module is not None:
            sys.modules[module_name] = original_module
        else:
            sys.modules.pop(module_name, None)
```

Now cleanup runs whether the test passes, fails, or raises. Additionally, this implementation restores the original module after mocking, or removes the mock entirely if it didn't. Here's how you can use it.

```python
import sys

import boto3
from floci import FlociContainer
from mockutils import mock_module

with (
    FlociContainer(image="floci/floci:1.7.0") as floci_container,
    mock_module(
        "clients",
        s3=boto3.client(
            "s3",
            endpoint_url=floci_container.get_endpoint(),
            region_name=floci_container.get_region(),
            aws_access_key_id=floci_container.get_access_key(),
            aws_secret_access_key=floci_container.get_secret_key(),
        ),
    ),
):
    # do something with your mock
```
