---
slug: "2024/02/18/cascading-drop-and-truncate-operations-in-postgres"
title: "Cascading DROP and TRUNCATE operations in Postgres"
description: "Did you know that you can cascade the DROP and TRUNCATE commands in Postgres to automatically remove dependent objects like foreign keys, domains, etc?"
date: 2024-02-18 00:24:48
update: 2024-02-18 00:24:48
type: "guide"
---

Today I learned that you can specify `CASCADE` on `DROP` and `TRUNCATE` statements in Postgres. This comes handy when you're dealing with the database objects which are references on other objects (for example, foreign keys, [domains](https://www.postgresql.org/docs/current/domains.html), etc).

Consider the following definitions of the `users` and `orders` tables.

```sql
-- create users and orders table
create table users (id serial primary key, name text not null);
create table orders (
	id serial primary key,
	user_id int references users (id),
	ordered_at timestamp not null default current_timestamp
);

-- insert some data
insert into users (name) values ('abbey'), ('rabia'), ('anne');
insert into orders (user_id) values (1), (2), (3), (1);
```

The `orders.user_id` column references the `users.id` column (a foreign key relationship). You can print this information with the `\d+ spring.orders` command on [`psql`](https://www.postgresql.org/docs/current/app-psql.html) (`spring` is the schema name here).

```psql prompt{1}
\d+ spring.orders
#                                       Table "spring.orders"
#  Column     |            Type             | Nullable |              Default               | Storage 
# ------------+-----------------------------+----------+------------------------------------+---------
#  id         | integer                     | not null | nextval('orders_id_seq'::regclass) | plain  
#  user_id    | integer                     |          |                                    | plain  
#  ordered_at | timestamp without time zone | not null | CURRENT_TIMESTAMP                  | plain  
# Indexes:
#     "orders_pkey" PRIMARY KEY, btree (id)
# Foreign-key constraints:
#     "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
# Access method: heap
```

The creation of the `users` and `orders` tables also creates two sequences automatically that generate the `id` columns (all thanks to the `serial` keyword).

```sql
select c.relname sequence_name
from pg_class c
where c.relkind = 'S'
order by c.relname;
#  sequence_name
# ---------------
#  orders_id_seq
#  users_id_seq
# (2 rows)
```

## Cascading the `DROP` operation

If you try to drop the `users` table, the database complains with the following error message.

```sql {4} prompt{1}
drop table users;
# ERROR:  cannot drop table users because other objects depend on it
# DETAIL:  constraint orders_user_id_fkey on table orders depends on table users
# HINT:  Use DROP ... CASCADE to drop the dependent objects too.
```

The last line of the error message nudges you to use `CASCADE` on the `DROP` statement which drops the foreign key reference from the `orders` table and lets you continue with the deletion of the `users` table.

```sql prompt{1}
drop table users cascade;
# NOTICE:  drop cascades to constraint orders_user_id_fkey on table orders
```

You can verify the removal of the foreign key reference from the `orders` table with the following command.

```psql prompt{1}
\d+ spring.orders
#                                       Table "spring.orders"
#  Column     |            Type             | Nullable |              Default               | Storage 
# ------------+-----------------------------+----------+------------------------------------+---------
#  id         | integer                     | not null | nextval('orders_id_seq'::regclass) | plain   
#  user_id    | integer                     |          |                                    | plain   
#  ordered_at | timestamp without time zone | not null | CURRENT_TIMESTAMP                  | plain
# Indexes:
#     "orders_pkey" PRIMARY KEY, btree (id)
# Access method: heap
```

Similarly, you can apply `CASCADE` while dropping other objects such as domains, checks, etc to automatically clean up the references on them.

## Cascading the `TRUNCATE` operation

Similarly, if you try to `TRUNCATE` the `users` table (instead of dropping it), the database complains with the following error message.

```sql {4} prompt{1}
truncate table users;
# ERROR:  cannot truncate a table referenced in a foreign key constraint
# DETAIL:  Table "orders" references "users".
# HINT:  Truncate table "orders" at the same time, or use TRUNCATE ... CASCADE.
```

Once again, the last line of the error message nudges you to use `CASCADE` on the `TRUNCATE` statement which will truncate both the `users` and `orders` tables.

```sql prompt{1}
truncate table users cascade;
# NOTICE:  truncate cascades to table "orders"
```

However, the preceding command won't reset the sequences associated with the `users.id` and `orders.id`. You can verify this behavior by querying the `last_value` of the sequences.

```sql
select last_value from orders_id_seq;
#  last_value
# ------------
#           4
# (1 row)

select last_value from users_id_seq;
#  last_value
# ------------
#           3
# (1 row)
```

This happens because the `TRUNCATE` runs with the `CONTINUE IDENTITY` clause by default, which, evident from to its name, doesn't change the values of sequences.

To reset the sequences, you can run the `TRUNCATE` with the `RESTART IDENTITY` clause.

```sql prompt{1}
truncate table users restart identity cascade;
# NOTICE:  truncate cascades to table "orders"
```

You can verify the `last_value` of the sequences which should be reset.

```sql
select last_value from users_id_seq;
#  last_value
# ------------
#           1
# (1 row)

select last_value from orders_id_seq;
#  last_value
# ------------
#           1
# (1 row)
```
