---
slug: "2022/08/21/client-credentials-flow-with-ory-hydra--1"
title: "Client Credentials flow with Ory Hydra"
description: "Ory Hydra is an open source implementation of the OAuth 2.0 Authorization and OpenID Connect Core 1.0 frameworks. Learn to set it up using Docker, create a client and test a Client Credentials flow."
date: 2022-08-21 12:32:07
update: 2022-08-21 12:32:07
category: "guide"
tags: ["security", "oidc", "oauth2"]
---

:::warn{title="Archived post"}
This post covers the use of Ory Hydra 1.11.9, but the information provided here is not applicable to Ory Hydra 2. Please consult [the updated version of this post](/post/2022/08/21/client-credentials-flow-with-ory-hydra), which specifically addresses the client credentials flow using Ory Hydra 2.
:::

[Ory Hydra](https://github.com/ory/hydra) is an open source OpenID Connect Provider. It implements OAuth 2.0 Authorization Framework and the OpenID Connect Core 1.0 framework. It can issue OAuth 2.0 Access, Refresh, and ID tokens. This can be useful to test the token flow during the development on a local machine. In this post, we'll setup Hydra using Docker, create a client and test a `client_credentials` flow through Hydra CLI and `curl`.

:::setup
The code written for this post uses:

- Docker Engine 20.10.17
- Ory Hydra 1.11.9
- Postgres 9.6
:::

## Configure Ory Hydra

Create a [Docker Compose](https://docs.docker.com/compose/) file with the following details.

```yml caption='quickstart.yml'
version: "3.7"

services:

  hydra:
    image: oryd/hydra:v1.11.9
    ports:
      - "4444:4444" # Public port
      - "4445:4445" # Admin port
      - "5555:5555" # Port for hydra token user
    command: serve all --dangerous-force-http
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    restart: unless-stopped
    depends_on:
      - hydra-migrate
    networks:
      - hydranet

  hydra-migrate:
    image: oryd/hydra:v1.11.9
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    command: migrate sql -e --yes
    restart: on-failure
    networks:
      - hydranet

  postgresd:
    image: postgres:9.6
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

This is a modified version of the [Compose file](https://github.com/ory/hydra/blob/master/quickstart.yml) available on Hydra repository. There are 3 services configured here.

- `postgresd` is the database which stores the details required by Hydra
- `hydra-migrate` initializes the necessary tables and database objects required by Hydra to store the necessary details
- `hydra` is the service that creates the APIs for token management, etc

Launch the containers with the following command.

```sh prompt{1}
docker-compose -f quickstart.yml up --build
```

This command builds the containers and launch them. You can open a new terminal and verify the health of all the containers. The services `postgresd` and `hydra` should be up and running.

```sh prompt{1}
docker ps
CONTAINER ID   IMAGE                COMMAND                  CREATED          STATUS          PORTS                                                      NAMES
223ca5b3d9fa   oryd/hydra:v1.11.9   "hydra serve all --d…"   28 seconds ago   Up 25 seconds   0.0.0.0:4444-4445->4444-4445/tcp, 0.0.0.0:5555->5555/tcp   hydra-client-credentials-hydra-1
26af918199dd   postgres:9.6         "docker-entrypoint.s…"   28 seconds ago   Up 26 seconds   0.0.0.0:5432->5432/tcp                                     hydra-client-credentials-postgresd-1
```

## Client Credentials flow with Hydra CLI

You can test Hydra using Hydra CLI available in the `hydra` container.

Let's start by creating a client. Since we're testing the Client Credentials flow, specify the `client_credentials` as a grant type.


```sh prompt{1} caption='Creating a client'
docker-compose -f quickstart.yml exec hydra hydra clients create --endpoint http://localhost:4445/ --id my-client --secret my-secret --grant-types client_credentials --scope api
You should not provide secrets using command line flags, the secret might leak to bash history and similar systems
OAuth 2.0 Client ID: my-client
```

:::warn
> You should not provide secrets using command line flags, the secret might leak to bash history and similar systems

In production, the secrets should be fetched from a secure source such as AWS SecretsManager, HashiCorp Vault, etc. For local development, you can ignore this error.
:::

With this client, you can now generate a token.

```sh prompt{1} caption='Generating a token'
docker-compose -f quickstart.yml exec hydra hydra token client --endpoint http://localhost:4444/ --client-id my-client --client-secret my-secret
vRm9SR63-7vuhdMhZs72PT9Uhj4HQXCL3QrKVRja_yI.jpXIW0ichJFr4ANUSMVvXwL7CFEuNmCQNdUU6FgkGHc
```

When you introspect this token, you'll receive the [response](https://www.ory.sh/docs/reference/api#operation/adminIntrospectOAuth2Token) whether the token is active.

```sh prompt{1} caption='Introspecting a token'
docker-compose -f quickstart.yml exec hydra hydra token introspect --endpoint http://localhost:4445/ vRm9SR63-7vuhdMhZs72PT9Uhj4HQXCL3QrKVRja_yI.jpXIW0ichJFr4ANUSMVvXwL7CFEuNmCQNdUU6FgkGHc
{
	"active": true,
	"aud": [],
	"client_id": "my-client",
	"exp": 1661071059,
	"iat": 1661067458,
	"iss": "http://localhost:4444/",
	"nbf": 1661067458,
	"sub": "my-client",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

If the token isn't active, the `active` flag returns as `false`.

```sh prompt{1}
docker-compose -f quickstart.yml exec hydra hydra token introspect --endpoint http://localhost:4445/ vRm9SR63-7vuhdMhZs72PT9Uhj4HQXCL3QrKVRja_yI.jpXIW0ichJFr4ANUSMVvXwL7CFEuNmCQNdUU6FgkGHd
{
	"active": false,
	"aud": null
}
```

## Client Credentials flow with `curl`

Although Hydra CLI is convenient, it's not practical when the applications need to communicate through API calls using HTTP. Hydra exposes REST endpoints for this purpose documented in its [API reference](https://www.ory.sh/docs/reference/api). Let's explore how this works with `curl`.

You can create a client by calling the `/clients` endpoint which is a part of the admin API. Once again, specify the `client_credentials` as a grant type.

```sh prompt{1} caption='Creating a client'
curl -X POST 'http://localhost:4445/clients' -H 'Content-Type: application/json' --data-raw '{ "client_id": "my-client-2", "client_name": "MyClientApp", "client_secret": "my-secret-2", "grant_types": ["client_credentials"], "scope": "api" }'
{
	"client_id": "my-client-2",
	"client_name": "MyClientApp",
	"client_secret": "my-secret-2",
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
	"created_at": "2022-08-21T09:46:40Z",
	"updated_at": "2022-08-21T09:46:39.868107Z",
	"metadata": {},
	"registration_access_token": "MnfHqsih-NlTYiL6DHZ-QxUcpLoQzw7ZHnbAp03qSlo.EqPZT8LnPp3AOOaHRycCi1_SomWXeGxnUSrSehHI0XM",
	"registration_client_uri": "http://localhost:4444/oauth2/register/my-client-2",
	"authorization_code_grant_access_token_lifespan": null,
	"authorization_code_grant_id_token_lifespan": null,
	"authorization_code_grant_refresh_token_lifespan": null,
	"client_credentials_grant_access_token_lifespan": null,
	"implicit_grant_access_token_lifespan": null,
	"implicit_grant_id_token_lifespan": null,
	"jwt_bearer_grant_access_token_lifespan": null,
	"password_grant_access_token_lifespan": null,
	"password_grant_refresh_token_lifespan": null,
	"refresh_token_grant_id_token_lifespan": null,
	"refresh_token_grant_access_token_lifespan": null,
	"refresh_token_grant_refresh_token_lifespan": null
}
```

After creating a client, you can generate a token using the client id and secret of the client as follows.

```sh prompt{1} caption='Generating a token'
curl -u 'my-client-2:my-secret-2' -X POST 'http://localhost:4444/oauth2/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'grant_type=client_credentials&scope=api'
{
	"access_token": "3mqL5bYDrEW-adM6QCrchQD9pLZvM2Gv2WHWCnrk_4w.1QhAtnI-f_QE9zdUcXKErzRFPaFjqF_dMWJHcwLwHE8",
	"expires_in": 3599,
	"scope": "api",
	"token_type": "bearer"
}
```

You can now introspect this token with the `/introspect` endpoint which is a part of the admin API. The response specifies whether the token is active.

```sh prompt{1} caption='Introspecting a token'
curl -X POST 'http://localhost:4445/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=3mqL5bYDrEW-adM6QCrchQD9pLZvM2Gv2WHWCnrk_4w.1QhAtnI-f_QE9zdUcXKErzRFPaFjqF_dMWJHcwLwHE8'
{
	"active": true,
	"scope": "api",
	"client_id": "my-client-2",
	"sub": "my-client-2",
	"exp": 1661078849,
	"iat": 1661075249,
	"nbf": 1661075249,
	"aud": [],
	"iss": "http://localhost:4444/",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

Again, if the token isn't active, the `active` flag returns as `false`.

```sh
curl -X POST 'http://localhost:4445/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=3mqL5bYDrEW-adM6QCrchQD9pLZvM2Gv2WHWCnrk_4w.1QhAtnI-f_QE9zdUcXKErzRFPaFjqF_dMWJHcwLwHE9'
{
	"active": false
}
```

## Notes

- Ory Hydra can also work with other databases besides Postgres. Check out the quickstart Compose files available on the [GitHub repository](https://github.com/ory/hydra) for examples using CockroachDB, MySQL, SQLite, etc.
- Other OAuth flows like `implicit`, `authorization_code`, `refresh_token`, etc. are also supported. The [5-min tutorial](https://www.ory.sh/docs/hydra/5min-tutorial) on the official site showcases the `authorization_code` based flow.
- You can also pass a `hydra.yml` file with the [configuration](https://www.ory.sh/docs/hydra/reference/configuration) to customize the behavior of Hydra. In this post, the default configuration is used.

---

**Related**

- [Ory Hydra: Introduction](https://www.ory.sh/docs/hydra/)
- [API reference](https://www.ory.sh/docs/reference/api)
