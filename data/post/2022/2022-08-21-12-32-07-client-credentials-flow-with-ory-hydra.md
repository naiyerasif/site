---
slug: "2022/08/21/client-credentials-flow-with-ory-hydra"
title: "Client Credentials flow with Ory Hydra"
date: 2022-08-21 12:32:07
update: 2025-12-24 14:44:18
type: "guide"
---

[Ory Hydra](https://github.com/ory/hydra) is an open source OAuth 2.0 and OpenID Connect server. It can issue and introspect tokens used by machine clients for server-to-server communication, making it perfect for locally testing how services access APIs. In this post, we'll setup Ory Hydra using Docker, register a client, and test the `client_credentials` flow using `curl`.

:::note{.setup}
The examples in this post use:

- Ory Hydra 25.4.0
- Docker 28.5.2
- Postgres 18
:::

Create a [Compose](https://docs.docker.com/compose/) file with the following details.

```yml title="compose.yml"
services:
  hydra:
    image: oryd/hydra:v25.4.0
    ports:
      - "4444:4444" # Public port
      - "4445:4445" # Admin port
      - "5555:5555" # Port for hydra token user
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
      - SECRETS_SYSTEM=secret_to_encrypt_database
    command: serve all --dev
    restart: unless-stopped
    depends_on:
      - hydra-migrate
    networks:
      - hydranet
  hydra-migrate:
    image: oryd/hydra:v25.4.0
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    command: migrate sql up -e --yes
    restart: on-failure
    depends_on:
      - postgresd
    networks:
      - hydranet
  postgresd:
    image: postgres:18-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=hydra
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=hydra
    networks:
      - hydranet

networks:
  hydranet:
```

There are three services configured here.

- `hydra` is the core service that exposes APIs for administration.
- `postgresd` is the database which persists the data created and managed by `hydra`; it is encrypted by a [secret](https://www.ory.com/docs/hydra/self-hosted/secrets-key-rotation) provided through `SECRETS_SYSTEM` environment variable.
- `hydra-migrate` service initializes database objects in `postgresd` required by `hydra`.

Launch the containers with `docker compose up -d` and verify their health; `postgresd` and `hydra` services should be running.

```sh prompt{1} output{2,3}
docker compose ps --services --status running
hydra
postgresd
```

## Testing the `client_credentials` flow

We can now interact with the [REST APIs](https://www.ory.com/docs/reference/api) exposed by `hydra` service using `curl`. Let's begin with creating a client by calling the `/admin/clients` endpoint.

```sh title="Creating an OAuth2 client" {3,5} prompt{1} output{2..46}
curl -X POST 'http://localhost:4445/admin/clients' --json '{ "access_token_strategy": "opaque", "client_name": "my_client", "client_secret": "my_secret", "grant_types": ["client_credentials"], "scope": "api" }'
{
	"client_id": "0938dd90-cf43-4d3d-85aa-966788fb6a36",
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
	"created_at": "2025-12-24T07:04:13Z",
	"updated_at": "2025-12-24T07:04:13.330955Z",
	"metadata": {},
	"registration_access_token": "ory_at_Bb7Vd1In_DbM_vu3zgiY1kxGhfOIwCxuNf6aQW9Wz-s.smijHGyKZhNhvyi5m6_9m-LYH_fhDmqfqObgLoEBtPY",
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

Once the client is created, we can use its client ID and client secret to request an access token, as shown below.

```sh title="Requesting a token" {3} prompt{1} output{2..7}
curl -u '0938dd90-cf43-4d3d-85aa-966788fb6a36:my_secret' -X POST 'http://localhost:4444/oauth2/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'grant_type=client_credentials&scope=api'
{
	"access_token": "ory_at_ywyGz7YRztzmCynmWvltuJYw54it-sc4QxovbDEI4uM.sHbtzfQchO_Ls7mF63923IW8Bn524TY8b_7VVSspkcU",
	"expires_in": 3599,
	"scope": "api",
	"token_type": "bearer"
}
```

We can now introspect this token using the `/admin/oauth2/introspect` endpoint which returns whether the token is currently active for use.

```sh title="Introspecting a token" {3} prompt{1} output{2..14}
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_ywyGz7YRztzmCynmWvltuJYw54it-sc4QxovbDEI4uM.sHbtzfQchO_Ls7mF63923IW8Bn524TY8b_7VVSspkcU&scop=api'
{
	"active": true,
	"scope": "api",
	"client_id": "0938dd90-cf43-4d3d-85aa-966788fb6a36",
	"sub": "0938dd90-cf43-4d3d-85aa-966788fb6a36",
	"exp": 1766563574,
	"iat": 1766559974,
	"nbf": 1766559974,
	"aud": [],
	"iss": "http://0.0.0.0:4444/",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

Now, if we delete all active tokens,

```sh prompt{1}
curl -X DELETE 'http://localhost:4445/admin/oauth2/tokens?client_id=0938dd90-cf43-4d3d-85aa-966788fb6a36'
```

...and introspect the previous token again, the API returns the `active` flag as `false`.

```sh title="Introspecting inactive token" {3} prompt{1} output{2..4}
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_ywyGz7YRztzmCynmWvltuJYw54it-sc4QxovbDEI4uM.sHbtzfQchO_Ls7mF63923IW8Bn524TY8b_7VVSspkcU&scop=api'
{
	"active": false
}
```

## Outro

- Besides Postgres, Ory Hydra also works with other databases. Check the quickstart Compose files available on [GitHub](https://github.com/ory/hydra) for examples using MySQL, SQLite, and so on.
- Beyond `client_credentials`, Ory Hydra also implements other OAuth2 flows, including `implicit`, `authorization_code`, `refresh_token`, and `device_authorization`. The official [quickstart](https://www.ory.com/docs/hydra/self-hosted/quickstart) tutorial showcases the `authorization_code` based flow.
- You can also pass a `hydra.yml` [configuration](https://www.ory.com/docs/hydra/reference/configuration) file to customize the behavior of Ory Hydra. In this post, we've used the default configuration.

---

**Previous versions**

- [:time[2022-08-21T12:32:07]](/archive/2022/08/21/client-credentials-flow-with-ory-hydra--1): Discusses client credentials flow with Ory Hydra 1

**Source code**

- [ory-hydra-25--client-credentials-flow](https://github.com/Microflash/backstage/tree/main/misc/ory-hydra-25--client-credentials-flow)

**Related**

- [Introduction to Ory Hydra OAuth2](https://www.ory.com/docs/oauth2-oidc)
- [Ory APIs](https://www.ory.com/docs/reference/api)
