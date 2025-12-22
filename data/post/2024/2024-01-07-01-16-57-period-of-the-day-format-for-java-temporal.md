---
slug: "2024/01/07/period-of-the-day-format-for-java-temporal"
title: "Period of the Day format for Java Temporal"
date: 2024-01-07 01:33:06
update: 2025-12-22 21:26:42
type: "note"
---

Today I learned about "Period of the Day" pattern `B` to format a `java.time.Temporal` value in Java with `DateTimeFormatter`.

```java {5}
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

void main() {
	var formatter = DateTimeFormatter.ofPattern("B");
	IO.println(formatter.format(LocalDateTime.now()));
}
```

Running this program with Java 25 prints the following.

```sh prompt{1}
java PeriodOfDay.java
at night
```

This new symbol was introduced way back in Java 16.
