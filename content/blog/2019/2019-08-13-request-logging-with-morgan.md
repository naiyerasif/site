---
title: 'Request logging with morgan'
date: 2019-08-13 14:11:09
authors: [naiyer]
labels: [express, nodejs]
---

Imagine developing an Express application with several endpoints and remaining in the bind which of those were being used by the client application and when! Some form of logging can help in this situation, just to tell about the endpoint and the timestamp when it was requested by the client. Express makes this easy through [morgan](https://github.com/expressjs/morgan).

##### Article series

1. [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/)
2. [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/)
3. [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/)
4. [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/)
5. [Developing an API with Express and Postgres](/blog/2019/08/19/developing-an-api-with-express-and-postgres/)

##### Setup

You can pick the Node.js application created in the post [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/) to follow this post.

## Install dependencies for `morgan`

`morgan` is a request logger middleware for `express`. Install it in your project with the following command.

```bash
yarn add morgan
yarn add -D @types/morgan
```

If you want to save the logs in a file and rotate them daily, add `rotating-file-stream` as well.

```bash
yarn add rotating-file-stream
```

## Add configurations for the logs

Add the following environment variables (through `dotenv` or environment variables of your system); these are locations of log files, log format and rolling durations.

```properties
LOG_DIR=logs
MORGAN_LOG=requests.log
MORGAN_LOG_FMT=[:date[iso]] :method :url :status :response-time ms - :res[content-length]
MORGAN_LOG_ROLLING_INTERVAL=1d
```

Create a file `src/configuration/environment.ts` and read these configurations in it.

```typescript
// src/configuration/environment.ts

export const environment = {
  nodeEnv: process.env.ENV || process.env.NODE_ENV,
  logDir: process.env.LOG_DIR || 'logs',
  requestLogFile: process.env.MORGAN_LOG || 'requests.log',
  requestLogFormat: process.env.MORGAN_LOG_FMT || '[:date[iso]] :method :url :status :response-time ms - :res[content-length]',
  requestLogRollingInterval: process.env.MORGAN_LOG_ROLLING_INTERVAL || '1d'
}
```

## Initialize the middleware for `morgan`

Create a file `src/helper/request.logger.ts` and add the following code.

```typescript
// src/helper/request.logger.ts

import { Application } from 'express';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';
import { environment } from '../configuration/environment';

// rotating stream for morgan
const accessLogStream = createStream(environment.requestLogFile, {
  interval: environment.requestLogRollingInterval,
  path: environment.logDir
});

// appenders for printing the logs to console and file
const consoleAppender = morgan(environment.requestLogFormat);
const fileAppender = morgan(environment.requestLogFormat, {
  stream: accessLogStream
});

// function to inject morgan in an express app
export const registerRequestLogger = (app: Application) => {
  app.use(consoleAppender);

  // log to file only in `production`
  if (environment.nodeEnv === 'production') {
    app.use(fileAppender);
  }
}
```

Here, we've used the configuration from `environment.ts` to initialize a console and file appender. When an `express` app is provided to the default function, these appenders will be injected to the app.

## Enable request logging

Inject the appenders created above in the `express` app, as follows.

```typescript{4, 10}
// src/server.ts

import express from 'express';
import { registerRequestLogger } from './helper/request.logger';

const app = express();
const port = 8080; // server port

// register morgan
registerRequestLogger(app);

// default route
app.get('/', (req, res) => res.json({
  message: 'Hello World!'
}));

// server
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));
```

Start the application; you should the request logs printed on console when the endpoints are consumed by a client (such as `curl` or Postman). Set the environment to `production` and `morgan` will print the logs in `logs/requests.log` file.

## References

**Source code** &mdash; [morgan-request-logging](https://gitlab.com/mflash/nodejs-guides/-/tree/master/morgan-request-logging)

**See also**
- [morgan docs](https://github.com/expressjs/morgan#readme)