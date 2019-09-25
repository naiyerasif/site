---
title: Querying JSON documents in Oracle
path: /querying-json-documents-in-oracle
date: 2019-09-18
updated: 2019-09-18
author: [naiyer]
summary: Query a JSON document stored as a CLOB in an Oracle database
tags: ['guide', 'oracle']
---

## Intent

The intent of this guide is to find a way to query over JSON documents stored as CLOB objects in an Oracle database. 

### Setup

> This guide uses
> - Oracle 12c

If you've got Oracle 12c installed on your machine, you're good to go. If not, you can install it by downloading it from [here](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html). If you just want to try out this guide, login at [Oracle Live SQL](https://livesql.oracle.com) which provides free Oracle environment for you to play with.

> **Note** that the functions used in this guide are available only in Oracle 12c onwards.

For the examples in this guide, you'll use data from mongoDB's [bios example collection](https://docs.mongodb.com/manual/reference/bios-example-collection/).

### Table of Contents

## Create a relation

Start by creating a schema that would store JSON documents as CLOB objects.

```sql
CREATE TABLE BIOS (
  id INTEGER PRIMARY KEY,
  fname CLOB,
  contribs CLOB,
  recognition CLOB
);
```

You can even apply constraints which will ensure that `fname`, `contribs` and `recognition` are valid JSONs as follows.

```sql
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

> **Note** that adding an `IS JSON` constraint can reduce the performance of insertion; use it only when you're not entirely sure if the inserted data will be a JSON document.

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

## Design the query

### `json_table` function

Now that your relation is ready, it is time to design a few queries. You'll use `json_table` function to create a relational representation of JSON documents. Say, you want a list of names ordered by their `id`.

```sql
SELECT 
  bios.id, 
  CASE 
    WHEN j.aka IS NOT NULL 
    THEN j.first_name || ' ' || j.aka || ' ' || j.last_name 
    WHEN j.aka IS NULL 
    THEN j.first_name || ' ' || j.last_name 
  END AS name
FROM  
  bios,  
  json_table(
    bios.fname, 
    '$[*]' columns (
      first_name VARCHAR2(100) PATH '$.first', 
      last_name VARCHAR2(100) PATH '$.last', 
      aka VARCHAR2(100) PATH '$.aka')
  ) AS j 
ORDER BY bios.id;
```

which emits the following dataset.

| ID  | NAME                    |
| --- | ----------------------- |
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

Here, `json_table` is being used to project the JSON documents in a relation.
- A column `bios.fname` (using `$[*]` path expression) is selected for the projection. 
- Column names and their corresponding paths are specified for different attributes.
- Finally the outcome of this projection is given a name `j`.

### `json_value` function

In a different scenario, you may not want a list of names but only the first name of all people. In this case, you don't need to project the entire JSON; instead you can return only the first name using `json_value` function as follows.

```sql
SELECT 
    bios.id,
    json_value(
        bios.fname,
        '$.first' RETURNING VARCHAR2(100)
    ) first_name
FROM bios
ORDER BY bios.id;
```

which emits the following dataset.

| ID  | FIRST_NAME |
| --- | ---------- |
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

> **Note** that 
> - `json_value` can only be used to return a scalar (i.e, not an object or collection) SQL data type.
> - you can specify the format of the data which is being returned by `json_table` and `json_query` functions; if a value is boolean, you can return it as a boolean or string. 

`json_value` function is especially useful when you want to apply some filters based on a JSON attribute but don't want to project the entire JSON. For example, say want to know the person who has a title as a recognition. `json_value` function comes handy in applying such a filter.

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
  ) is not null;
```

which emits the following dataset.

| ID  | NAME   |
| --- | ------ |
| 3   | Hopper |

### `json_query` function

Unlike `json_value`, `json_query` function can return collections and fragments of a JSON document. Say, you want the first item of contributions of each person.

```sql
SELECT 
  bios.id,
  json_value(
    bios.fname,
    '$.last' RETURNING VARCHAR2(100)
  ) name,
  json_query(
    bios.recognition, 
    '$.awards[*].award' RETURNING VARCHAR2(500) WITH WRAPPER
  ) awards
FROM  
  bios 
ORDER BY bios.id;
```

which emits the following dataset.

| ID  | NAME       | AWARDS                                                                                                             |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Backus     | ["W.W. McDowell Award","National Medal of Science","Turing Award","Draper Prize"]                                  |
| 2   | McCarthy   | ["Turing Award","Kyoto Prize","National Medal of Science"]                                                         |
| 3   | Hopper     | ["Computer Sciences Man of the Year","Distinguished Fellow","W. W. McDowell Award","National Medal of Technology"] |
| 4   | Nygaard    | ["Rosing Prize","Turing Award","IEEE John von Neumann Medal"]                                                      |
| 5   | Dahl       | ["Rosing Prize","Turing Award","IEEE John von Neumann Medal"]                                                      |
| 6   | van Rossum | ["Award for the Advancement of Free Software","NLUUG Award"]                                                       |
| 7   | Ritchie    | ["Turing Award","National Medal of Technology","Japan Prize"]                                                      |
| 8   | Matsumoto  | ["Award for the Advancement of Free Software"]                                                                     |
| 9   | Gosling    | ["The Economist Innovation Award","Officer of the Order of Canada"]                                                |
| 10  | Odersky    | -                                                                                                                  |

## A few things to note

- `json_query` and `json_value` can be treated as a special case of `json_table`.
- All these functions use [Oracle JSON Path Expressions](https://docs.oracle.com/database/121/ADXDB/json.htm#ADXDB6254), subject to certain [relaxations](https://docs.oracle.com/database/121/ADXDB/json.htm#GUID-951A61D5-EDC2-4E30-A20C-AE2AE7605C77), to match JSON attributes. By default, Oracle matches with a lax syntax.
- If a field name is repeated in a JSON document, Oracle may choose to match any one of those fields and ignore the rest.

## References

> [Oracle docs](https://docs.oracle.com/database/121/ADXDB/json.htm)