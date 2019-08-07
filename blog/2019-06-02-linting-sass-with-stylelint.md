---
title: Linting SASS with Stylelint
path: linting-sass-with-stylelint
date: 2019-06-02
updated: 2019-08-08
author: [naiyer]
summary: Analyze and fix problems in the SASS files with Stylelint and integrate it with Prettier
tags: ['guide', 'sass', 'stylelint']
---

## Intent

Just as you can lint the JavaScript or TypeScript code in a web application, you can also lint the [SASS](https://sass-lang.com/) (or CSS) files using [stylelint](https://github.com/stylelint/stylelint) which is a widely used linter that works with SCSS, Sass, Less and SugarSS. This guide shows you how `stylelint` can be used to lint SASS files in a project.

### Setup

You should already have a Node.js project with SASS; it could be any Angular or Vue.js project.

### Table of Contents

## Install Stylelint

Execute the following command to add `stylelint`.

```bash
npm install --save-dev stylelint
```

## Add NPM script for linting

Assuming your SASS code resides in `src` directory, you can configure the following NPM script.

```json
"lint-scss": "stylelint \"src/**/*.scss\" --cache --cache-location .cache/.stylelintcache",
```

This script will run `stylelint` over all `scss` files in `src` directory and store a cache of results in `.cache/.stylelintcache` directory. Make sure that `.cache/` is in your `.gitignore`.

### Configuration files

You can create `.stylelintignore` and `.stylelintrc` files in the root of your project. The former is used to ignore stylesheets in specified files and directories (just like `.gitignore`), while the latter is used to configure the behavior of `stylelint`.

## Autofixing errors

If your stylesheets are massive and you ran `stylelint` for the first time, you might get a huge number of violations. Instead of fixing all those violations by hand, you can put `stylelint` to work for you. Add the following script to let `stylelint` fix some of those violations automatically.

```json
"fix-scss": "stylelint \"src/**/*.scss\" --fix",
```

> As noted in the `stylelint` docs, autofixing is an *experimental* feature; it does not respect special comments for disabling `stylelint` within sources (e.g., `/* stylelint-disable-line */`). It is recommended to run `stylelint` twice if you're using both these special comments and autofixing. On the first run, some violations could be missed or reported incorrectly.

## Integrating Prettier with Stylelint

`stylelint-config-prettier` is a configuration that disables `stylelint` rules that conflict with Prettier. `stylelint-prettier` is a plugin that adds a rule that formats content using Prettier. It also exposes a *recommended* configuration that configures both `stylelint-prettier` and `stylelint-config-prettier` in a single step. Add both `stylelint-prettier` and `stylelint-config-prettier` as developer dependencies, then extend the recommended configuration.

```bash
npm install --save-dev stylelint-config-prettier stylelint-prettier
```

Then add the following in `.stylelintrc`.

```json
{
  "extends": [
    // Other extensions
    "stylelint-prettier/recommended"
  ]
}
```

## Working with Bootstrap

If you are working with Bootstrap, you can extend the behavior of `stylelint` with Bootstrap-specific linting configuration. Execute the following command to add Bootstrap-specific linting extension.

```bash
npm install --save-dev stylelint-config-twbs-bootstrap
```

Open `.stylelintrc` and add the following configuration.

```json
{
  "extends": ["stylelint-config-twbs-bootstrap/scss"]
}
```