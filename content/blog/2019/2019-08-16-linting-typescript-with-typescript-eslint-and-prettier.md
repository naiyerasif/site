---
title: Linting TypeScript with TypeScript ESLint and Prettier
path: /linting-typescript-with-typescript-eslint-and-prettier
date: 2019-08-16
updated: 2019-08-16
author: [naiyer]
summary: Setup a TypeScript project with linting by TypeScript ESLint and formatting through Prettier
tags: ['guide']
---

## Intent

In this guide, you'll learn to set up linting with [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint) for a TypeScript project with support for Prettier.

### Setup

> This guide uses
> - Node 12

You should already have a TypeScript project; it could be any Express or Angular project. Download the one created at the end of the post [Code Formatting with Prettier](/blog/2019/04/20/code-formatting-with-prettier) to follow this guide.

### Table of Contents

## Setup TypeScript ESLint

Execute the following commands to add required dependencies for `typescript-eslint`.

```bash
npm install --save-dev eslint eslint-plugin-import 
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin 
```

Generate an `eslint` configuration file with the following command. Choose `JSON` as the file format.

```bash
npx eslint --init
```

Replace the contents of `.eslintrc.json` with the following configuration.

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "eol-last": ["error", "always"],
    "indent": ["error", 2],
    "quotes": ["error", "double"]
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".ts", ".d.ts"]
      }
    }
  }
}
```

Edit `package.json` scripts as follows.

```json
"scripts": {
  "prestart": "npm run lint && npm run build",
  "lint": "eslint --fix src/**/*",
},
```

Executing `npm start` will now trigger `eslint` and fix some of the linting errors in the files.

## Setup Prettier with TypeScript ESLint

Add `prettier` as a developer dependency as follows.

```bash
npm install --save-dev --save-exact prettier
```

Then add plugins for `eslint` with the following commands.

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

Edit the `.eslintrc.json` file to add the following configuration under `extends` key.

```json
"extends": [
  // Other extensions
  "plugin:prettier/recommended",
  "prettier/@typescript-eslint"
],
```

Now, `typescript-eslint` will play nice with `prettier` and use it to format while linting the source code.

## References

> **Source Code** &mdash; [linting-with-typescript-eslint](https://github.com/Microflash/guides/tree/master/nodejs/linting-with-typescript-eslint)
> 
> **Discussions**
> - Niko Montana: <https://github.com/typescript-eslint/typescript-eslint/issues/36#issuecomment-494764385>