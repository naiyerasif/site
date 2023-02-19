---
slug: "2022/08/06/introduction-to-problem-details"
title: "Introduction to Problem Details"
description: "Describing problems in the software engineering is just as hard as naming things. The Problem Details specification proposes a standard way to convey the details when something goes wrong."
date: "2022-08-06 10:10:10"
update: "2022-08-06 10:10:10"
category: "guide"
tags: ["problem", "http", "specification"]
---

Describing problems in software engineering is just as hard as naming things. Specific ecosystems report things that go wrong differently. For example, we've [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) to express client and server errors. However, such error codes may not be sufficient to describe the underlying issue that caused the error. The [Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) specification proposes a standard way to describe such errors using JSON or XML.

## Problem Details specification

The Problem Details specification consists of

- a Problem Details object
- supported representations of Problem Details object

### Problem Details object

A Problem Details object can have the following standard fields.

- `type` (mandatory): a URL where the details about the problem are documented in a human-readable format
- `title`: a human-readable summary of the problem. This shouldn't change with each occurrence of the problem. For example, it shouldn't contain an `id` that might be unique to each occurrence of the problem.
- `detail`: a human-readable explanation specific to the occurrence of the problem. This field can contain the `id` that might be unique to each occurrence of the problem.
- `status`: the HTTP status code related to the problem
- `instance`: a URL that documents the specific occurrence of the problem

The `type` and `instance` URLs can be absolute or relative. Depending on the need, the Problem Details object can be extended to include more fields and even nested Problem Details objects.

### Representations of Problem Details object

JSON is the canonical representation for a Problem Details object with `application/problem+json` media type. Alternatively, XML can also represent it with `application/problem+xml` media type.

The specification doesn’t have opinions on any other format. You can convert the JSON or XML representations to the format of your choice if such a conversion is possible. Alternatively, you can embed the JSON or XML representations in the response (such as HTML document). There are no standard media types for other formats.

## Examples

### Minimal response with HTTP status

```json
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{
	"type": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403",
	"title": "Forbidden",
	"status": 403
}
```

For minimal responses, the `title` should be the description of the HTTP status code [documented here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

### Rich response with additional details

```json
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
	"type": "https://example.com/problems/constraint-violation/",
	"title": "The input violated a constraint.",
	"status": 400,
	"detail": "Uploaded onboarding policy is larger than the acceptable legal limit of 7000 characters.",
	"instance": "https://example.com/problems/onboarding-policy#legal-limits"
}
```

### Extended Problem Details with custom fields

```json {10-16}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
	"type": "https://example.com/problems/constraint-violation/",
	"title": "The input violated a constraint.",
	"status": 400,
	"detail": "Uploaded onboarding policy is larger than the acceptable legal limit of 7000 characters.",
	"instance": "https://example.com/problems/onboarding-policy#legal-limits",
	"violations": [
		{
			"constraint": "length",
			"field": "onboarding_policy",
			"violation": "exceeded 7000 characters"
		}
	]
}
```

### Nested Problem Details for multiple problems

```json {10-25}
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json

{
	"type": "https://example.com/problems/integration-failure/",
	"title": "An internal integration failed.",
	"status": 500,
	"detail": "Failed to receive full response from the payment processor because the bank didn't respond within 5 minutes.",
	"instance": "https://example.com/problems/integration-failure/#partial-response-failures",
	"problems": [
		{
			"type": "https://example.com/problems/payment-processing/",
			"title": "The payment processing was interrupted.",
			"status": 500,
			"detail": "Payment processing failed because the transaction was not completed within 5 minutes.",
			"instance": "https://example.com/problems/payment-processing#interrupts"
		},
		{
			"type": "https://example.com/problems/transaction-timeout/",
			"title": "The transaction timed out.",
			"status": 500,
			"detail": "The banking gateway failed to commit the transaction within 5 minutes.",
			"instance": "https://example.com/problems/transaction-timeout/62591"
		}
	]
}
```

### XML representation

```xml
HTTP/1.1 403 Forbidden
Content-Type: application/problem+xml

<?xml version="1.0" encoding="UTF-8"?>
<problem xmlns="urn:ietf:rfc:7807">
	<type>https://example.com/problems/expired-payment-details/</type>
	<status>403</status>
	<title>Your default payment method has expired.</title>
	<detail>Configure an active payment method to book a ride.</detail>
	<instance>https://example.com/problems/payment-options/us/2022/</instance>
</problem>
```

### TOML representation

```toml
HTTP/1.1 403 Forbidden
Content-Type: application/toml

[problem]
type = "https://example.com/problems/expired-payment-details/"
status = 403
title = "Your default payment method has expired."
detail = "Configure an active payment method to book a ride."
instance = "https://example.com/problems/payment-options/us/2022/"
```

Note that this is just a converted representation of XML Problem Detail. The `Content-Type` is the usual `application/toml` since there's no recommended media type for the TOML Problem Details object.

## Adoption and support

Problem Details has gained support from popular frameworks and libraries.

- Spring framework is [planning](https://github.com/spring-projects/spring-framework/issues/27052) to add support for Problem Details in Spring Framework 6 (and eventually in Spring Boot 3).
- Zalando maintains the Java libraries [zalando/problem](https://github.com/zalando/problem) that implements `application/problem+json`, and [zalando/problem-spring-web](https://github.com/zalando/problem-spring-web) that handles Problems in Spring Web MVC.
- Micronaut has a dedicated library [micronaut-projects/micronaut-problem-json](https://github.com/micronaut-projects/micronaut-problem-json) to add Problem Details support.
- [pupilstart/houston](https://github.com/pupilstart/houston) and [PDMLab/http-problem](https://github.com/PDMLab/http-problem) provide Problem Details support on Node.js and Deno.

---

**Related**

- [Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
