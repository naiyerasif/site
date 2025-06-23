---
slug: "2025/05/31/how-to-mock-a-module-import-in-python"
title: "How to mock a module import in Python"
description: "When writing tests, it is quite common to mock a module. Explore how to do this safely, with proper cleanup to avoid side effects."
date: 2025-05-31 01:47:07
update: 2025-05-31 01:47:07
type: "guide"
---

When writing tests, it is quite common to mock a module. [One way](https://stackoverflow.com/a/48290984) to do this is by injecting a custom module in `sys.modules`:


```python
import sys
from testcontainers.localstack import LocalStackContainer


def mock_module(localstack_container: LocalStackContainer):
    mocked_module = type(sys)('clients')
    mocked_module.s3 = localstack_container.get_client('s3')
    sys.modules['clients'] = mocked_module
```

:::note
In this example, I'm trying to mock the following module using [`testcontainers[localstack]`](https://pypi.org/project/testcontainers/):

```python title="clients.py"
import boto3

s3 = boto3.client("s3")
```
:::

Alternatively, you can be more explicit using `ModuleType`:

```python del{7} ins{2,8}
import sys
from types import ModuleType
from testcontainers.localstack import LocalStackContainer


def mock_module(localstack_container: LocalStackContainer):
    mocked_module = type(sys)('clients')
    mocked_module = ModuleType('clients')
    mocked_module.s3 = localstack_container.get_client('s3')
    sys.modules['clients'] = mocked_module
```

Both approaches are valid.

Once done with running tests, you may want to remove the mocked module.

```python
sys.modules.pop('clients', None)
```

[As is tradition](https://news.ycombinator.com/item?id=11032296), you can build a more generalized utility function.

```python title="mockutils.py"
import sys
from typings import ModuleType


def mock_module(module_name: str, **attributes):
    mocked_module = ModuleType(module_name)
    
    for name, value in attributes.items():
        setattr(mocked_module, name, value)
    
    sys.modules[module_name] = mocked_module
```

And you can use this function as follows:

```python
from mockutils import mock_module
from testcontainers.localstack import LocalStackContainer


mock_module('clients', s3=localstack_container.get_client('s3'))
# do something with your mock
# cleanup
sys.modules.pop('clients', None)
```

_What if you forget to manually clean up the mocked module?_ To make sure the mocked module is properly cleaned up, you can enhance `mock_module` function as a context manager.

```python title="mockutils.py" ins{3,6,8,17..23}
import sys
from types import ModuleType
from contextlib import contextmanager


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

As a bonus, this implementation restores the original module after mocking. Here's how you can use it.

```python
from mockutils import mock_module
from testcontainers.localstack import LocalStackContainer


with mock_module('clients', s3=localstack_container.get_client('s3')):
    # do something with your mock
```
