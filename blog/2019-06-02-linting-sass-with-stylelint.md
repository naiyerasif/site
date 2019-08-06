---
title: Linting SASS with Stylelint
path: linting-sass-with-stylelint
date: 2019-06-02
updated: 2019-06-02
author: [naiyer]
summary: Lint SASS files with Stylelint and integrating it with Prettier
tags: ['guide', 'sass', 'stylelint']
---

## Intent

It is quite usual to lint the JavaScript or TypeScript code in a web application but you can lint [SASS](https://sass-lang.com/) (or CSS) as well. In fact, it is a good idea to do so to improve the quality of your CSS. Like JSLint or TSLint, [Stylelint](https://github.com/stylelint/stylelint) is a widely used linter that works with SCSS, Sass, Less and SugarSS. This guide shows you how `stylelint` can be used to lint SASS in a project.

### Setup

You should already have a Node.js project with SASS; it could be any Angular or Vue.js project.

### Table of Contents

## Install Styelint

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