---
slug: "2021/06/19/creating-deep-copies-in-java"
title: "Creating deep copies in Java"
description: "There are no built-in mechanisms to create deep copies of an object in Java. You can implement the Cloneable interface in your class and override the clone() method. Or, you can use some ways to do this described in this post."
date: "2021-06-19 10:56:39"
update: "2021-06-19 10:56:39"
category: "guide"
tags: ["java", "jackson", "kryo", "copy"]
---

The need to create copies is pretty common in programming. In a nutshell, you may need the copy of an object's reference (called a *shallow copy*) or the copy of the object's data (called a *deep copy*), depending on the requirement. Java makes it pretty straightforward to create shallow copies of an object; you need to implement the `Cloneable` interface on its class and override the `clone()` method. However, there are no in-built mechanisms to create deep copies of an object in Java. In this guide, we'll explore some ways to do this for different usecases.

## Manually copying the data

One way to achieve a predictable deep copying mechanism is to manually implement it in the classes. You can do this by defining the following interface.

```java
public interface Copyable<T> {

  T copy();
}
```

You can implement this interface in the classes that need to provide deep copies.

```java {6-12,21-26}
public class Book implements Copyable<Book> {

  private String title;
  private Author author;

  @Override
  public Book copy() {
    final Book newBook = new Book();
    newBook.setAuthor(author.copy());
    newBook.setTitle(title);
    return newBook;
  }

  // getters, setters, etc
}

public class Author implements Copyable<Author> {

  private String name;

  @Override
  public Author copy() {
    final Author newAuthor = new Author();
    newAuthor.setName(name);
    return newAuthor;
  }

  // getters, setters, etc
}
```

You can now verify that calling the `copy()` method does create a deep copy through the following test.

```java {18}
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BookDeepCopyTest {

  @Test
  @DisplayName("Should copy data but not reference")
  void shouldCopyDataButNotReference() {
    final var andyWeir = new Author();
    andyWeir.setName("Andy Weir");

    final var martian = new Book();
    martian.setTitle("The Martian");
    martian.setAuthor(andyWeir);

    final Book copyOfMartian = martian.copy();

    assertThat(copyOfMartian).isNotEqualTo(martian);
    assertThat(copyOfMartian.getAuthor()).isNotEqualTo(martian.getAuthor());
    assertThat(copyOfMartian.getTitle()).isEqualTo(martian.getTitle());
    assertThat(copyOfMartian.getAuthor().getName()).isEqualTo(martian.getAuthor().getName());

    copyOfMartian.getAuthor().setName("Marie Lu");
    assertThat(copyOfMartian.getAuthor().getName()).isNotEqualTo(martian.getAuthor().getName());
  }
}
```

At the end of the test, you can see that even if we modify the author's name in the copy of a `Book` object, the original object remains unaffected.

There are a few caveats in this approach.

- You need to manually implement the `copy()` method in the source code of the classes. You may not have access to the source code; it may be part of an external library.
- In the above example, the `Book` class has only two attributes. What if your class has a lot of fields, many of which are references to other types? You'll also have to handle the `null` values in such cases which is very tedious.

## Copying with serialized representation to object

A better approach to generate a deep copy is by serialization using a Java library. There are multiple ways to do this; one of them is to serialize the object to JSON using [Jackson](https://github.com/FasterXML/jackson) and deserialize it.

Assuming you've got a Maven project, add the `jackson-databind` dependency in `pom.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  
  <!-- rest of the pom -->

  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.12.3</version>
    </dependency>
  </dependencies>

</project>
```

You won't need to modify the original classes in this case.

```java {20-22}
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BookDeepCopyWithJacksonTest {

  @Test
  @DisplayName("Should copy data but not reference")
  void shouldCopyDataButNotReference() throws JsonProcessingException {
    final var andyWeir = new Author();
    andyWeir.setName("Andy Weir");

    final var martian = new Book();
    martian.setTitle("The Martian");
    martian.setAuthor(andyWeir);

    final var objectMapper = new ObjectMapper();
    final String json = objectMapper.writeValueAsString(martian);
    final Book copyOfMartian = objectMapper.readValue(json, Book.class);

    assertThat(copyOfMartian).isNotEqualTo(martian);
    assertThat(copyOfMartian.getAuthor()).isNotEqualTo(martian.getAuthor());
    assertThat(copyOfMartian.getTitle()).isEqualTo(martian.getTitle());
    assertThat(copyOfMartian.getAuthor().getName()).isEqualTo(martian.getAuthor().getName());

    copyOfMartian.getAuthor().setName("Marie Lu");
    assertThat(copyOfMartian.getAuthor().getName()).isNotEqualTo(martian.getAuthor().getName());
  }
}
```

In the above test, to create a deep copy, we

- serialized the object `martian` as a JSON string using Jackson's `ObjectMapper.writeValueAsString` method.
- deserialized the JSON string back to the object using `ObjectMapper.readValue` method.

Using this approach
- you don't need to mess with the source code of the classes.
- you can create deep copies of complex objects, e.g., those using collections, maps, etc, without much fuss.

However, note that this is a two-step process and can cause performance issues in some scenarios where memory is limited and objects are massive.

## Copying from object to object

It is possible to avoid the two-step process used above and directly copy the object. You can use a serialization framework called [Kryo](https://github.com/EsotericSoftware/kryo) which can create deep copies by direct copying data from the object to object.

Assuming you have a Maven project, add the `kryo` dependency in `pom.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  
  <!-- rest of the pom -->

  <dependencies>
    <dependency>
      <groupId>com.esotericsoftware</groupId>
      <artifactId>kryo</artifactId>
      <version>5.1.1</version>
    </dependency>
  </dependencies>

</project>
```

As in the previous approach, you won't need to do any changes to the source code of the classes.

```java {19-21}
import static org.assertj.core.api.Assertions.assertThat;

import com.esotericsoftware.kryo.Kryo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BookDeepCopyWithKryoTest {

  @Test
  @DisplayName("Should copy data but not reference")
  void shouldCopyDataButNotReference() {
    final var andyWeir = new Author();
    andyWeir.setName("Andy Weir");

    final var martian = new Book();
    martian.setTitle("The Martian");
    martian.setAuthor(andyWeir);

    final var kryo = new Kryo();
    kryo.setRegistrationRequired(false);
    final Book copyOfMartian = kryo.copy(martian);

    assertThat(copyOfMartian).isNotEqualTo(martian);
    assertThat(copyOfMartian.getAuthor()).isNotEqualTo(martian.getAuthor());
    assertThat(copyOfMartian.getTitle()).isEqualTo(martian.getTitle());
    assertThat(copyOfMartian.getAuthor().getName()).isEqualTo(martian.getAuthor().getName());

    copyOfMartian.getAuthor().setName("Marie Lu");
    assertThat(copyOfMartian.getAuthor().getName()).isNotEqualTo(martian.getAuthor().getName());
  }
}
```

In the test above, we

- initialized an instance of `Kryo` and set the registration of classes to `false`. By default, `kryo` requires the registration of all the classes that you need to copy (here `Author` and `Book`). However, if you want to use `kryo` only for copying purposes, you can safely disable the registration.
- copied the object by calling the `copy` method on the `kryo` instance.

This method is a single-step process, and much faster than previous approaches. It also works pretty effectively with complex / massive objects.

---

**Source code**

- [deep-copying](https://github.com/Microflash/guides/tree/main/java/deep-copying)

**Related**

- [Jackson Databind docs](https://github.com/FasterXML/jackson-databind)
- [Deep and shallow copies](https://github.com/EsotericSoftware/kryo#deep-and-shallow-copies)
