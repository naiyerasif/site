---
slug: "post/2022/08/21/client-credentials-flow-with-ory-hydra"
title: "Client Credentials flow with Ory Hydra"
date: 2022-08-21 12:32:07
update: 2026-08-22 19:48:51
category: "guide"
---

[Ory Hydra](https://github.com/ory/hydra) is an open source OAuth 2.0 and OpenID Connect server. It issues and introspects tokens for machine clients which communicate server-to-server, making it well-suited for testing how services access APIs using `client_credentials` on a local machine.

In this post, we'll setup Ory Hydra using Docker, register a client, and test the `client_credentials` flow using `curl`.

:::note{title="Environment"}
- Ory Hydra 26.2.0
- Docker 29.4.0
- Postgres 18
:::

Create a `compose.yml` file with the following setup.

```yml title="compose.yml"
services:
  hydra:
    image: oryd/hydra:v26.2.0-distroless
    ports:
      - "4444:4444" # Public port
      - "4445:4445" # Admin port
      - "5555:5555" # Port for hydra token user
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
      - SECRETS_SYSTEM=secret_to_encrypt_database # See https://www.ory.com/docs/hydra/self-hosted/secrets-key-rotation
    command: serve all --dev
    restart: unless-stopped
    depends_on:
      hydra-migrate:
        condition: service_completed_successfully
    networks:
      - hydranet
  hydra-migrate:
    image: oryd/hydra:v26.2.0-distroless
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    command: migrate sql up -e --yes
    restart: on-failure
    depends_on:
      postgresd:
        condition: service_healthy
    networks:
      - hydranet
  postgresd:
    image: postgres:18-alpine
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "hydra"]
      interval: 1s
      timeout: 30s
      retries: 30
    environment:
      - PGUSER=hydra
      - POSTGRES_USER=hydra
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=hydra
    networks:
      - hydranet

networks:
  hydranet:
```

There are three services configured here:

- `hydra` is the core service that exposes a public API for requesting tokens, and an admin API for managing clients and inspecting tokens.
- `postgresd` is the Postgres database which persists the data created and managed by `hydra`. It's encrypted by a [secret](https://www.ory.com/docs/hydra/self-hosted/secrets-key-rotation) set through `SECRETS_SYSTEM` environment variable.
- `hydra-migrate` runs once to set up the database schema `hydra` depends on, then exits.

:::deter
`serve all --dev` relaxes a handful of security checks. Combined with the hardcoded `secret` database password, this setup is specifically optimized to make local testing easier. Follow Ory's [production guide](https://www.ory.com/docs/hydra/self-hosted/production) for a secure setup.
:::

Launch the containers with `docker compose up -d` and do a quick check to verify that `hydra` and `postgresd` came up healthy:

```sh prompt{1} output{2,3}
docker compose ps --services --status running
hydra
postgresd
```

## Registering a client

Using the admin [API](https://www.ory.com/docs/reference/api), we can register a client authorized for the `client_credentials` grant like this:

```sh title="Creating an OAuth2 client" {3,5} prompt{1} output{2..46}
curl -X POST 'http://localhost:4445/admin/clients' --json '{ "access_token_strategy": "opaque", "client_name": "my_client", "client_secret": "my_secret", "grant_types": ["client_credentials"], "scope": "api" }'
{
	"client_id": "ae3f49c7-d656-4e7f-9351-e18564bafc1e",
	"client_name": "my_client",
	"client_secret": "my_secret",
	"redirect_uris": null,
	"grant_types": [
		"client_credentials"
	],
	"response_types": null,
	"scope": "api",
	"audience": [],
	"owner": "",
	"policy_uri": "",
	"allowed_cors_origins": [],
	"tos_uri": "",
	"client_uri": "",
	"logo_uri": "",
	"contacts": null,
	"client_secret_expires_at": 0,
	"subject_type": "public",
	"jwks": {},
	"token_endpoint_auth_method": "client_secret_basic",
	"userinfo_signed_response_alg": "none",
	"created_at": "2026-08-22T14:11:03Z",
	"updated_at": "2026-08-22T14:11:02.802763Z",
	"metadata": {},
	"registration_access_token": "ory_at_MO2HoS0Fk2UGMN7zursOnhsk94jAB9TpCpOgyn1VORc.thO1w5APNMwiwhzELgfQsndi6EdsU-0SNa-7MSLATZo",
	"registration_client_uri": "http://0.0.0.0:4444/oauth2/register",
	"access_token_strategy": "opaque",
	"skip_consent": false,
	"skip_logout_consent": null,
	"authorization_code_grant_access_token_lifespan": null,
	"authorization_code_grant_id_token_lifespan": null,
	"authorization_code_grant_refresh_token_lifespan": null,
	"client_credentials_grant_access_token_lifespan": null,
	"implicit_grant_access_token_lifespan": null,
	"implicit_grant_id_token_lifespan": null,
	"jwt_bearer_grant_access_token_lifespan": null,
	"refresh_token_grant_id_token_lifespan": null,
	"refresh_token_grant_access_token_lifespan": null,
	"refresh_token_grant_refresh_token_lifespan": null,
	"device_authorization_grant_id_token_lifespan": null,
	"device_authorization_grant_access_token_lifespan": null,
	"device_authorization_grant_refresh_token_lifespan": null
}
```

The `client_id` and `client_secret` from this response are what we'll use next to get a token.

## Getting an access token

We can now request a token as follows:

```sh title="Requesting a token" {3} prompt{1} output{2..7}
curl -u 'ae3f49c7-d656-4e7f-9351-e18564bafc1e:my_secret' -X POST 'http://localhost:4444/oauth2/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'grant_type=client_credentials&scope=api'
{
	"access_token": "ory_at_c2aC8WgvzJGfb2PLUuTqpnHfG8CBgvfuluEwkJ86eU4.9605IOjblFFfNU1Z-41uc_fkIkNMxeTVIYGYrFoHA3Y",
	"expires_in": 3599,
	"scope": "api",
	"token_type": "bearer"
}
```

Ory Hydra returns an opaque bearer token valid for an hour.

## Introspecting the token

Any service that accepts this token can check whether it's still valid by calling `/admin/oauth2/introspect` endpoint:

```sh title="Introspecting a token" {3} prompt{1} output{2..14}
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_c2aC8WgvzJGfb2PLUuTqpnHfG8CBgvfuluEwkJ86eU4.9605IOjblFFfNU1Z-41uc_fkIkNMxeTVIYGYrFoHA3Y&scop=api'
{
	"active": true,
	"scope": "api",
	"client_id": "ae3f49c7-d656-4e7f-9351-e18564bafc1e",
	"sub": "ae3f49c7-d656-4e7f-9351-e18564bafc1e",
	"exp": 1787411590,
	"iat": 1787407990,
	"nbf": 1787407990,
	"aud": [],
	"iss": "http://0.0.0.0:4444/",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

`active: true` confirms the token is good, along with which client it belongs to.

## Revoking the token

Now, if we delete all active tokens specific to this client,

```sh prompt{1}
curl -X DELETE 'http://localhost:4445/admin/oauth2/tokens?client_id=ae3f49c7-d656-4e7f-9351-e18564bafc1e'
```

...and introspect the same token again, we get `active: false`, confirming it no longer works.

```sh title="Introspecting inactive token" {3} prompt{1} output{2..4}
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_c2aC8WgvzJGfb2PLUuTqpnHfG8CBgvfuluEwkJ86eU4.9605IOjblFFfNU1Z-41uc_fkIkNMxeTVIYGYrFoHA3Y&scop=api'
{
	"active": false
}
```

## Outro

- Besides Postgres, Ory Hydra also works with other databases&mdash;the [quickstart compose files](https://github.com/ory/hydra) include examples for MySQL and SQLite.
- `client_credentials` is one of several flows Ory Hydra supports, alongside `implicit`, `authorization_code`, `refresh_token`, and `device_authorization`. The official [quickstart](https://www.ory.com/docs/oel/hydra/quickstart) tutorial walks through `authorization_code` based flow.
- To customize the behavior of Ory Hydra beyond the defaults used in this post, we can use a `hydra.yml` [configuration file](https://www.ory.com/docs/self-hosted/oel/oauth2/configuration).

---

**Source code**

- [hydra26-client-credentials-flow](https://github.com/naiyerasif/backstage/tree/main/miscellaneous/hydra26-client-credentials-flow)

**Related**

- [Introduction to Ory Hydra for Ory Network](https://www.ory.com/docs/network/hydra)
- [Ory APIs](https://www.ory.com/docs/reference/api)
