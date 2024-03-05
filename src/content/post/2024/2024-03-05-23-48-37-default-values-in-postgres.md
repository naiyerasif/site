---
slug: "2024/03/05/default-values-in-postgres"
title: "Default values in Postgres"
description: "Setting a default value for a column in Postgres reduces the manual input during inserts and updates. It also ensures consistency in column initialization."
date: 2024-03-05 23:48:37
update: 2024-03-05 23:48:37
category: "note"
---

You can set a default value for a column in Postgres. They help initializing columns consistently, and simplify the insert and update statements while manipulating the data.

For example, you can set a default value of the `created_date` and `modified_date` columns of a table, say `todos`.

```sql {4,5}
create table todos (
	id serial primary key,
	content text not null,
	created_date timestamp not null default current_timestamp,
	modified_date timestamp not null default current_timestamp
);
```

Postgres automatically fills the values of these columns when you insert a record in the table only with the value for the `content` column.

```sql prompt{1, 3}
insert into todos (content) values ('update password');

select * from todos;
#  id |     content     |        created_date        |       modified_date
# ----+-----------------+----------------------------+----------------------------
#   1 | update password | 2024-03-05 18:38:04.827387 | 2024-03-05 18:38:04.827387
```

You can even use `DEFAULT` to populate the values, if needed. For example, when you edit an existing value of the `content` column, you might want to update the `modified_date` with the latest timestamp.

```sql {3} prompt{6}
update todos
set content = 'autorotate password',
    modified_date = default
where id = 1;

select * from todos;
#  id |       content       |        created_date        |       modified_date
# ----+---------------------+----------------------------+---------------------------
#   1 | autorotate password | 2024-03-05 18:38:04.827387 | 2024-03-05 18:44:49.64779
```

If every column of a table has a default value specified, you can insert a new record with just the default values without specifying them explicitly for each column.

```sql {11} prompt{2,11,13}
-- enable extension to generate UUID
create extension if not exists "uuid-ossp";

create table product_refs (
	id serial primary key,
	guid uuid not null default uuid_generate_v1(),
	created_date timestamp not null default current_timestamp
);

-- insert a new row with default values
insert into product_refs default values;

select * from product_refs;
#  id |                 guid                 |        created_date
# ----+--------------------------------------+----------------------------
#   1 | f8008256-db21-11ee-bf4d-0242c0a8cf02 | 2024-03-05 18:55:43.623872
```

You might have noticed that even though we've not specified a `default` on the `product_refs.id` column here, it does get populated automatically. This is because `id serial` is a shorthand for `id integer DEFAULT nextval('product_refs_id_seq')`. Postgres automatically generates the `product_refs_id_seq` sequence and sets it's next value as default for the `id` column.
