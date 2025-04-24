---
slug: "2024/09/04/stop-using-serial-in-postgres"
title: "Stop using SERIAL in Postgres"
description: "Postgres has supported identity columns since version 10. Use them instead of SERIAL for a better experience."
date: 2024-09-04 23:26:50
update: 2024-09-05 19:57:21
type: "opinion"
tagline: "Use identity columns instead."
---

**TL;DR** &mdash; Just stop. [Don't use `serial`](https://wiki.postgresql.org/wiki/Don%27t_Do_This#Don.27t_use_serial). Postgres has supported [identity columns](https://en.wikipedia.org/wiki/Identity_column) since version 10, released in 2017. Use them instead of `serial` and move on.

---

**Curious for more details? Here is the long version!**

Internally, Postgres generates a sequence for both `serial` and identity columns, using the convention `<table_name>_<column_name>_seq`. But the way it manages these sequences is where things get interesting. We'll uncover these differences as we explore the issues with `serial` and how identity columns solve them.

## Issues and quirks with `serial`

### `serial` has issues with permissions

Picture this: the database owner `victoria` creates a table like this:

```sql title="Schema definition of events table"
create table events (
	id serial primary key,
	created_at timestamptz not null default current_timestamp
);
```

They grant all privileges to another user `gizem`. But when `gizem` tries to insert or update a row, they get this error:

```sql prompt{1} output{2} {2}
insert into events default values;
-- ERROR: permission denied for sequence events_id_seq
```

The fix? Just grant usage permission on the sequence generating the `id` column:

```sql
grant usage on sequence events_id_seq to gizem;
```

Or, switch to an identity column. If the last `id` value was 99, here is how:

```sql title="Migrating to identity column"
drop sequence events_id_seq cascade;
alter table events alter column id add generated always as identity (restart 100);
```

### `serial` lacks integrity guarantees

Let's take this table.

```sql
create table pings (
	id serial primary key,
	last_ping timestamptz not null default current_timestamp
);
```

Insert a row with:

```sql
insert into pings values (1, default);
```

The row gets added with `id` as 1. Now try this:

```sql prompt{1} output{2,3} {2,3}
insert into pings default values;
-- ERROR: duplicate key value violates unique constraint "pings_pkey"
-- DETAIL: Key (id)=(1) already exists.
```

What happened? The first insert with `id` as 1 didn't advance the sequence. Postgres didn't issue any warning or error.

Now, let's try the same thing with an identity column.

```sql output{7..9} {7..9}
create table pings2 (
	id int generated always as identity primary key,
	last_ping timestamptz not null default current_timestamp
);

insert into pings2 values (1, default);
-- ERROR: cannot insert a non-DEFAULT value into column "id"
-- DETAIL: Column "id" is an identity column defined as GENERATED ALWAYS.
-- HINT: Use OVERRIDING SYSTEM VALUE to override.
```

This time you get a friendly error explaining why the insert failed. You also get a dangerous hint about overriding the system value. _Ignore that hint._

---

Something similar happens when you _accidentally_ drop the `pings_id_seq` (hey, we all make mistakes 🤷):

```sql prompt{1} output{2} {2}
drop sequence pings_id_seq cascade;
-- NOTICE: drop cascades to default value for column id of table pings
```

Postgres gives you a notice but doesn't stop you. As a result, you end up with the `default` removed from the `id` column.

```sql ins{3} del{2}
create table pings (
	id integer primary key not null default nextval('pings_id_seq'::regclass),
	id integer primary key not null,
	last_ping timestamptz not null default current_timestamp
);
```

This is probably not something you want on a primary key. Worse, you cannot revert the `id` column back to `serial`. Instead, you will need to create a new sequence and manually alter the column with `alter table ... set default`. It is quite a hassle!

Now, let's try this with identity column.

```sql prompt{1} output{2,3} {2,3}
drop sequence pings2_id_seq cascade;
-- ERROR: cannot drop sequence pings2_id_seq because column id of table pings2 requires it
-- Hint: You can drop column id of table pings2 instead.
```

Postgres helpfully explains why you can't drop the sequence associated with the identity column. Just like before, you get a dangerous hint about dropping the `id` column. _Pretend you didn't see it._

### `serial` is not a true type

When you create a table with a `serial` column like this:

```sql
create table events (
	id serial primary key,
	created_at timestamptz not null default current_timestamp
);
```

Postgres parses it as:

```sql title="Schema definition of events table"
create sequence events_id_seq as integer;
create table events (
	id integer primary key not null default nextval('events_id_seq'::regclass),
	created_at timestamp with time zone not null default current_timestamp
);
alter sequence events_id_seq owned by events.id;
```

Can you spot `serial` now?

The only clue is the `default` set on the `id` column, and the fact that it owns the sequence `events_id_seq`. 

:::assert
Postgres sets the `owned by` relationship this way to ensure the sequence is automatically dropped if you delete the `id` column or the `events` table with a `drop..cascade` statement.
:::

Using identity columns, you can create the same table as follows.

```sql
create table events2 (
	id int generated always as identity primary key,
	created_at timestamptz not null default current_timestamp
);
```

Here, Postgres will create a sequence named `events2_id_seq`, owned by `events2.id` column. But unlike with `serial`, the `generated always as identity` part stays visible in the schema definition. So, when you look at the `events2` table, you can still see the `identity` keyword &mdash; nothing gets lost in translation!

```sql title="Schema definition of events2 table"
create table events2 (
	id integer generated always as identity primary key,
	created_at timestamp with time zone not null default current_timestamp
);
```

### `serial` has awkward ergonomics

If you want to restart the `id` column at 100 in the `events` table (which is using `serial`), you'll have to fiddle with the sequence:

```sql title="Restarting the serial"
alter sequence events_id_seq restart 100;
```

With identity column on `events2` table, you change the column itself:

```sql title="Restarting the identity column"
alter table events2 alter column id restart with 100;
```

Here, the database handles everything behind the scenes. No more wrestling with sequences!

---

If you create a new table copying the schema definition from the `events` table,

```sql
create table return_events (like events including all);
```

the `id` column of the new table still points to the original sequence:

```sql
create table return_events (
	id integer primary key not null default nextval('events_id_seq'::regclass),
	created_at timestamptz not null default current_timestamp
);
```

And the `events_id_seq` is still owned by the `id` column of the `events` table. If you `drop` the `events` table with a `cascade`, the `default` from the `return_events` table gets removed.

```sql del{2} ins{3}
create table return_events (
	id integer primary key not null default nextval('events_id_seq'::regclass),
	id integer primary key not null,
	created_at timestamptz not null default current_timestamp
);
```

This is messy because you still want a sequence generating the `id` in the `return_events` table.

When you copy the schema definition of a table with an identity column, Postgres creates a _new_ sequence for the new table. Dropping the original table won't affect the new one at all.

### `serial` is not an SQL standard

It is a convenience _specific_ to Postgres. If you ever need to migrate away from Postgres, dealing with `serial` might involve some weekend work.

By contrast, the identity columns _are_ SQL standard.

## Outro

`serial` has many other quirks. While you can still use it, why not give identity columns a whirl? They're SQL standard, offer better ergonomics, and come with built-in safety guarantees. They will simplify your work and help avoid many paper cuts you would otherwise face with `serial`.
