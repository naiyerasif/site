---
title: 'Developing an API with Express and Postgres'
date: 2019-08-19 21:43:03
updated: 2020-02-06 23:26:09
authors: [naiyer]
labels: [express, postgres, typescript]
---

Express is frequently used to create APIs in Node.js applications; these can be a middleware for a more traditional backend or an interface for the classic CRUD operations. In this post, we'll build an API to perform CRUD operations on a Postgres database. We'll explore patterns to organize routes, add support for hot-reloading and inject environment variables locally.

##### Article series

1. [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/)
2. [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/)
3. [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/)
4. [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/)
5. [Developing an API with Express and Postgres](/blog/2019/08/19/developing-an-api-with-express-and-postgres/)

##### Setup

You can pick the Node.js application created in the post [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/) to follow this post.

## Enable hot-reloading

It is cumbersome to manually restart the application every time we make a change in the source code. This can be automated by `nodemon`.

```sh
yarn add -D nodemon
```

To ensure that the old files are not getting cached, we can delete the `dist` directory before every rebuild (through `shx`). To run multiple node scripts conveniently, we can use `npm-run-all`.

```sh
yarn add -D shx npm-run-all
```

Edit the `scripts` in `package.json` as follows.

```json
"build": "npm-run-all build:*",
"build:clean": "shx rm -rf dist",
"build:lint": "eslint src/**/* --fix",
"build:compile": "tsc",
"watch": "nodemon --watch src -e ts --exec npm run serve",
"serve": "npm-run-all build start",
"start": "node ."
```

Launch the application with `yarn watch` and `nodemon` will watch for any changes in a `ts` file and launch the `serve` script.

## Environment variables for local development

To avoid hardcoding variables and secrets (e.g., database credentials, access tokens, etc), they can be configured through the environment variables on a machine. For local development, such variables can be injected through `dotenv`.

Add the dependency for `dotenv` using the following command.

```sh
yarn add dotenv
```

Create a `.env` file in the project root and add the following content.

```properties
ENV=local
LOG_DIR=logs
LOG_FILE=app.log
LOG_LEVEL=info
MORGAN_LOG=requests.log
MORGAN_LOG_FMT=[:date[iso]] :method :url :status :response-time ms - :res[content-length]
MORGAN_LOG_ROLLING_INTERVAL=1d
SERVER_PORT=8080
```

Edit `src/configuration/environment.ts` to initialize `dotenv`.

```typescript
// src/configuration/environment.ts

import dotenv from 'dotenv';

// fetch .env configuration
dotenv.config();

export const environment = {
  nodeEnv: process.env.ENV || process.env.NODE_ENV,
  logDir: process.env.LOG_DIR || 'logs',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'app.log',
  requestLogFile: process.env.MORGAN_LOG || 'requests.log',
  requestLogFormat: process.env.MORGAN_LOG_FMT || 'combined',
  requestLogRollingInterval: process.env.MORGAN_LOG_ROLLING_INTERVAL || '1d',
  serverPort: Number(process.env.SERVER_PORT) || 8080
};
```

Refactor `src/server.ts` to use `serverPort`.

```typescript{9}
// src/server.ts

import express from 'express';
import { environment } from './configuration/environment';
import { registerRequestLogger } from './helper/request.logger';
import { logger } from './helper/default.logger';

const app = express();
const port = environment.serverPort; // server port

// register morgan
registerRequestLogger(app);

// default route
app.get('/', (req, res) => res.json({
  message: 'Hello World!'
}));

// server
app.listen(port, () => logger.info(`Server started at http://localhost:${port}, Press CTRL+C to stop it`));
```

> **INFO** Make sure to add `.env` file in the `.gitignore` since it is meant only for the local development.

## Configure Postgres

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

We'll build a simple music catalog system with APIs to
- add, modify or remove songs
- search the songs by title, album or artist

### Create a table

Create a table named `song` and add some sample data in it.

```sql
CREATE TABLE song (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  album TEXT,
  artist TEXT
);

INSERT INTO song(title, album, artist) VALUES ('Too Much', 'Dedicated', 'Carly Rae Jepsen');
INSERT INTO song(title, album, artist) VALUES ('Insomnia', 'D2', 'Daya');
INSERT INTO song(title, album, artist) VALUES ('Issues', 'Nervous System', 'Julia Michaels');
```

> **INFO** The `SERIAL` type will automatically generate an incremented `id` in Postgres.

## Create a Repository

Add `pg` to communicate with Postgres, along with its type definitions.

```sh
yarn add pg
yarn add -D @types/pg
```

Provide the database configurations required by `pg` in `.env` file as follows.

```properties
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=example
PGDATABASE=postgres
PGPORT=5432
```

Read these configurations in the `src/configuration/environment.ts`.

```typescript
// src/configuration/environment.ts

