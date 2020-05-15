---
title: 'Using Express with TypeScript'
date: 2019-01-12 10:11:13
updated: 2020-02-06 22:30:55
authors: [naiyer]
labels: [express, typescript]
---

TypeScript [has been gaining](https://2019.stateofjs.com/javascript-flavors/typescript/) popularity and adoption for a while as a strongly-typed flavor of JavaScript. And Express [has been a fan-favorite](https://2019.stateofjs.com/back-end/express/) for writing JavaScript backends. So how do we use them together? Let's explore.

##### Article series

1. [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/)
2. [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/)
3. [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/)
4. [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/)
5. [Developing an API with Express and Postgres](/blog/2019/08/19/developing-an-api-with-express-and-postgres/)

##### Setup

The examples in this post use

- Node.js 12
- Yarn 1.22.4 (use NPM, if you like)

Let's start by creating a Node.js application. Create a directory `express-with-typescript` and open a terminal there. Execute the following command on the terminal.

```sh
yarn init -y
```

This will generate a `package.json` file. Open the directory in your favorite editor.

## Create an Express app

Install `express` as a dependency.

```sh
yarn add express
```

Create a file `src/server.js` and add the following code.

```js
// src/server.js

const express = require('express')

const app = express()
const port = 8080 // server port

// default route
app.get('/', (req, res) => res.json({
  message: 'Hello World!'
}))

// server
app.listen(port, () => console.log(`Server started at http://localhost:${port}`))
```

In the `package.json`, add a `main` entry pointing to this file and create a script to launch the application.

```json
"main": "src/server.js",
"scripts": {
  "start": "node ."
},
```

Open the terminal and execute `yarn start` to launch the application. You should see the following message on the terminal.

```sh
Server started at http://localhost:8080
```

Send a request to the default endpoint using `curl` and you should get a reply.

```sh
$ curl http://localhost:8080/
{"message":"Hello World!"}
```

Let's add TypeScript support now.

## Add TypeScript support

Execute the following command to add TypeScript in your `devDependencies`.

```sh
yarn add -D typescript @types/node @types/express
```

`@types` dependencies provide type information to the editors so they can assist with code completion and type-checking.

There's some configuation needed for the TypeScript compiler `tsc` to inform it where the TypeScript source code is located and where the compiled JavaScript code should be written at. To do so, execute the following command to generate a `tsconfig.json` file.

```sh
npx tsc --init
```

Open the `tsconfig.json` file and add the following configuration.

```json
{
  "compilerOptions": {
    "incremental": true,
    "target": "es6",
    "module": "commonjs",
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "*": [
        "node_modules/*"
      ]
    },
    "esModuleInterop": true
  },
  "include": [
    "src/**/*"
  ]
}
```

Note that the the output of the compiler is pointed to a directory named `dist`. Open `package.json` and add the following configuration.

```json
"main": "dist/server.js",
"scripts": {
  "build": "tsc",
  "prestart": "npm run build",
  "start": "node ."
},
```

When `start` script will be used, `prestart` will fire first, launching `tsc` to compile the TypeScript code and put it in the the `dist` directory.

Rename `src/server.js` to `src/server.ts` and add the following code.

```typescript
import express from 'express';

const app = express();
const port = 8080; // server port

// default route
app.get('/', (req, res) => res.json({
  message: 'Hello World!'
}));

// server
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));
```

Launch the application by executing `yarn start` and you'll get the same application up and running, now with TypeScript support.

## References

**Source code** &mdash; [express-with-typescript](https://gitlab.com/mflash/nodejs-guides/-/tree/master/express-with-typescript)