---
title: 'Logging on Node.js with winston'
date: 2020-01-26 17:11:09
authors: [naiyer]
labels: [nodejs, express]
---

`winston` is very popular logger for Node.js, providing simple API to store and format the logs. It provides support for custom logging levels, streaming logs and custom transports to save the logs. Another useful feature is the ability to query the logs based on filters like duration and keywords.

In this post, we'll explore how `winston` can be used to log to the console as well as a file.

##### Setup

You can pick the Node.js application created in the post [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/) to follow this post.

## Install dependencies

Add `winston` and `winston-daily-rotate-file` as dependencies.

```bash
yarn add winston winston-daily-rotate-file
```

## Configure the logger

Create a file `src/helper/default.logger.ts` and add the following code.

```typescript
// src/helper/default.logger.ts

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { environment } from '../configuration/environment';

export const logger = winston.createLogger({
  level: environment.logLevel,
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: environment.logFile,
      dirname: environment.logDir,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
      maxSize: '20m'
    })
  ]
});
```

Here, we've configured `winston` with two transports, `Console` and `DailyRotateFile`. `DailyRotateFile` will write the logs to `logs/app.log` file which'll be rotated every day or if it exceeds the size of 20 MB. The logs will be kept for up to 14 days in zip archives.

To use the logger, import it and call the logging methods (`info`, `debug`, etc).

```typescript
// import the logger
import { logger } from './helper/default.logger';

// other configurations and initializations 

// server
app.listen(port, () => logger.info(`Server started at http://localhost:${port}`));
```

Start the application; you should see `app.log` in `logs` directory and the same logs printed on the console.

## References

**Source code** &mdash; [logging-with-winston](https://gitlab.com/mflash/nodejs-guides/-/tree/master/logging-with-winston)

**See also**
- [winston docs](https://github.com/winstonjs/winston)
- [winston-daily-rotate-file docs](https://github.com/winstonjs/winston-daily-rotate-file)