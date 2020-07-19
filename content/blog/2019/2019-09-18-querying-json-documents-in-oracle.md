---
title: 'Querying JSON documents in Oracle'
date: 2019-09-18 22:11:11
updated: 2020-03-14 00:48:09
authors: [naiyer]
topics: [oracle, json]
---

Oracle added the native JSON support in the version 12c of their popular relational database system. With the help of new conditions and functions, you can create queries, indexes, transactions and views for JSON documents. 

:::note Setup
The examples in this post use

- Oracle 12c
:::

You can install Oracle 12c by downloading it from [here](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html). If you just want to try out the examples, login at [Oracle Live SQL](https://livesql.oracle.com) which provides a free Oracle environment for you to play with.

## Introducing JSON Path Expressions

JSON path expressions are Oracle's proprietary syntax to query a JSON document.

- A JSON path expression starts with a dollar `$` symbol.
- To access an attribute, a dot `.` is used followed by the attribute name.
- To access an array element, a left `[` and right `]` brackets are used with an index or a range of indexes in between them.
- To access all the attributes or elements of an array, an asterisk `*` is used as a wildcard.

Consider the following JSON document.

```json
{
  "id": "1c719bbb4b10f91d",
  "name": "Marina",
  "albums": [
    { "title": "Froot", "released": 2015 },
    { "title": "Love + Fear", "released": 2019 }
  ],
  "singles": [
    { "title": "Baby", "released": 2018 },
    { "title": "Superstar", "released": 2019 },
    { "title": "Orange Trees", "released": 2019 },
    { "title": "To Be Human", "released": 2019 },
    { "title": "Karma", "released": 2019 },
    { "title": "About Love", "released": 2020 }
  ]
}
```

Here are some examples of JSON path expressions to give you an idea of how they work.

- `$.id` selects the `id` attribute.
- `$.albums[*].title` selects the `title` attribute of all the albums.
- `$.singles[0].*` selects all the attributes of the element at index 0 of the `singles` array.
- `$.*[*].released` selects all the `released` attributes from both the `albums` and `singles` arrays.
- `$.singles[1 to 3, 5]` selects all the elements from the `singles` array with index 1,2,3 and 5. The order of indexes should always be in ascending order.

> There are a lot of other cases for the JSON path expressions. Refer to the [official reference](https://docs.oracle.com/database/121/ADXDB/json.htm#GUID-AEBAD813-99AB-418A-93AB-F96BC1658618) for more details.

## Creating a relation with JSON data

Let's create a simple relation with some JSON documents as CLOB objects. We'll use the data from MongoDB's [bios example collection](https://docs.mongodb.com/manual/reference/bios-example-collection/).

```sql
CREATE TABLE BIOS (
  id INTEGER PRIMARY KEY,
  fname CLOB,
  contribs CLOB,
  recognition CLOB
);
```

We know that `fname`, `contrib` and `recognition` are JSON fields. To ensure this, we can apply constraints using `IS JSON` condition, as follows.

```sql{6-8}
CREATE TABLE BIOS (
  id INTEGER PRIMARY KEY,
  fname CLOB,
  contribs CLOB,
  recognition CLOB
  CONSTRAINT fname_is_json CHECK (fname IS JSON)
  CONSTRAINT contribs_is_json CHECK (contribs IS JSON)
  CONSTRAINT recognition_is_json CHECK (recognition IS JSON)
);
```

> **Warning** Adding an `IS JSON` constraint can reduce the performance of insertion; use it only when you're not entirely sure if the inserted data will be a JSON document.

Populate this table with some data (directly pulled from `bios` collection).

```sql
INSERT INTO BIOS VALUES
(1, '{"first":"John","last":"Backus"}', '["Fortran","ALGOL","Backus-Naur Form","FP"]', '{"awards":[{"award":"W.W. McDowell Award","year":1967,"by":"IEEE Computer Society"},{"award":"National Medal of Science","year":1975,"by":"National Science Foundation"},{"award":"Turing Award","year":1977,"by":"ACM"},{"award":"Draper Prize","year":1993,"by":"National Academy of Engineering"}]}');
INSERT INTO BIOS VALUES
(2, '{"first":"John","last":"McCarthy"}', '["Lisp","Artificial Intelligence","ALGOL"]', '{"awards":[{"award":"Turing Award","year":1971,"by":"ACM"},{"award":"Kyoto Prize","year":1988,"by":"Inamori Foundation"},{"award":"National Medal of Science","year":1990,"by":"National Science Foundation"}]}');
INSERT INTO BIOS VALUES
(3, '{"first":"Grace","last":"Hopper"}', '["UNIVAC","compiler","FLOW-MATIC","COBOL"]', '{"awards":[{"award":"Computer Sciences Man of the Year","year":1969,"by":"Data Processing Management Association"},{"award":"Distinguished Fellow","year":1973,"by":" British Computer Society"},{"award":"W. W. McDowell Award","year":1976,"by":"IEEE Computer Society"},{"award":"National Medal of Technology","year":1991,"by":"United States"}],"title":"Rear Admiral"}');
INSERT INTO BIOS VALUES
(4, '{"first":"Kristen","last":"Nygaard"}', '["OOP","Simula"]', '{"awards":[{"award":"Rosing Prize","year":1999,"by":"Norwegian Data Association"},{"award":"Turing Award","year":2001,"by":"ACM"},{"award":"IEEE John von Neumann Medal","year":2001,"by":"IEEE"}]}');
INSERT INTO BIOS VALUES
(5, '{"first":"Ole-Johan","last":"Dahl"}', '["OOP","Simula"]', '{"awards":[{"award":"Rosing Prize","year":1999,"by":"Norwegian Data Association"},{"award":"Turing Award","year":2001,"by":"ACM"},{"award":"IEEE John von Neumann Medal","year":2001,"by":"IEEE"}]}');
INSERT INTO BIOS VALUES
(6, '{"first":"Guido","last":"van Rossum"}', '["Python"]', '{"awards":[{"award":"Award for the Advancement of Free Software","year":2001,"by":"Free Software Foundation"},{"award":"NLUUG Award","year":2003,"by":"NLUUG"}]}');
INSERT INTO BIOS VALUES
(7, '{"first":"Dennis","last":"Ritchie"}', '["UNIX","C"]', '{"awards":[{"award":"Turing Award","year":1983,"by":"ACM"},{"award":"National Medal of Technology","year":1998,"by":"United States"},{"award":"Japan Prize","year":2011,"by":"The Japan Prize Foundation"}]}');
INSERT INTO BIOS VALUES
(8, '{"first":"Yukihiro","aka":"Matz","last":"Matsumoto"}', '["Ruby"]', '{"awards":[{"award":"Award for the Advancement of Free Software","year":"2011","by":"Free Software Foundation"}]}');
INSERT INTO BIOS VALUES
(9, '{"first":"James","last":"Gosling"}', '["Java"]', '{"awards":[{"award":"The Economist Innovation Award","year":2002,"by":"The Economist"},{"award":"Officer of the Order of Canada","year":2007,"by":"Canada"}]}');
INSERT INTO BIOS VALUES
(10, '{"first":"Martin","last":"Odersky"}', '["Scala"]', null);

COMMIT;
```

## Querying JSON as a table

Say, you want to query the full names from the `bios` table with the corresponding `id`. The `json_table` function comes in handy here; it takes a column and projects it as a relation that can then be queried like a usual table.

```sql
SELECT 
  bios.id, 
  CASE 
    WHEN jbios.aka IS NOT NULL 
    THEN jbios.first_name || ' ' || jbios.aka || ' ' || jbios.last_name 
    WHEN jbios.aka IS NULL 
    THEN jbios.first_name || ' ' || jbios.last_name 
  END AS name
FROM  
  bios,  
  json_table(
    bios.fname, 
    '$[*]' columns (
      first_name VARCHAR2(100) PATH '$.first', 
      last_name VARCHAR2(100) PATH '$.last', 
      aka VARCHAR2(100) PATH '$.aka')
  ) AS jbios 
ORDER BY bios.id;
```

This emits the following dataset.

| ID  | NAME                    |
| --: | ----------------------- |
| 1   | John Backus             |
| 2   | John McCarthy           |
| 3   | Grace Hopper            |
| 4   | Kristen Nygaard         |
| 5   | Ole-Johan Dahl          |
| 6   | Guido van Rossum        |
| 7   | Dennis Ritchie          |
| 8   | Yukihiro Matz Matsumoto |
| 9   | James Gosling           |
| 10  | Martin Odersky          |

## Querying a single JSON attribute

Take a different scenario: you want only the last name of the people along with the `id` from the `bios` table. In such a case, projecting the `fname` column as a table is not required. Instead, you can use the `json_value` function to return the first name from the `fname` column.

```sql
SELECT 
  bios.id,
  json_value(
    bios.fname,
    '$.last' RETURNING VARCHAR2(100)
  ) first_name
FROM bios
ORDER BY bios.id;
```

This query emits the following dataset.

| ID  | FIRST_NAME |
| --: | ---------- |
| 1   | John       |
| 2   | John       |
| 3   | Grace      |
| 4   | Kristen    |
| 5   | Ole-Johan  |
| 6   | Guido      |
| 7   | Dennis     |
| 8   | Yukihiro   |
| 9   | James      |
| 10  | Martin     |

**Note** that the `json_value` function can only be used to return a scalar (i.e., not an object or collection) SQL data type.

Another use of the `json_value` function is while applying some filters based on a JSON attribute. For example, say you want to know the person who has a title as a recognition.

```sql
SELECT 
  bios.id,
  json_value(
    bios.fname,
    '$.last' RETURNING VARCHAR2(100)
  ) name
FROM  
  bios
WHERE json_value(
    bios.recognition,
    '$.title' RETURNING VARCHAR2(100)
  ) IS NOT NULL;
```

which emits the following dataset.

| ID  | NAME   |
| --: | ------ |
| 3   | Hopper |

## Querying a JSON object or collection

Unlike `json_value`, the `json_query` function can return collections and fragments of a JSON document. Say, you want the first item of the contributions and the name of the first award of each person.

```sql
SELECT
  bios.id,
  json_value(
    bios.fname,
    '$.last' RETURNING VARCHAR2(100)
  ) name,
  json_query(
    bios.contribs, 
    '$[0]' RETURNING VARCHAR2(500) WITH WRAPPER
  ) contribution,
  json_query(
    bios.recognition, 
    '$.awards[0].award' RETURNING VARCHAR2(500) WITH WRAPPER
  ) awards
FROM bios
ORDER BY bios.id;
```

which emits the following dataset.

| ID  | NAME       | CONTRIBUTION | AWARD                                          |
| --: | ---------- | ------------ | ---------------------------------------------- |
| 1   | Backus     | ["Fortran"]  | ["W.W. McDowell Award"]                        |
| 2   | McCarthy   | ["Lisp"]     | ["Turing Award"]                               |
| 3   | Hopper     | ["UNIVAC"]   | ["Computer Sciences Man of the Year"]          |
| 4   | Nygaard    | ["OOP"]      | ["Rosing Prize"]                               |
| 5   | Dahl       | ["OOP"]      | ["Rosing Prize"]                               |
| 6   | van Rossum | ["Python"]   | ["Award for the Advancement of Free Software"] |
| 7   | Ritchie    | ["UNIX"]     | ["Turing Award"]                               |
| 8   | Matsumoto  | ["Ruby"]     | ["Award for the Advancement of Free Software"] |
| 9   | Gosling    | ["Java"]     | ["The Economist Innovation Award"]             |
| 10  | Odersky    | ["Scala"]    | -                                              |

**Note** that
- you can treat the `json_value` and `json_query` functions as a special case of the `json_table` function.
- you can specify the format of the data returned by the `json_table`, `json_value` and `json_query` functions with `RETURNING` clause; if a value is boolean, you can return it as a boolean or string.
- if an attribute is repeated in a JSON document, Oracle may choose to match any one of those fields and ignore the rest.
- by default, Oracle matches the JSON attributes and collections with a [lax JSON syntax](https://docs.oracle.com/database/121/ADXDB/json.htm#GUID-1B6CFFBE-85FE-41DD-BA14-DD1DE73EAB20).

## References

- [Oracle docs](https://docs.oracle.com/database/121/ADXDB/json.htm)
