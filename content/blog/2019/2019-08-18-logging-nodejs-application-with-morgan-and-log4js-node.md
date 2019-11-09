---
title: Logging Node.js application with morgan and log4js-node
path: /logging-nodejs-application-with-morgan-and-log4js-node
date: 2019-08-18
updated: 2019-09-22
author: [naiyer]
summary: Setup server-side logging on a Node.js application with morgan and log4js-node
tags: ['guide']
---

## Intent

In this guide, you'll to configure logging on an existing Node.js application with `morgan` and `log4js-node` to print the logs on the console as well as a file.

### Setup

> This guide uses
> - Node 12

You should already have a Node.js project. Download the one created at the end of the post [Linting TypeScript with TypeScript ESLint and Prettier](/blog/2019/08/16/linting-typescript-with-typescript-eslint-and-prettier) to follow this guide.

### Table of Contents

## Setup request logging with `morgan`

`morgan` is a request logger middleware for `express`. Install it in your project with the following command. `rotating-file-stream` will be used to write the logs to a file.

```bash
npm install morgan rotating-file-stream
npm install --save-dev @types/morgan
```

Ensure that the following environment variables are available to the application (through `dotenv` or environment variables of your system); these are locations of log files, log format and rolling durations.

```properties
LOG_DIR=logs
MORGAN_LOG=requests.log
MORGAN_LOG_FMT=[:date[iso]] :method :url :status :response-time ms - :res[content-length]
MORGAN_LOG_ROLLING_INTERVAL=1d
```

Create a file `src/helpers/requests.logger.ts` and add the following code.

```typescript
import morgan from "morgan";
import rfs from "rotating-file-stream";

// morgan configurations
const morganLogDir = process.env.LOG_DIR || "logs";
const morganLogFile = process.env.MORGAN_LOG || "requests.log";
const morganLogRollingInterval =
  process.env.MORGAN_LOG_ROLLING_INTERVAL || "1d";
const morganOutputFormat = process.env.MORGAN_LOG_FMT || "combined";

// rotating stream for morgan
const accessLogStream = rfs(morganLogFile, {
  interval: morganLogRollingInterval,
  path: morganLogDir
});

export const consoleAppender = morgan(morganOutputFormat);
export const fileAppender = morgan(morganOutputFormat, {
  stream: accessLogStream
});
```

This source code
- reads configurations from the environment variables (or falls back on some defaults if those variables are not available)
- creates a rotating filestream appender that rolls every day and dumps the logs in a directory called `logs`
- creates a console appender which prints the logs on the console

Add these appenders to `express` as follows.

```typescript
// import the appenders
import { consoleAppender, fileAppender } from "./helpers/requests.logger";

// other configurations and initializations

// add morgan for console and file
app.use(consoleAppender);
app.use(fileAppender);
```

Start the application; you should see `requests.log` in `logs` directory and the same logs printed on console when the endpoints are consumed by a client (such as `curl` or Postman).

## Setup `log4js-node` for event logging

Add the required dependencies with the following command.

```bash
npm install log4js
```

Ensure the following environment variables are available to the application (through `dotenv` or your system's environment variables); they configure the default logging level of `log4js-node` and the name of the log file.

```properties
LOG_LEVEL=info
LOG_FILE=app.log
```

Create a file `src/helpers/default.logger.ts` and add the following code.

```typescript
import { configure, getLogger } from "log4js";

// log location
const logDir = process.env.LOG_DIR || "logs";
const logFileName = process.env.LOG_FILE || "app.log";
const logFilePath = `${logDir}/${logFileName}`;

// set default log level
const logLevel = process.env.LOG_LEVEL || "info";

// appenders
configure({
  appenders: {
    console: { type: "stdout", layout: { type: "colored" } },
    dateFile: {
      type: "dateFile",
      filename: logFilePath,
      layout: { type: "basic" },
      compress: true,
      daysToKeep: 14,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ["console", "dateFile"], level: logLevel }
  }
});

// fetch logger
const logger = getLogger();

export { logger };
```

This source code
- reads configurations from the environment variables (or falls back on some defaults if those variables are not available)
- configures a console appender which prints the logs on the console
- configures a rotating file appender that appends the logs in a file `app.log` in a directory called `logs` and rolls it every day in a zip archive

Use this logger as follows.

```typescript
// import the logger
import { logger } from "./helpers/default.logger";

// other configurations and initializations 

// start the express server
app.listen(port, () => {
  logger.info(`Server started at http://localhost:${port}`);
});
```

Start the application; you should see `app.log` in `logs` directory and the same logs printed on the console.

## References

> **Source Code** &mdash; [morgan-log4js-logging](https://github.com/Microflash/guides/tree/master/nodejs/morgan-log4js-logging)
>
> **Documentations** 
> - [morgan docs](https://github.com/expressjs/morgan#readme)
> - [log4js-node docs](https://log4js-node.github.io/log4js-node/index.html)