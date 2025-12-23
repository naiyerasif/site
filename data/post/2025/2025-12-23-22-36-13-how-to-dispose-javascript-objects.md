---
slug: "2025/12/23/how-to-dispose-javascript-objects"
title: "How to dispose JavaScript objects"
description: "JavaScript has no built-in equivalent to Java's try-with-resources or Python's with statement. Until a native solution lands, here's a pattern you can use today for deterministic resource cleanup."
date: 2025-12-23 22:36:13
update: 2025-12-23 22:36:13
type: "guide"
---

Everyday we work with _resources_ in our programs &mdash; editing files, fetching records from databases, and more. We open a resource, do the necessary work, and then close it. When we miss that final step, we end up with files inaccessible to other processes, locked database connections, or an unexpectedly large cloud bill. To ensure we deterministically clean up the resources, even when an error occurs, many languages provide native constructs, such as Java's [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) and Python's [with](https://docs.python.org/3/reference/compound_stmts.html#the-with-statement) statement. JavaScript, however, still lacks a built-in equivalent. While we wait for better [platform support](https://caniuse.com/?search=Explicit+Resource+Management) for [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management), let's implement a solution we can use today.

:::note{.setup}
The examples in this post use:

- Node.js 25.2.1
- Docker 28.5.2
- [Valkey](https://valkey.io/) 9
- [pnpm](https://pnpm.io/) 10.26.1
:::

Create a Node.js project using the following `package.json` file.

```json title="package.json"
{
	"name": "js-resource-management",
	"version": "1.0.0",
	"type": "module",
	"main": "src/index.js",
	"scripts": {
		"test": "node --test test/autodisposable.test.js"
	},
	"dependencies": {
		"iovalkey": "^0.3.3"
	},
	"packageManager": "pnpm@10.26.1"
}
```

We'll use a contrived example: connect to a Valkey server, store a key-value pair, and then return it, as follows.

```js title="src/client.js"
import Valkey from "iovalkey";

export default async function check(key, value) {
	const client = new Valkey();
	await client.set(key, value);
	return await client.get(key);
}
```

Now imagine calling this function repeatedly, for example, inside a loop.

```js title="src/index.js"
import check from "./client.js";

try {
	const maxClients = 7;
	for (let i = 1; i <= maxClients; i++) {
		const key = "key" + i;
		const value = "value" + i;
		console.log(await check(key, value));
	}
} catch (error) {
	console.error(String(error));
	process.exit(1);
}
```

Suppose our Valkey server permits only upto five concurrent clients. We can simulate this limit by passing `--maxclients 5` when launching a Valkey container, as shown below.

```sh
docker run -p 6379:6379 -d valkey/valkey valkey-server --maxclients 5
```

When we run `node ./src/index.js`, we see the following output.

```sh {7} prompt{1} output{2..7}
node ./src/index.js
value1
value2
value3
value4
value5
ReplyError: ERR max number of clients reached
```

What happened? We exhausted all five concurrent client connections permitted by Valkey server. In `src/index.js`, we attempt to connect to Valkey inside a loop that runs seven times. Once five clients are connected, any subsequent connection attempts fail. This happened because we're creating new clients but never closing them, leaving the connection open.

A quick-and-dirty fix is to explicitly close the client in `src/client.js`.

```js title="src/client.js" {6..8}
import Valkey from "iovalkey";

export default async function check(key, value) {
	const client = new Valkey();
	await client.set(key, value);
	const result = await client.get(key);
	client.disconnect();
	return result;
}
```

Although this works, it doesn't scale well. In many cases, there's often a lot happening between acquiring a resource and releasing it. As that distance grows, it becomes easy to forget the cleanup step entirely.

## The `AutoDisposable` utility

It'd be lovely if we can guarantee that a resource is always closed without relying on manual cleanup. To make that possible, let's write an `AutoDisposable` utility.

```js title="src/autodisposable.js"
export default class AutoDisposable {
	constructor(factories) {
		this.factories = factories;
	}

	static using(...resources) {
		return new AutoDisposable(resources);
	}

	async apply(fn) {
		const instances = [];

		try {
			for (const factory of this.factories) {
				const res = await this.#resolve(factory);
				if (this.#hasDisposer(res)) {
					instances.push(res);
				} else {
					console.warn("AutoDisposable: Skipping resource — no valid disposer found.", res);
				}
			}

			return await fn(...instances);
		} finally {
			for (const res of [...instances].reverse()) {
				await this.#dispose(res);
			}
		}
	}

	async #resolve(factory) {
		if (typeof factory === "function") {
			const result = factory();
			return result instanceof Promise ? await result : result;
		}
		return factory;
	}

	async #dispose(resource) {
		if (!resource) return;

		const disposer = resource["dispose"];
		if (typeof disposer === "function") {
			const result = disposer.call(resource);
			if (result instanceof Promise) {
				await result;
			}
			return;
		}
	}

	#hasDisposer(resource) {
		return typeof resource?.["dispose"] === "function";
	}
}
```

Here's how this utility works:

- `AutoDisposable.using(...)` accepts a list of resource factories. Each factory is expected to produce a resource that exposes a `dispose` method for cleanup.
- When `apply` function is called, all resources, synchronous or asynchronous, are returned to a callback function in the same order they were supplied.
- Once the callback function has used the resources and finished, either successfully or with an error, `AutoDisposable` automatically invokes the `dispose` method of each resource in reverse order, ensuring proper teardown.
- Any resource that does not implement a `dispose` method is skipped.

Using `AutoDisposable`, we can rewrite the `src/client.js` as:

```js title="src/index.js"
import Valkey from "iovalkey";
import AutoDisposable from "./autodisposable.js";

export default async function check(key, value) {
	return await AutoDisposable
		.using(() => ({
			client: new Valkey(),
			async dispose() {
				this.client.disconnect();
			}
		}))
		.apply(async ({ client }) => {
			await client.set(key, value);
			return await client.get(key);
		});
}
```

You can run this example with `node ./src/index.js`, and you should see this output.

```sh prompt{1} output{2..8}
node ./src/index.js
value1
value2
value3
value4
value5
value6
value7
```

Here, the client is opened and eventually closed on every call, ensuring we never hit the `maxclients` limit.

## Tests for `AutoDisposable` utility

Let's write a few unit tests for this utility, using Node.js [test runner](https://nodejs.org/api/test.html) and [Assertion](https://nodejs.org/api/assert.html) API.

```js title="test/autodisposable.test.js"
import assert from "node:assert";
import { test, describe, beforeEach } from "node:test";
import AutoDisposable from "../src/autodisposable.js";

describe("AutoDisposable", () => {
	let calls;

	beforeEach(() => {
		calls = [];
	});

	test("should dispose resources with 'dispose' method", async () => {
		const resource = {
			dispose() {
				calls.push("dispose");
			},
		};

		const result = await AutoDisposable.using(() => resource).apply((r) => {
			assert.strictEqual(r, resource);
			return "done";
		});

		assert.strictEqual(result, "done");
		assert.deepStrictEqual(calls, ["dispose"]);
	});

	test("should skip resources without a disposer and log a warning", async () => {
		const originalWarn = console.warn;
		let warned = false;
		console.warn = (msg) => {
			warned = msg.includes("AutoDisposable: Skipping");
		};

		await AutoDisposable.using(() => ({ name: "no-disposer" })).apply((...resources) => {
			assert.strictEqual(resources.length, 0);
		});

		assert.strictEqual(warned, true);
		console.warn = originalWarn;
	});

	test("should dispose multiple resources in reverse order", async () => {
		const order = [];

		const a = {
			async dispose() {
				order.push("a");
			},
		};

		const b = {
			dispose() {
				order.push("b");
			},
		};

		await AutoDisposable.using(
			() => a,
			() => b,
		).apply((...resources) => {
			assert.strictEqual(a, resources.at(0));
			assert.strictEqual(b, resources.at(1));
		});

		assert.deepStrictEqual(order, ["b", "a"]);
	});

	test("should dispose resources even if the callback throws", async () => {
		const resource = {
			dispose() {
				calls.push("dispose");
			},
		};

		await assert.rejects(
			AutoDisposable.using(() => resource).apply((r) => {
				throw new Error("boom");
			}),
			/boom/
		);

		assert.deepStrictEqual(calls, ["dispose"]);
	});
});
```

You can run these tests with `node --test ./test/autodisposable.test.js`.

These tests cover the following scenarios.

- **Expected disposal** The first test verifies that a resource with a `dispose` method is passed to the callback and cleaned up afterward.
- The second test checks the **skipping of resource** without `dispose` function, displaying a warning.
- **Teardown order** The third test asserts that when multiple resources are used, they are disposed of in reverse order of acquisition.
- **Disposal even on failure** The last test validates that resource is disposed even if the callback throws an error.

---

**Source code**

- [js-resource-management](https://github.com/Microflash/backstage/tree/main/javascript/js-resource-management)

**Related**

- Ron Buckton, [ECMAScript Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)
- [JavaScript resource management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management)
