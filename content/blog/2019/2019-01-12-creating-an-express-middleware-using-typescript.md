---
title: Creating an Express middleware using TypeScript
path: /creating-an-express-middleware-using-typescript
date: 2019-01-12
updated: 2019-11-13
author: [naiyer]
tags: ['guide']
---

TypeScript [has been gaining](https://2018.stateofjs.com/javascript-flavors/typescript/) popularity and adoption for a while as a strongly-typed flavor of JavaScript. In this guide, we'll explore a possible way to use TypeScript to write an Express middleware.  We'll start with a JavaScript project, add TypeScript support to it and explore some configurations to customize the behavior of TypeScript Compiler (`tsc`).

### Setup

> We'll use
> - Node 12

Let's start by creating a Node.js application. Create a directory `express-rest-app` and open a terminal into it. Execute the following command on the terminal.

```bash
npm init -y
```

This should generate file `package.json`. Open the directory in your favorite editor.

### Table of Contents

## Create an Express app

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

If we send a request to the default endpoint using curl, we'll receive the following JSON message.

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

The second command adds type definitions for `node` and `express` to help the IDE or editor provide support for types while editing the source code.

We need to provide configurations to TypeScript compiler `tsc` to inform it where the TypeScript source code is located and where the compiled JavaScript code should be written at. To do so, execute the following command to generate a `tsconfig.json` file.

```bash
npx tsc --init
```

Open the `tsconfig.json` file and add the following configuration.

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

Here, we've pointed the output of the compiler to a directory named `dist`. Open `package.json` and add the following configuration.

```json
"main": "dist/index.js",
"scripts": {
  "build": "tsc",
  "prestart": "npm run build",
  "start": "node ."
},
```

Now, whenever we'll fire up `npm start`, the `prestart` script will launch first which in turn will launch `tsc` which will compile the TypeScript code and put it in the `dist` directory.

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

> **Source Code**: [express-rest-app](https://github.com/Microflash/guides/tree/master/nodejs/express-rest-app)