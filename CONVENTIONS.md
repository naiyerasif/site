# Conventions

**Version** `2026.2`

## Posts

Posts are immutable, except for minor corrections. A drastic change should be handled by publishing a new post, and archiving the existing one (with a redirect to the new post).

## Projects

- Use `<platform><version>-<subplatform>-<context>` to name the projects, for example, `springboot4-redis-pubsub`, `litestar2-oidc-auth`, and so on
- Use one of the [reserved example domains](https://www.rfc-editor.org/rfc/rfc2606.html) wherever a URL is needed. Prefer `example.com`
- Use `<reserved example domain>.<platform>.<context>` convention for Java package names, for example, `com.example.quarkus3.redis.pubsub`

## Placeholders

- Use either angle brackets (for example, `<placeholder>`), or variable-style notation (for example, `$placeholder`). Prefer latter, as it is easier to copy and paste.

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
- For book or paper citations, use this format: `<authors?>, <title> (<page>), <publisher> [<edition>]`. Include authors if identified by the source. The edition should be the year of publication (preferred) or the edition number specified by the source.

## Design System

Use RSL naming convention for CSS properties.

- Root properties are exports from a design tool (denoted with `--x` prefix)
- Semantic properties are derived from root properties (denoted with `--y` prefix). They are also used to expose APIs for a component.
- Local properties are internal to a component (denoted with `--z` prefix). They should never be modified outside the scope of a component in which they are defined.
