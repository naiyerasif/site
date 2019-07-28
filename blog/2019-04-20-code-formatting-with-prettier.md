---
title: Code Formatting with Prettier
path: code-formatting-with-prettier
date: 2019-04-20
updated: 2019-04-20
author: [naiyer]
summary: Format JavaScript, TypeScript, HTML, etc with Prettier
tags: ['guide', 'node', 'prettier']
---

## Intent

[Prettier](https://prettier.io) is an opinionated code formatter that removes all original styling and formats the code in a consistent style. It takes your code and reprints it from scratch. [Here are some reasons why you should use prettier](https://prettier.io/docs/en/why-prettier.html). In this guide, you'll integrate it with your Node.js project.

### Setup

You should already have a Node.js project; it could be any Express, Angular or Vue.js project.

## Install Prettier

Start by executing the following command in the directory where `package.json` is located

```bash
npm install --save-dev --save-exact prettier
```

As per Prettier [documentation](https://prettier.io/docs/en/install.html), it is recommended to save an exact version of prettier in your `package.json` since it introduces stylistic changes in patch releases.

## Configure pre-commit hook

It is a good idea to force-format the staged files before you commit them. You can use `pretty-quick` to run prettier on staged files and `husky` to configure a pre-commit hook.

Execute the following command to install dependencies.

```bash
npm install --save-dev pretty-quick husky
```

Add an `fmt` script in `package.json` to format staged files and configure the `husky` object with a hook.

```json
{
  "fmt": "pretty-quick --staged",
  "husky": {
    "hooks": {
      "pre-commit": "npm run fmt"
    }
  }
}
```

## Working with TSLint

If you're working on a TypeScript project, you can use TSLint to format your code with Prettier. Execute the following command to add necessary plugins.

```bash
npm install --save-dev tslint-config-prettier tslint-plugin-prettier
```

Now, open the `tslint.json` file and add the following configuration:

```json
{
  "extends": ["tslint-plugin-prettier", "tslint-config-prettier"],
  "rules": {
    "prettier": true
  }
}
```