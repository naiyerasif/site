---
slug: "2021/04/30/alternative-way-to-parse-lists-with-jackson"
title: "Alternative way to parse lists with Jackson"
date: 2021-04-30 03:06:15
update: 2025-12-22 21:40:54
type: "note"
---

You might be familiar with Jackson's `TypeReference` API to parse arrays, lists, and maps.

```java
// returns CartItem[]
jsonMapper.readValue(input, new TypeReference<CartItem[]>() {});

// returns List<CartItem>
jsonMapper.readValue(input, new TypeReference<List<CartItem>>() {});

// returns Map<String, CartItem>
jsonMapper.readValue(input, new TypeReference<Map<String, CartItem>>() {});
```

Jackson added a new `ObjectReader` API in the version 2.11 to do this in a more expressive way.

```java
// returns CartItem[]
jsonMapper.readerForArrayOf(CartItem.class).readValue(input);

// returns List<CartItem>
jsonMapper.readerForListOf(CartItem.class).readValue(input);

// returns Map<String, CartItem>
jsonMapper.readerForMapOf(CartItem.class).readValue(input);
```
