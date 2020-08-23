---
title: 'Linting with TypeScript ESLint'
date: 2019-08-16 16:23:12
updated: 2020-02-06 22:51:18
authors: [naiyer]
topics: [typescript, eslint]
---

[TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint) is the successor of [TSLint](https://github.com/palantir/tslint), the linting tool exclusively developed for TypeScript. It leverages the existing JavaScript linting ecosystem and brings consistency across the tooling to lint both JavaScript and TypeScript apps.

In this post, we'll set up linting with TypeScript ESLint for a TypeScript project.

:::tip Article series
1. [Using Express with TypeScript](/blog/2019/01/12/using-express-with-typescript/)
2. [Request logging with morgan](/blog/2019/08/13/request-logging-with-morgan/)
3. [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/)
4. [Linting with TypeScript ESLint](/blog/2019/08/16/linting-with-typescript-eslint/)
5. [Developing an API with Express and Postgres](/blog/2019/08/19/developing-an-api-with-express-and-postgres/)
:::

:::note Setup
You can pick the Node.js application created in the post [Logging on Node.js with log4js-node](/blog/2019/08/14/logging-on-nodejs-with-log4js-node/) to follow this post.
:::

## Install dependencies for `typescript-eslint`

Execute the following commands to add required dependencies for `typescript-eslint`.

```sh
yarn add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## Create configuration file

Generate an `eslint` configuration file with the following command.

```sh
npx eslint --init
```

Replace the contents of `.eslintrc.js` with the following configuration.

```js
module.exports = {
  'parser': '@typescript-eslint/parser',
  'extends': ['plugin:@typescript-eslint/eslint-recommended'],
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': ['@typescript-eslint'],
  'rules': {
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-inferrable-types': [
      'warn', { 'ignoreParameters': true }
    ],
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
```

Edit `package.json` scripts as follows.

```json
"scripts": {
  "prestart": "npm run build && npm run lint",
  "lint": "eslint src/**/* --fix",
}
```

You can lint the files using `yarn lint`. Also, when the application is started with `yarn start`, the `prestart` script will launch the build generation and lint it as well.

## References

**Source code** &mdash; [linting-with-typescript-eslint](https://gitlab.com/mflash/nodejs-guides/-/tree/master/linting-with-typescript-eslint)

**Related**
- [typescript-eslint repo](https://github.com/typescript-eslint/typescript-eslint)