export const environment = {
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgPassword: process.env.PGPASSWORD,
  pgDatabase: process.env.PGDATABASE,
  pgPort: Number(process.env.PGPORT),
  
  // Other configurations
};
```

Create a file `src/model/song.ts` and define an interface for a song. This will serve as a model.

```typescript
// src/model/song.ts

export interface Song {
  id?: string;
  title: string;
  album: string;
  artist: string;
}
```

Create a file `src/repository/song.ts` and add the following code.

```typescript
// src/repository/song.ts

import { Pool } from 'pg';
import { Song } from '../model/song';
import { logger } from '../helper/default.logger';

export class SongRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool();
  }

  async getAll() {
    logger.info('Fetching all songs...');
    const result = await this.pool.query('SELECT id, title, album, artist FROM song');
    return result.rows;
  }

  async getById(id: string) {
    logger.info('Fetching all songs...');
    const result = await this.pool.query(`SELECT id, title, album, artist FROM song WHERE id = '${id}'`);
    return result.rows;
  }

  async search(keyword: string) {
    logger.info(`Searching for ${keyword}...`);
    const result = await this.pool.query(`SELECT id, title, album, artist FROM song WHERE title LIKE '%${keyword}%' OR album LIKE '%${keyword}%' OR artist LIKE '%${keyword}%'`);
    return result.rows;
  }

  async save(song: Song) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO song(title, album, artist) VALUES ('${song.title}', '${song.album}', '${song.artist}') ON CONFLICT (id) DO UPDATE SET title = '${song.title}', album = '${song.album}', artist = '${song.artist}'`
      );
      await client.query('COMMIT');
      logger.info('Song saved...');
      return result.rows;
    } catch (e) {
      await client.query('ROLLBACK');
      logger.info('Failed saving the song. Transaction rolled back...');
      throw e;
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    logger.info('Deleting a song...');
    const result = await this.pool.query(`DELETE FROM song WHERE id = '${id}'`);
    return result.rows;
  }
}
```

In the `SongRepository` class, a connection pool (`Pool`) provided by `pg` is used to execute the queries asynchronously. This connection pool returns a `Promise`. For more control over a transaction, a `client` has been used in `save` method where a transaction is being rolled back in case something goes wrong.

## Configure the endpoints

To configure the endpoints, create a file `src/api/song.ts` and add the following code.

```typescript
// src/api/song.ts

import { Application } from 'express';
import { SongRepository } from '../repository/song';

const context = '/song';
const repository = new SongRepository();

export const registerSongEndpoints = (app: Application) => {
  app.get(context, (req, res) => {
    repository.getAll()
      .then(results => res.json({ results: results }))
      .catch(error => res.status(500).json({ error: error }));
  });

  app.put(context, (req, res) => {
    if (req.body && req.body.title && req.body.album && req.body.artist) {
      const song = {
        title: req.body.title,
        album: req.body.album,
        artist: req.body.artist
      };
      repository.save(song)
        .then(result => res.json({ message: `Saved ${song.title}` }))
        .catch(error => res.status(500).json({ error: error }));
    } else {
      res.status(400).json({ error: 'Invalid request body' });
    }
  });

  // Other endpoints
};
```

A typical endpoint calls a repository method and returns a success message or result. In case of an error, the error or an error message is returned in the response.

Import these endpoints in a `src/api/index.ts` file as follows.

```typescript
// src/api/index.ts

import { Application } from 'express';
import { registerSongEndpoints } from './song';

export const registerEndpoints = (app: Application) => {
  registerSongEndpoints(app);

  // Other endpoint registerations
};
```

To parse the request body, add `body-parser` as a dependency.

```sh
yarn add body-parser
```

Register `body-parser` and the endpoints in `src/server.ts`.

```typescript{4, 10}
// src/server.ts

import express from 'express';
import bodyParser from 'body-parser';
import { registerEndpoints } from './api';
// Other imports...

const app = express();
const port = environment.serverPort; // server port
app.use(bodyParser.json()); // body parser to read request body

// register morgan
registerRequestLogger(app);

// register all endpoints
registerEndpoints(app);

// server
app.listen(port, () => logger.info(`Server started at http://localhost:${port}, Press CTRL+C to stop it`));
```

### Test the API

Build the app by `yarn build` and launch it with `yarn start`. Use the following `curl` requests to verify the API.

```sh
curl --request GET 'http://localhost:8080/song'

curl --request GET 'http://localhost:8080/song/search?q=Carly'

curl --request GET 'http://localhost:8080/song/search?q=Nervous'

curl --request GET 'http://localhost:8080/song/search?q=D2'

curl --request PUT http://localhost:8080/song \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "brand new eyes",
    "album": "Wonder",
    "artist": "Sandra Dassault"
}'

curl --request PATCH http://localhost:8080/song \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "4",
    "artist": "Bea Miller"
}'

curl --request DELETE http://localhost:8080/song \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "4"
}'
```

## References

**Source code** &mdash; [express-postgres-api](https://gitlab.com/mflash/nodejs-guides/-/tree/master/express-postgres-api)
