---
title: Developing a REST API with Express, TypeScript and Postgres
path: /developing-a-rest-api-with-express-typescript-and-postgres
date: 2019-08-19
updated: 2019-09-22
author: [naiyer]
tags: ['guide']
---

In this guide, you'll learn to write a REST API to perform CRUD operations using Express, TypeScript and Postgres. You'll also learn how to organize routes and add support for hot-reloading and simulating environment variables locally.

### Setup

> This guide uses
> - Node 12

Download the project created at the end of the post [Logging Node.js application with morgan and log4js-node](/blog/2019/08/18/logging-nodejs-application-with-morgan-and-log4js-node) to follow this guide.

### Table of Contents

## Define a domain

Say, you want to build a music catalog. Your system should be able to
- add, modify or remove music tracks
- associate a track with an album and artist
- remove entire album
- search tracks by title, album or artist

## Configuring routes

You need to add several REST endpoints to expose the domain described. To do so, you need to configure routes for those endpoints. Adding all the routes in `index.ts` will bloat it; hence, put the routes in a separate file, say `src/routes/tracks.routes.ts`.

```typescript
import * as express from "express";

const ctx = "/track";
export const register = (app: express.Application) => {
  app.get(`${ctx}`, (req, res) => {});

  app.get(`${ctx}/search`, (req, res) => {});

  app.put(`${ctx}`, (req, res) => {});

  app.patch(`${ctx}`, (req, res) => {});

  app.delete(`${ctx}`, (req, res) => {});
};
```

All of these are dummy routes in which you'll add some implementation later. Add an endpoint for the health check in a file `src/routes/default.routes.ts`.

```typescript
import * as express from "express";

export const register = (app: express.Application) => {
  app.get("/health", (req, res) => {
    res.jsonp({
      status: "ok",
      host: "localhost",
      port: process.env.SERVER_PORT
    });
  });
};
```

Collect these routes in `src/routes/index.ts`.

```typescript
import * as express from "express";
import * as defaultRoutes from "./default.routes";
import * as trackRoutes from "./tracks.routes";

export const register = (app: express.Application) => {
  defaultRoutes.register(app);
  trackRoutes.register(app);
};
```

And register this route collection with `express` in `src/index.ts`.

```typescript
import express from "express";
import { logger } from "./helpers/default.logger";
import { consoleAppender, fileAppender } from "./helpers/requests.logger";
import * as routes from "./routes";

const port = 8080; // default port for express

const app = express();

// add morgan for console and file
app.use(consoleAppender);
app.use(fileAppender);

// register routes
routes.register(app);

// start the express server
app.listen(port, () => {
  logger.info(`Server started at http://localhost:${port}`);
});
```

Launch the application with `npm start` and execute the following command. You should see the expected response of the health check.

```bash
$ curl -X GET http://localhost:8080/health
{"status":"ok","host":"localhost"}
```

To parse the request body, add `body-parser` as a dependency.

```bash
npm install body-parser
```

Add this middleware to `express` as follows.

```typescript
import express from "express";
import bodyParser from "body-parser";
import { logger } from "./helpers/default.logger";
import { consoleAppender, fileAppender } from "./helpers/requests.logger";
import * as routes from "./routes";

const port = 8080; // default port for express

const app = express();

// body parser to read request body
app.use(bodyParser.json());

// add morgan for console and file
app.use(consoleAppender);
app.use(fileAppender);

// register routes
routes.register(app);

// start the express server
app.listen(port, () => {
  logger.info(`Server started at http://localhost:${port}`);
});
```

## Setup development workflows

In this section, you'll learn how to enable hot-reloading and simulate environment variables locally.

### Enable hot-reloading

It is cumbersome to manually restart the application every time you make a change in the source code. You can automate the restart using `nodemon`.

```bash
npm install --save-dev nodemon
```

While you are at it, you can also add `rimraf` to clean your `dist` directory for every rebuild and `npm-run-all` to run multiple scripts together.

```bash
npm install --save-dev rimraf npm-run-all
```

Edit `scripts` in `package.json` as follows.

```json
"clean": "rimraf dist/*",
"lint": "eslint --fix src/**/*",
"tsc": "tsc",
"build": "npm-run-all clean lint tsc",
"serve": "npm-run-all build start",
"dev": "nodemon --watch src -e ts --exec npm run serve",
"start": "node ."
```

Launch the application with `npm run dev` and `nodemon` will watch for any changes in a `ts` file and launch the `serve` script.

### Environment variables for local development

To avoid hardcoding the port in `src/index.ts`, you can configure a `SERVER_PORT` environment variable on your machine. For local development, you can simulate the environment variables through `dotenv`.

Add the dependency for `dotenv` using the following command.

```bash
npm install dotenv
npm install --save-dev @types/dotenv
```

Create a `.env` file in your project root and add the following content.

```properties
SERVER_PORT=8080
```

Edit `src/index.ts` to use this variable.

```typescript
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { logger } from "./helpers/default.logger";
import { consoleAppender, fileAppender } from "./helpers/requests.logger";
import * as routes from "./routes";

// fetch .env configuration
dotenv.config();

// port now available from .env
const port = process.env.SERVER_PORT;

const app = express();

// body parser to read request body
app.use(bodyParser.json());

