# Conventions

**Version** `2026.1`

These are the conventions I use throughout this site.

## Posts

Posts are immutable, except for minor corrections. If there's a drastic change, publish a new post, and mark the older version as archived with a redirect to new post.

## Project

- Name the projects with `<platform><version>-<subplatform>-<context>` pattern, for example, `springboot4-redis-pubsub`, `localstack4-aws-lambda-with-sqs`, and so on
- Use one of the [reserved example domains](https://www.rfc-editor.org/rfc/rfc2606.html) to prefix Java package names, such as `com.example` (default), `org.example`, or `net.example`
- Use `<reserved example domain>.<platform>.<context>` convention for Java package names, for example, `com.example.springboot3.redis.pubsub`

## Placeholder

- Use either angle brackets (for example, `<placeholder>`), or variable-style notation (for example, `$placeholder`). Prefer variable-style notation, as it is easier to copy and paste.

## Database

| Type                     | Value               |
| ------------------------ | ------------------- |
| **Database username**    | `gwen`              |
| **Database password**    | `stacy`             |
| **Database name**        | `northwind`         |
| **Database schema name** | `serenity`          |
| **Database users**       | `gizem`, `victoria` |

## Citations

- For link citations, use this format: `<authors?>, <link> [<timestamp?>]`. Include authors if identified by the source. Include a timestamp to indicate the recency. Include the publication date, or publication year if available.
- For book or paper citations, use this format: `<authors?>, <title>, <publisher> [<edition>]`. Include authors if identified by the source. The edition should be the year of publication (preferred) or the edition number specified by the source.

## Design System

Use RSL naming convention for CSS properties.

- Root properties are abstract exports from a design tool (denoted with `--x` prefix)
- Semantic properties are derived from root properties (denoted with `--y` prefix). They are also used to expose APIs for a component.
- Local properties are internally scoped to a component (denoted with `--z` prefix). They should never be modified outside the scope of a component in which they are defined.
