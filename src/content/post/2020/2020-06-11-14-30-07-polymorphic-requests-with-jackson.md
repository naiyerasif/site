---
slug: "2020/06/11/polymorphic-requests-with-jackson"
title: "Polymorphic Requests with Jackson"
description: "How should you receive requests of different structure through an API using Jackson? This post talks about how polymorphism can be used in such cases and the Jackson configuration required to handle them."
date: "2020-06-11 14:30:07"
update: "2022-07-15 12:05:02"
category: "guide"
tags: ["jackson", "polymorphic", "deserialization"]
---

While building a generalized API, you may come across scenarios where the structure of the incoming request can change based on certain characteristics. In Java, such scenarios are handled with polymorphism which involves introducing an interface to represent multiple types. In this post, we'll explore how to handle polymorphic requests using [Jackson](https://github.com/FasterXML/jackson), a popular data-processing library for Java.

:::setup
The code written for this post uses:

- Java 18
- Jackson Databind 2.13.3
- JUnit 5.8.2
- Maven 3.8.6
:::

Create a Maven project using the following `pom.xml`.

```xml caption='pom.xml'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>dev.mflash.guides.java</groupId>
	<artifactId>jackson-polymorphic-requests</artifactId>
	<version>1.0.0</version>

	<properties>
		<encoding>UTF-8</encoding>
		<project.build.sourceEncoding>${encoding}</project.build.sourceEncoding>
		<project.reporting.outputEncoding>${encoding}</project.reporting.outputEncoding>
		<java.version>18</java.version>
		<maven.compiler.source>${java.version}</maven.compiler.source>
		<maven.compiler.target>${java.version}</maven.compiler.target>
		<jackson.version>2.13.3</jackson.version>
		<junit.version>5.8.2</junit.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>com.fasterxml.jackson.core</groupId>
			<artifactId>jackson-databind</artifactId>
			<version>${jackson.version}</version>
		</dependency>

		<dependency>
			<groupId>org.assertj</groupId>
			<artifactId>assertj-core</artifactId>
			<version>3.23.1</version>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter-api</artifactId>
			<version>${junit.version}</version>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter-engine</artifactId>
			<version>${junit.version}</version>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<version>3.0.0-M7</version>
			</plugin>
		</plugins>
	</build>
</project>
```

## The scenario

Consider a shopping cart app. A customer may add items from different categories into the shopping cart. The API that saves the items in the shopping cart should be able to handle different types of items with different attributes.

Say, the following `CartItem` interface represents different types of items based on `ItemCategory`.


```java
sealed interface CartItem permits Software, Accessory {

	ItemCategory itemCategory();
}
```

The `Software` may have software-specific properties.

```java
package dev.mflash.guides.java.jackson.polymorphic;

public record Software(
		String os,
		String manufacturer,
		String title,
		double price,
		String version
) implements CartItem {

	@Override
	public ItemCategory itemCategory() {
		return ItemCategory.SOFTWARE;
	}
}
```

The `Accessory` may have a different set of properties.

```java
package dev.mflash.guides.java.jackson.polymorphic;

import java.util.List;

public record Accessory(
		String brand,
		String manufacturer,
		String model,
		double price,
		List<String> specialFeatures
) implements CartItem {

	@Override
	public ItemCategory itemCategory() {
		return ItemCategory.ACCESSORY;
	}
}
```

When a customer adds a software to the shopping cart, your app may receive a JSON that may look like this.

```json
{
	"itemCategory": "SOFTWARE",
	"os": "Windows",
	"manufacturer": "Microsoft Software",
	"title": "Office Professional",
	"price": 6300.0,
	"version": "2021"
}
```

What you'd like for your API is to receive the JSON as an instance of `CartItem` of type `Software`. Instead, Jackson throws the following exception.

```sh
com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Cannot construct instance of `dev.mflash.guides.java.jackson.polymorphic.CartItem` (no Creators, like default constructor, exist): abstract types either need to be mapped to concrete types, have custom deserializer, or contain additional type information
```

Jackson can't find a way to initialize an instance of `CartItem` of type `Software` because it can't find a constructor to do so.

## Providing deserialization details

Add the following annotations on the `CartItem` interface.

```java {3..10}
package dev.mflash.guides.java.jackson.polymorphic;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "itemCategory")
@JsonSubTypes({
		@JsonSubTypes.Type(value = Software.class, name = "SOFTWARE"),
		@JsonSubTypes.Type(value = Accessory.class, name = "ACCESSORY"),
})
sealed interface CartItem permits Software, Accessory {

	ItemCategory itemCategory();
}
```

In this change,
- `@JsonTypeInfo` annotation tells Jackson that the identity of an instance should be determined by a property called `itemCategory`.
- `@JsonSubTypes` annotations tell Jackson that if the `itemCategory` has a value `SOFTWARE`, the JSON should be deserialized as an object of `Software` type. Similarly, if the `itemCategory` has a value `ACCESSORY`, the JSON should be deserialized as an object of `Accessory` type.

## Testing the implementation

Here are some JUnit tests to verify the implemented behavior.

```java
package dev.mflash.guides.java.jackson.polymorphic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CartItemTest {

	private static final ObjectMapper mapper = new ObjectMapper();

	@Test
	@DisplayName("Should parse item as Software")
	void shouldParseItemAsSoftware() throws JsonProcessingException {
		final var item = """
				{
					"itemCategory": "SOFTWARE",
					"os": "Windows",
					"manufacturer": "Microsoft Software",
					"title": "Office Professional",
					"price": 6300.0,
					"version": "2021"
				}
				""";
		final var cartItem = mapper.readValue(item, CartItem.class);
		assertThat(cartItem)
				.isExactlyInstanceOf(Software.class)
				.satisfies(software -> assertThat(software.itemCategory()).isEqualTo(ItemCategory.SOFTWARE));
	}

	@Test
	@DisplayName("Should parse item as Accessory")
	void shouldParseItemAsAccessory() throws JsonProcessingException {
		final var item = """
				{
					"itemCategory": "ACCESSORY",
					"brand": "Dell",
					"manufacturer": "Dell Incorporation",
					"model": "MS116-XY",
					"price": 449.0,
					"specialFeatures": ["Wired", "Optical"]
				}
				""";
		final var cartItem = mapper.readValue(item, CartItem.class);
		assertThat(cartItem)
				.isExactlyInstanceOf(Accessory.class)
				.satisfies(accessory -> assertThat(accessory.itemCategory()).isEqualTo(ItemCategory.ACCESSORY));
	}

	@Test
	@DisplayName("Should throw exception on unknown item")
	void shouldThrowExceptionOnUnknownItem() {
		final var item = """
				{
					"itemCategory": "SNACK",
					"speciality": "Vegetarian",
					"form": "Toffee"
				}
				""";
		final Exception exception = catchException(() -> mapper.readValue(item, CartItem.class));
		assertThat(exception)
				.isExactlyInstanceOf(InvalidTypeIdException.class)
				.hasMessageStartingWith("Could not resolve type id 'SNACK'");
	}
}
```

- The first test checks if the JSON is being read as an instance of `Software` type.
- The second test checks if the JSON is being read as an instance of the `Accessory` type.
- The third test checks if our implementation throws the expected exception when an unknown `itemCategory` is specified.

---

**Source code**

- [jackson-polymorphic-requests](https://github.com/Microflash/guides/tree/main/java/jackson-polymorphic-requests)