// add morgan for console and file
app.use(consoleAppender);
app.use(fileAppender);

// register routes
routes.register(app);

// start the express server
app.listen(port, () => {
  logger.info(`Server started at http://localhost:${port}`);
});
```

Starting the application will launch it at port 8080.

> **Note** Make sure you add `.env` file in the `.gitignore` since this file is meant for only local development.

## Setup persistence with Postgres

Start a Postgres instance in a Docker container using the following `docker-compose.yml`.

```yaml
version: "3.1"

services:
  db:
    image: postgres:alpine
    container_name: postgres_latest
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: example
```

Execute `docker-compose up -d` to launch the stack.

### Create a table

Create a table named `track` and add some sample data in it.

```sql
CREATE TABLE track (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  album TEXT,
  artist TEXT
);

INSERT INTO "track" VALUES ('Too Much', 'Dedicated', 'Carly Rae Jepsen');
INSERT INTO "track" VALUES ('Insomnia', 'D2', 'Daya');
INSERT INTO "track" VALUES ('Be the One', 'Dua Lipa', 'Dua Lipa');
INSERT INTO "track" VALUES ('Issues', 'Nervous System', 'Julia Michaels');
INSERT INTO "track" VALUES ('Worst In Me', 'Nervous System', 'Julia Michaels');
INSERT INTO "track" VALUES ('Uh Huh', 'Nervous System', 'Julia Michaels');
```

> **Note** that the `SERIAL` type will automatically generate an incremented `id` in Postgres.

### Create a repository

Add `pg` to communicate with Postgres along with its type definitions.

```bash
npm install pg
npm install --save-dev @types/pg
```

Provide the database configurations required by `pg` in `.env` file as follows.

```properties
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=example
PGDATABASE=postgres
PGPORT=5432
```

Create a file `src/model/track.model.ts` and define an interface for a track. This will serve as a model.

```typescript
export interface Track {
  id?: string;
  title: string;
  album: string;
  artist: string;
}
```

Create a file `src/persistence/tracks.repository.ts` and add the following code.

```typescript
import { Pool } from "pg";
import { Track } from "../model/track.model";
import { logger } from "../helpers/default.logger";

const pool = new Pool();

const findAll = async () => {
  logger.info("Fetching all tracks");
  const result = await pool.query("SELECT id, title, album, artist FROM track");
  return result.rows;
};

// other find functions

const save = async (track: Track) => {
  const client = await pool.connect();
  try {
    logger.info("Saving a track");
    const result = await client.query(
      `INSERT INTO track(title, album, artist) VALUES ('${track.title}', '${track.album}', '${track.artist}') ON CONFLICT (id) DO UPDATE SET title = '${track.title}', album = '${track.album}', artist = '${track.artist}'`
    );
    await client.query("COMMIT");
    logger.info("Transaction committed");
    return result.rows;
  } catch (e) {
    await client.query("ROLLBACK");
    logger.info("Failed saving the track. Transaction rolled back");
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (id: string) => {
  logger.info("Deleting a track");
  const result = await pool.query(`DELETE FROM track WHERE id = '${id}'`);
  return result.rows;
};

// other remove functions

export { 
  findAll, findById, findByTitle, findByArtist, findByAlbum, 
  save, remove, removeByAlbum
};
```

Note that a connection pool (`Pool`) provided by `pg` is being used here to run queries asynchronously which returns a `Promise`. For finer control over a transaction, you can also use a `client` (as in `save` method where a transaction is being rolled back in case something goes wrong).

Edit the routes in `src/routes/tracks.routes.ts` to use this repository.

```typescript
import * as express from "express";
import * as repo from "../persistence/tracks.repository";

const ctx = "/track";

export const register = (app: express.Application) => {
  app.get(`${ctx}`, (req, res) => {
    repo.findAll().then(data => {
      res.jsonp({
        result: data
      });
    }).catch(err => {
      res.status(500).jsonp({
        error: err
      });
    });
  });

  // other route implementations
};
```

The workflow is as follows: the `Promise` is being processed by returning the data in case of successful database operation or by returning an error in case something goes wrong. Apart from this, you can return errors for validation failures.

## Test the API

Use the following `curl` requests to verify the API.

```bash
curl -X GET http://localhost:8080/track
curl -X GET 'http://localhost:8080/track/search?title=Too%20Much'
curl -X GET 'http://localhost:8080/track/search?album=Nervous%20System'
curl -X GET 'http://localhost:8080/track/search?artist=Daya'

curl -X PUT http://localhost:8080/track \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "brand new eyes",
    "album": "Wonder",
    "artist": "Sandra Dassault"
}'

curl -X PATCH http://localhost:8080/track \
  -H 'Content-Type: application/json' \
  -d '{
    "id": 7,
    "title": "brand new eyes",
    "album": "Wonder",
    "artist": "Bea Miller"
}'

curl -X DELETE http://localhost:8080/track \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "7"
}'

curl -X DELETE http://localhost:8080/track \
  -H 'Content-Type: application/json' \
  -d '{
    "album": "Nervous System"
}'
```

## References

> **Source Code** &mdash; [express-postgres-api](https://github.com/Microflash/guides/tree/master/nodejs/express-postgres-api)