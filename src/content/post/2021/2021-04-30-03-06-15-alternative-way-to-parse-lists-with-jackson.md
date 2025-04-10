---
slug: "2021/04/30/alternative-way-to-parse-lists-with-jackson"
title: "Alternative way to parse lists with Jackson"
date: 2021-04-30 03:06:15
update: 2021-04-30 03:06:15
type: "note"
---

You might be familiar using `TypeReference` API to parse lists, arrays, and maps.

```java
// returns List<CartItem>
objectMapper.readValue(input, new TypeReference<List<CartItem>>(){});

// returns CartItem[]
objectMapper.readValue(input, new TypeReference<CartItem[]>(){});

// returns Map<String, CartItem>
objectMapper.readValue(input, new TypeReference<Map<String, CartItem>>(){});
```

Jackson added a new `ObjectReader` API in the version 2.11 to do this a more succinct way.

```java
// returns List<CartItem>
objectMapper.readerForListOf(CartItem.class).readValue(input);

// returns CartItem[]
objectMapper.readerForArrayOf(CartItem.class).readValue(input);

// returns Map<String, CartItem>
objectMapper.readerForMapOf(CartItem.class).readValue(input);
```
