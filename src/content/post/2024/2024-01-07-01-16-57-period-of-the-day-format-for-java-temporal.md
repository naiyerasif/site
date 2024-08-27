---
slug: "2024/01/07/period-of-the-day-format-for-java-temporal"
title: "Period of the Day format for Java Temporal"
date: 2024-01-07 01:33:06
update: 2024-01-07 01:33:06
type: "status"
---

Today I learned about "Period of the Day" pattern `B` to format a `java.time.Temporal` value in Java with `DateTimeFormatter`.

```java {5}
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

void main() {
	var formatter = DateTimeFormatter.ofPattern("B");
	System.out.println(formatter.format(LocalDateTime.now()));
}
```

Running this program with Java 21 prints the following.

```sh prompt{1}
java --enable-preview --source 21 PeriodOfDay.java
at night
```

This new symbol was introduced way back in Java 16.
