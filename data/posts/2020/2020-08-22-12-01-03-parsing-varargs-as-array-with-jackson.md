---
title: 'Parsing varargs as array with Jackson'
date: 2020-08-22 12:01:03
category: 'note'
tags: ['varargs', 'serialization', 'jackson']
---

Consider the following Java class where the setter for the `author` property accepts the values as varargs.

```java
class Book {
  private String[] author;

  public String[] getAuthor() {
    return this.author;
  }

  public void setAuthor(String... author) {
    this.author = author;
  }
}
```

If you pass a single value of the `author` as follows, [Jackson](https://github.com/FasterXML/jackson-databind) will throw an error. 

```json
{
  "author": "Jenny McLachlan"
}
```

To enable Jackson accept a single value as an array, you can use `@JsonFormat` annotation as follows.

```java
class Book {
  @JsonFormat(with = Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
  private String[] author;

  // getters, setters, etc.
}
```
