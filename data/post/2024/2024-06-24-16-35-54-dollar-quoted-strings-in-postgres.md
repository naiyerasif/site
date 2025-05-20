---
slug: "2024/06/24/dollar-quoted-strings-in-postgres"
title: "Dollar-quoted strings in Postgres"
date: 2024-06-24 16:35:54
update: 2024-06-24 16:35:54
type: "note"
---

Today I learned that you can have multi-line strings in Postgres using [dollar-quoted strings](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING).

```pgsql
SELECT $$This is
a multi-line string with 'quotes'$$ as multi_line_string;
```

This works because Postgres writes the content between the dollar-quotes literally without any escaping. You can even nest them, and disambiguate them by optionally adding tags between the dollar signs.

```pgsql
$function$
BEGIN
  RETURN $json${
		"status": "UP"
	}$json$::jsonb;
END;
$function$
```

Dollar-quoting is not an SQL standard, but it is pretty useful when dealing with complex strings. For example, it cuts away much noise (usually due to escaping) in an otherwise usual string containing a large JSON object.
