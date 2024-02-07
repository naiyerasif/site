---
slug: "2023/10/02/limiting-manual-changes-to-generated-numeric-columns-in-postgres"
title: "Limiting manual changes to generated numeric columns in Postgres"
description: "Generated numeric columns, like internal row IDs, should be protected from unauthorized insert and update actions for compliance and data consistency. Learn how to enforce this with Postgres."
date: 2023-10-02 23:17:42
update: 2023-10-14 13:26:00
category: "guide"
tags: ["database", "access", "sql"]
---

A generated numeric column is often used to keep the internal id of a row in a table. For compliance and consistency, you may want to restrict the insert and update operations on such columns. Such restrictions may outright disallow the insert and update operations, or allow them only through the approved generation mechanisms. Let's take a look at this with an example.

:::setup
The examples in this post use 

- Postgres 16 running in a Docker container
- `root` user as default, to create new tables and users, and grant permissions
:::

## Restricting changes with `GRANT`

Let's login with the `root` user in the Postgres instance and create a sample table, say `notes`, for our example.

```sql
create table notes (
	id      serial primary key,
	title   text not null,
	content text not null
);
```

Here, a `notes_id_seq` sequence generates the values for the `id` column. The `serial` keyword takes care of creating this sequence automatically for us.

Let's create a new user `jessica` and assign the permissions to perform `select` and `delete` operations on the `notes` table.

```sql {11, 12}
create user jessica with password 'drew';

-- select and delete permissions on notes table
grant select on notes to jessica;
grant delete on notes to jessica;

-- usage permission on sequence generating the id column for notes table
grant usage, select on notes_id_seq to jessica;

-- insert and update permissions on specific columns for notes table
grant insert (title, content) on notes to jessica;
grant update (title, content) on notes to jessica;
```

At the end, we allow `jessica` to insert and update the `notes` table. These permissions are on specific columns and not on the entire table. Also, the `id` column is missing from the list of columns with insert and update permissions.

When `jessica` tries to query the table or insert a record with the `title` and `content` columns, things will work as expected.

```sql
-- this works for jessica
select * from notes;

-- this also works for jessica
insert into notes (title, content)
values ('cauldron', 'brochete');
```

However, when `jessica` tries to insert or update a value on the `id` column, Postgres throws an error.

```sql
-- this won't work since jessica doesn't have insert access on `id` column
-- ERROR: permission denied for table notes
insert into notes (id, title, content)
values (2, 'solidity', 'abscissa');

-- this won't work either since jessica doesn't have update access on `id` column
-- ERROR: permission denied for table notes
update notes
set id = 0
where id = 1
and title = 'cauldron';
```

### Observations

- The `GRANT` based approach works not only with numeric but other types of columns as well.
- This approach requires a careful permission management since table level permissions can override the column level permissions.

	> Granting the privilege at the table level and then revoking it for one column will not do what one might wish: the table-level grant is unaffected by a column-level operation.
	> 
	> <cite>&mdash; [Postgres GRANT statement](https://www.postgresql.org/docs/current/sql-grant.html)</cite>

	For example, if you grant `jessica` all priviledges on the `notes` table, the column level restrictions will stop working.

	```sql
	grant all privileges on notes to jessica;

	-- now jessica can do this
	insert into notes (id, title, content)
	values (2, 'solidity', 'abscissa');
	```

- Error messages are generic; you need to look at the grants to understand why a statement wasn't working.
- Feedback about the error is received after you execute a statement.

## Restricting changes with Generated Identity column

Postgres also supports [Identity columns](https://en.wikipedia.org/wiki/Identity_column). Such a column has an implicit sequence attached to it. It is also `NOT NULL` implicitly. We can define the `id` column on the `notes` table as the identity column with the `GENERATED ALWAYS` clause. 

The `GENERATED ALWAYS` clause ensures that

- a user-specified value in the `insert` statement is accepted only with the `OVERRIDING SYSTEM VALUE` clause, or with `DEFAULT` value.
- any update on the column will be rejected except for the `DEFAULT` value.

Let's alter the `notes` table to see this in action.

```sql {7}
-- drop the default definiton of `id` column
alter table notes alter id drop default;

-- drop the `notes_id_seq` since it is no longer needed
drop sequence notes_id_seq;

alter table notes alter id add generated always as identity (start 3);
```

Since the `notes` table already has two records with the highest value of the `id` as `2`, we've to start the identity column from `3` so that the next `id` is inserted as `3`.

If `jessica` tries to update the `id` column of an existing record with a different numeric value, Postgres will throw an error.

```sql
-- this will still not work since `id` can only be update with `DEFAULT` value
-- ERROR: column "id" can only be updated to DEFAULT
-- Detail: Column "id" is an identity column defined as GENERATED ALWAYS.
update notes
set id = 0
where id = 1
and title = 'cauldron';
```

To prevent the error, `jessica` can use `DEFAULT` keyword to update an existing `id`. This will update the respective record with the next generated value from the implicit sequence associated with the identity column.

```sql
-- this will work since `id` is updated with `DEFAULT` value
update notes
set id = DEFAULT
where id = 1
and title = 'cauldron';
```

Similarly, inserting an explicit numeric value in the `id` column will also throw an error.

```sql
-- this throws error since `id` can only be auto-generated
-- ERROR: cannot insert a non-DEFAULT value into column "id"
-- Detail: Column "id" is an identity column defined as GENERATED ALWAYS.
-- Hint: Use OVERRIDING SYSTEM VALUE to override.
insert into notes (id, title, content)
values (4, 'maximus', 'tolerance');
```

However, the insert will work when the `DEFAULT` keyword is used. It will create a new record with the next generated value from the implicit sequence associated with the identity column.

```sql
-- this will work since the value inserted is `DEFAULT`
insert into notes (id, title, content)
values (DEFAULT, 'maximus', 'tolerance');
```

You can override this behavior with `OVERRIDING SYSTEM VALUE` clause. This should be generally avoided since it defeats the purpose of restricting the changes on the `id` column.

```sql
-- this will also work since we're using OVERRIDING SYSTEM VALUE
insert into notes (id, title, content)
overriding system value
values (5, 'aurelia', 'nonsce');
```

Note that you can't use `OVERRIDING SYSTEM VALUE` for the `update` statement.

### Observations

- Since the identity column definition is part of <abbr title="Data Definition Language">DDL</abbr>, it communicates the intent of restriction explicitly.
- A static analysis tool can show the error messages before you execute the statements.

	:::figure
	![Error overlay in DataGrip for identity column](/images/post/2023/2023-10-02-23-17-42-limiting-manual-changes-to-generated-numeric-columns-in-postgres-01.png)

	An overlay in DataGrip warning that only DEFAULT can be inserted into an identity column
	:::

- Error messages are specific and offer enough context to understand the issue.
- Identity columns are always attached with a sequence. Any column type that can't use a value from a sequence isn't eligible for this approach. 
  
	> You can get around this limitation by using an immutable custom generator function for your values paired with `GENERATED ALWAYS AS (<your_generator_function_name>) STORED` on your column.

---

**Related**

- [Postgres GRANT docs](https://www.postgresql.org/docs/current/sql-grant.html)
- [Postgres CREATE TABLE docs](https://www.postgresql.org/docs/current/sql-createtable.html)
