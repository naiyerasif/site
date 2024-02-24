---
slug: "2022/08/21/client-credentials-flow-with-ory-hydra"
title: "Client Credentials flow with Ory Hydra"
description: "Ory Hydra is an open source implementation of the OAuth 2.0 Authorization and OpenID Connect Core 1.0 frameworks. Learn to set it up using Docker, create a client and test a Client Credentials flow."
date: 2022-08-21 12:32:07
update: 2023-09-26 21:17:30
category: "guide"
---

[Ory Hydra](https://github.com/ory/hydra) is an open source OpenID Connect Provider. It implements OAuth 2.0 Authorization Framework and the OpenID Connect Core 1.0 framework. It can issue OAuth 2.0 Access, Refresh, and ID tokens. This can be useful to test the token flow during the development on a local machine. In this post, we'll setup Hydra using Docker, create a client and test a `client_credentials` flow through Hydra CLI and `curl`.

:::setup
The code written for this post uses:

- Docker 24.0.6
- Ory Hydra 2.1.2
- Postgres 11.8
:::

## Configure Ory Hydra

Create a [Docker Compose](https://docs.docker.com/compose/) file with the following details.

```yml caption='compose.yml'
services:

  hydra:
    image: oryd/hydra:v2.1.2
    ports:
      - "4444:4444" # Public port
      - "4445:4445" # Admin port
      - "5555:5555" # Port for hydra token user
    command: serve all --dev
    environment:
      - SECRETS_SYSTEM=global_secret_to_encrypt_db
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    restart: unless-stopped
    depends_on:
      - hydra-migrate
    networks:
      - hydranet

  hydra-migrate:
    image: oryd/hydra:v2.1.2
    environment:
      - DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable&max_conns=20&max_idle_conns=4
    command: migrate sql -e --yes
    restart: on-failure
    networks:
      - hydranet

  postgresd:
    image: postgres:11.8
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
docker compose up -d
```

You can open a new terminal and verify the health of all the containers. The services `postgresd` and `hydra` should be up and running.

```sh prompt{1}
docker ps
CONTAINER ID   IMAGE               COMMAND                  CREATED         STATUS          PORTS                                                      NAMES
d358acefed2b   oryd/hydra:v2.1.2   "hydra serve all --d…"   4 minutes ago   Up 4 minutes    0.0.0.0:4444-4445->4444-4445/tcp, 0.0.0.0:5555->5555/tcp   docker-hydra-1
8e9d4cd89532   postgres:11.8       "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes    0.0.0.0:5432->5432/tcp                                     docker-postgresd-1
```

## Client Credentials flow with Hydra CLI

You can test Hydra using Hydra CLI available in the `hydra` container.

Let's start by creating a client. Since we're testing the Client Credentials flow, specify the `client_credentials` as a grant type.

```sh prompt{1} caption='Creating a client'
docker compose exec hydra hydra create client --endpoint http://localhost:4445/ --format json --secret my-secret-0 --grant-type client_credentials --scope api
{
	"client_id": "5c5e8527-cf67-421a-9cd3-c695289cacfc",
	"client_name": "",
	"client_secret": "my-secret-0",
	"client_secret_expires_at": 0,
	"client_uri": "",
	"created_at": "2023-09-26T15:32:46Z",
	"grant_types": [
		"client_credentials"
	],
	"jwks": {},
	"logo_uri": "",
	"metadata": {},
	"owner": "",
	"policy_uri": "",
	"registration_access_token": "ory_at_dUOLunVDPxwLWiD6lbdVFfVH7UwG6aPt1UI0qm2V-7o.Tw8yPmiTO8RHdo_qH36jSWAJQZAGcxykieYbaRoz26g",
	"registration_client_uri": "http://localhost:4444/oauth2/register/5c5e8527-cf67-421a-9cd3-c695289cacfc",
	"request_object_signing_alg": "RS256",
	"response_types": [
		"code"
	],
	"scope": "api",
	"skip_consent": false,
	"subject_type": "public",
	"token_endpoint_auth_method": "client_secret_basic",
	"tos_uri": "",
	"updated_at": "2023-09-26T15:32:45.969653Z",
	"userinfo_signed_response_alg": "none"
}
```

With this client, you can now generate a token.

```sh prompt{1} caption='Generating a token'
docker compose exec hydra hydra perform client-credentials --endpoint http://localhost:4444/ --format json --client-id 5c5e8527-cf67-421a-9cd3-c695289cacfc --client-secret my-secret-0
{
	"access_token": "ory_at_-5rDH2nrSNhZDmmbjdvfQPSo0-OBlDUN4N85NsYMdAc.9SO7MGTK0Vi8iCWXQ_UVDOvQSs_rGEaPz2OfT_xNLRs",
	"token_type": "bearer",
	"expiry": "2023-09-26T16:40:54.392514632Z"
}
```

When you introspect this token, you'll receive the response whether the token is active.

```sh prompt{1} caption='Introspecting a token'
docker compose exec hydra hydra introspect token --endpoint http://localhost:4445/ --format json ory_at_-5rDH2nrSNhZDmmbjdvfQPSo0-OBlDUN4N85NsYMdAc.9SO7MGTK0Vi8iCWXQ_UVDOvQSs_rGEaPz2OfT_xNLRs
{
	"active": true,
	"client_id": "5c5e8527-cf67-421a-9cd3-c695289cacfc",
	"exp": 1695746455,
	"iat": 1695742855,
	"iss": "http://localhost:4444/",
	"nbf": 1695742855,
	"sub": "5c5e8527-cf67-421a-9cd3-c695289cacfc",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

If the token isn't active, the `active` flag returns as `false`.

```sh prompt{1}
docker compose exec hydra hydra introspect token --endpoint http://localhost:4445/ --format json ory_at_-5rDH2nrSNhZDmmbjdvfQPSo0-OBlDUN4N85NsYMdAc.9SO7MGTK0Vi8iCWXQ_UVDOvQSs_rGEaPz2OfT_xNLRt
{
	"active": false
}
```

## Client Credentials flow with `curl`

Although Hydra CLI is convenient, it's not practical when the applications need to communicate through API calls using HTTP. Hydra exposes REST endpoints for this purpose documented in its [API reference](https://www.ory.sh/docs/reference/api). Let's explore how this works with `curl`.

You can create a client by calling the `/admin/clients` endpoint which is a part of the admin API. Once again, specify the `client_credentials` as a grant type.

```sh prompt{1} caption='Creating a client'
curl -X POST 'http://localhost:4445/admin/clients' -H 'Content-Type: application/json' --data-raw '{ "access_token_strategy": "opaque", "client_name": "MyClient1", "client_secret": "my-secret-1", "grant_types": ["client_credentials"], "scope": "api" }'
{
	"client_id": "125c8f60-9f83-44b2-bd15-f8627d9d1418",
	"client_name": "MyClient1",
	"client_secret": "my-secret-1",
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
	"created_at": "2023-09-25T16:44:00Z",
	"updated_at": "2023-09-25T16:44:00.257206Z",
	"metadata": {},
	"registration_access_token": "ory_at_q-prqb4T0ZbK7v1rysxxPIBUTg_snNAGPZKd2BpaEbU.tgTj-_RHW6-AFF90mH4PfRIo4w90vPw_WYcWxMb_rjY",
	"registration_client_uri": "http://localhost:4444/oauth2/register/125c8f60-9f83-44b2-bd15-f8627d9d1418",
	"access_token_strategy": "opaque",
	"skip_consent": false,
	"authorization_code_grant_access_token_lifespan": null,
	"authorization_code_grant_id_token_lifespan": null,
	"authorization_code_grant_refresh_token_lifespan": null,
	"client_credentials_grant_access_token_lifespan": null,
	"implicit_grant_access_token_lifespan": null,
	"implicit_grant_id_token_lifespan": null,
	"jwt_bearer_grant_access_token_lifespan": null,
	"refresh_token_grant_id_token_lifespan": null,
	"refresh_token_grant_access_token_lifespan": null,
	"refresh_token_grant_refresh_token_lifespan": null
}
```

After creating a client, you can generate a token using the client id and secret of the client as follows.

```sh prompt{1} caption='Generating a token'
curl -u '125c8f60-9f83-44b2-bd15-f8627d9d1418:my-secret-1' -X POST 'http://localhost:4444/oauth2/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'grant_type=client_credentials&scope=api'
{
	"access_token": "ory_at_mfXDWtV4g1XY0Q8HAkX-xAdfaCEBg8GDAgPQQiNckOs.soLf6p5AOS6HVipYMwNWmVtIfnmCAnDy04yQywF6RLg",
	"expires_in": 3599,
	"scope": "api",
	"token_type": "bearer"
}
```

You can now introspect this token with the `/introspect` endpoint which is a part of the admin API. The response specifies whether the token is active.

```sh prompt{1} caption='Introspecting a token'
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_mfXDWtV4g1XY0Q8HAkX-xAdfaCEBg8GDAgPQQiNckOs.soLf6p5AOS6HVipYMwNWmVtIfnmCAnDy04yQywF6RLg&scop=api'
{
	"active": true,
	"scope": "api",
	"client_id": "125c8f60-9f83-44b2-bd15-f8627d9d1418",
	"sub": "125c8f60-9f83-44b2-bd15-f8627d9d1418",
	"exp": 1695663900,
	"iat": 1695660300,
	"nbf": 1695660300,
	"aud": [],
	"iss": "http://localhost:4444/",
	"token_type": "Bearer",
	"token_use": "access_token"
}
```

Again, if the token isn't active, the `active` flag returns as `false`.

```sh
curl -X POST 'http://localhost:4445/admin/oauth2/introspect' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'token=ory_at_mfXDWtV4g1XY0Q8HAkX-xAdfaCEBg8GDAgPQQiNckOs.soLf6p5AOS6HVipYMwNWmVtIfnmCAnDy04yQywF6RLh&scope=api'
{
	"active": false
}
```

## Notes

- Ory Hydra can also work with other databases besides Postgres. Check out the quickstart Compose files available on the [GitHub repository](https://github.com/ory/hydra) for examples using CockroachDB, MySQL, SQLite, etc.
- Other OAuth flows like `implicit`, `authorization_code`, `refresh_token`, etc. are also supported. The [5-min tutorial](https://www.ory.sh/docs/hydra/5min-tutorial) on the official site showcases the `authorization_code` based flow.
- You can also pass a `hydra.yml` file with the [configuration](https://www.ory.sh/docs/hydra/reference/configuration) to customize the behavior of Hydra. In this post, the default configuration is used.

---

**Previous versions**

- [:time{datetime="2022-08-21T12:32:07.000Z"}](/archive/2022/08/21/client-credentials-flow-with-ory-hydra--1): Discusses client credentials flow with Ory Hydra 1

**Source code**

- [ory-hydra-2--client-credentials-flow](https://github.com/Microflash/guides/tree/main/miscellaneous/ory-hydra-2--client-credentials-flow)

**Related**

- [Ory Hydra: Introduction](https://www.ory.sh/docs/hydra/)
- [API reference](https://www.ory.sh/docs/reference/api)
