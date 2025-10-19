# Site conventions

**Version** `2025.4`

These are the conventions I use throughout this site.

## Project

- Use the `<platform><version>-<subplatform>-<context>` naming pattern for the projects, for example, `springboot3-redis-pubsub`, `localstack-aws-lambda-with-sqs`, and so on
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

This site uses RSL naming convention for CSS properties.

- Raw properties are abstract exports from a design tool (denoted with `--x` prefix)
- Semantic properties are derived from raw properties (denoted with `--y` prefix). They are also used to expose APIs for a component.
- Local properties are internally scoped to a component (denoted with `--z` prefix). They should never be modified outside the scope of a component in which they are defined.
