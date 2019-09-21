---
title: Creating an Express application using TypeScript
path: creating-an-express-application-using-type-script
date: 2019-01-12
updated: 2019-09-20
author: [naiyer]
summary: Bootstrap a Node.js project using Express.js with TypeScript support
tags: ['guide', 'express', 'typescript', 'nodejs']
---

## Intent

The intent of this guides is to create a simple Node.js application using Express.js as the middleware with TypeScript support. You'll start with a JavaScript application and add TypeScript support to it.

### Setup

> This guide uses
> - Node 12

Start by creating a Node.js application. Create a directory `express-rest-app` and open a terminal into it. Execute the following command on the terminal.

```bash
npm init -y
```

This should generate file `package.json`. Open the directory in your favorite editor.

### Table of Contents

## Create a barebone endpoint

Install `express` as a dependency.

```bash
npm install express
```

Create a file `index.js` in a folder `dist` in your project root and add the following code.

```js
const express = require("express");
const app = express();
const port = 8080; // default port for express

// default route handler
app.get("/", (req, res) => {
  res.jsonp({
    message: "Hello World!"
  });
});

// start the express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
```

In the `package.json`, add a `main` entry pointing to this file and create a script to launch the application.

```json
"main": "dist/index.js",
"scripts": {
  "start": "node ."
},
```

Open the terminal and execute `npm start` to launch the application. You should see the following message on the terminal.

```bash
Server started at http://localhost:8080
```

Send a request to the default endpoint using curl and you'll receive a JSON message.

```bash
$ curl -X GET http://localhost:8080/
{"message":"Hello World!"}
```

At this point, this application is not using TypeScript.

## Setup TypeScript

Execute the following command to add TypeScript in your `devDependencies`.

```bash
npm install --save-dev typescript
npm install --save-dev @types/node @types/express
```

The second command adds type definitions for `node` and `express` to help your IDE or editor provide support for types while editing the source code.

You'll need to provide configurations to TypeScript compiler `tsc` to let it know where the TypeScript source code is located and where the compiled JavaScript code should be written at. To do so, execute the following command to generate a `tsconfig.json` file.

```bash
npx tsc --init
```

Open `tsconfig.json` file and add the following configuration.

```json
{
  "compilerOptions": {
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

Here, you've pointed the output of the compiler to a directory named `dist`. Open `package.json` and add the following configuration.

```json
"main": "dist/index.js",
"scripts": {
  "build": "tsc",
  "prestart": "npm run build",
  "start": "node ."
},
```

Now, whenever you'll fire up `npm start`, the `prestart` script will launch first which in turn will launch `tsc` which'll compile the TypeScript code and put it in `dist` directory.

Copy `dist/index.js` to `src/index.ts` and edit it as follows.

```typescript
import express from "express";
const app = express();
const port = 8080; // default port for express

// default route handler
app.get("/", (req, res) => {
  res.jsonp({
    message: "Hello World!"
  });
});

// start the express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
```

Launch the application by executing `npm start` and you'll get the same application up and running, now with TypeScript support.

## References

> **Source Code** &mdash; [express-rest-app](https://github.com/Microflash/guides/tree/master/nodejs/express-rest-app)