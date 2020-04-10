---
title: 'Logging on Node.js with log4js-node'
date: 2019-08-14 17:11:09
updated: 2019-09-22 20:19:17
authors: [naiyer]
labels: [nodejs, express]
---

`console.log` has been a prevalent anti-pattern inherited by Node.js developers from years of printing to the console on a browser. While this is useful for quick debugging, it doesn't sit well with server-side design; it's hard to turn it off selectively, add log levels to it or redirect the logs to a file or database. Some good alternatives to the `console.log` are [winston](https://github.com/winstonjs/winston) and [log4js-node](https://github.com/log4js-node/log4js-node).

In this post, we'll explore the uses of `log4js-node` to print the logs on the console as well as a file.

##### Article series

1. [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/)
2. [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/)
3. [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/)
4. [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/)
5. [Developing an API with Express and Postgres](/blog/2019/08/19/developing-an-api-with-express-and-postgres/)

##### Setup

You can pick the Node.js application created in the post [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/) to follow this post.

## Install dependencies for `log4js-node`

Add the required dependencies with the following command.

```bash
yarn add log4js
```

## Add configurations for the logs

Add the following environment variables (through `dotenv` or environment variables of your system); they configure the default logging level of `log4js-node` and the name of the log file.

```properties
LOG_LEVEL=info
LOG_FILE=app.log
```

Read these configurations in `src/configuration/environment.ts`.

```typescript
// src/configuration/environment.ts

export const environment = {
  nodeEnv: process.env.ENV || process.env.NODE_ENV,
  logDir: process.env.LOG_DIR || 'logs',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'app.log',

  // Other environment variables
}
```

## Define appenders for `log4js-node`

Create a file `src/helper/default.logger.ts` and add the following code.

```typescript
// src/helper/default.logger.ts

import { configure, getLogger } from 'log4js';
import { environment } from '../configuration/environment';

// appenders
configure({
  appenders: {
    console: { type: 'stdout', layout: { type: 'colored' } },
    dateFile: {
      type: 'dateFile',
      filename: `${environment.logDir}/${environment.logFile}`,
      layout: { type: 'basic' },
      compress: true,
      daysToKeep: 14,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ['console', 'dateFile'], level: environment.logLevel }
  }
});

// fetch logger and export
export const logger = getLogger();
```

Here, we've created a console appender, and a rotating file appender that rotates the file `logs/app.log` in a zip archive everyday.

Use this logger as follows.

```typescript
// import the logger
import { logger } from './helper/default.logger';

// other configurations and initializations 

// server
app.listen(port, () => logger.info(`Server started at http://localhost:${port}`));
```

Start the application; you should see `app.log` in `logs` directory and the same logs printed on the console.

## References

**Source code** &mdash; [logging-with-log4js-node](https://gitlab.com/mflash/nodejs-guides/-/tree/master/logging-with-log4js-node)

**See also**
- [log4js-node docs](https://log4js-node.github.io/log4js-node/index.html)