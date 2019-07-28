---
title: REST API with Express and TypeScript
path: rest-api-with-express-and-typescript
date: 2019-07-16
updated: 2019-07-16
author: [naiyer]
summary: Create a simple REST API with Express and TypeScript
tags: ['guide', 'express', 'typescript']
---

## Intent

The intent of this guide is to write a simple REST API with Express and TypeScript. Express is a lightweight web framework for Node.js that provides middleware to create a REST API (amongst other things). TypeScript is a superset of JavaScript with types that helps IDEs and editors provide static checking and better code refactoring for Node.js applications.

### Setup

> This guide uses
> - Node 12

Create a directory for your project, say `ts-rest-api`, and open a terminal into it. Execute the following command to initialize it with NPM.

```bash
npm init -y
```

## Create a barebone endpoint

Install `express` as a dependency.

```bash
npm install express
```

Create a file `index.js` in a folder `src` in your project root and add the following code.

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

// Launch the Express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
```

In the `package.json`, add a `main` entry pointing to this file and create a script to launch the application.

```json
"main": "src/index.js",
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
{
  "message": "Hello World!"
}
```

Till this point, your application is not using TypeScript.

## Setup TypeScript

Execute the following command to add TypeScript in your `devDependencies`.

```bash
npm install --save-dev typescript
npm install --save-dev @types/node @types/express
```

The second command adds types for `node` and `express` to help your IDE or editor provide support for types while editing the source code.

You'll need to configure TypeScript compiler `tsc` to let it know where the TypeScript source code is located and where the compiled JavaScript code should be dumped. To do so, execute the following command to generate a `tsconfig.json` file.

```bash
npx tsc --init
```

Open `tsconfig.json` and add the following configuration.

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

Here, you've pointed the output of compiler to a directory `dist`. Open `package.json` and add the following configuration.

```json
"main": "dist/index.js",
"scripts": {
  "build": "tsc",
  "prestart": "npm run build",
  "start": "node ."
},
```

Now, whenever you'll fire up `npm start`, the `prestart` script will launch first which in turn launch `tsc` which'll compile the TypeScript code and put it in `dist` directory.

Change the extension of `src\index.js` from `js` to `ts` and edit it as follows.

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

// Launch the Express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
```

Launch the application by executing `npm start` and you'll get the same application up and running, now with TypeScript support.