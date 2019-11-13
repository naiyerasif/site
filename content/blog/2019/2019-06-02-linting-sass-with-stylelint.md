---
title: Linting SASS with stylelint
path: /linting-sass-with-stylelint
date: 2019-06-02
updated: 2019-08-08
author: [naiyer]
tags: ['gist']
---

Just as you can lint the JavaScript or TypeScript code in a web application, you can also lint the [SASS](https://sass-lang.com/) (or SCSS) files using [stylelint](https://github.com/stylelint/stylelint). `stylelint` is a widely used linter that works with SCSS, Sass, Less and SugarSS. It supports a plugin system through which we can extend its behavior. In this gist, we'll explore how we can use `stylelint` to lint SASS files in a project.

### Setup

Any Node.js project using SASS can be used to follow this example.

### Table of Contents

## Install Stylelint

Execute the following command to add `stylelint`.

```bash
npm install --save-dev stylelint
```

## Add NPM script for linting

Assuming your SASS code resides in the `src` directory, you can configure the following NPM script.

```json
"lint-scss": "stylelint \"src/**/*.scss\" --cache --cache-location .cache/.stylelintcache",
```

This script will run `stylelint` over all `scss` files in the `src` directory and store a cache of results in `.cache/.stylelintcache` directory. Make sure that `.cache/` is in your `.gitignore`.

If you want to ignore certain files, create a `.stylelintignore` in the project root and add the paths of those files. You can also add directories (just as you would in a `.gitignore` file).

If you want to customize the behavior of `stylelint`, create a `.stylelintrc` file in the root of your project. This file can be either in JSON or YAML format. You can also add an extension (like `stylelintrc.json`, `.stylelintrc.yml`, etc) to gain editor support.

## Autofixing errors

If your stylesheets are massive and you ran `stylelint` for the first time, you might get a huge number of violations. Instead of fixing all those violations by hand, you can put `stylelint` to work for you. Add the following script to let `stylelint` fix some of the violations automatically.

```json
"fix-scss": "stylelint \"src/**/*.scss\" --fix",
```

> As noted in the `stylelint` docs, autofixing is an *experimental* feature; it does not respect special comments for disabling `stylelint` within sources (e.g., `/* stylelint-disable-line */`). It is recommended to run `stylelint` twice if you're using both these special comments and autofixing. On the first run, some violations could be missed or reported incorrectly.

## Extending stylelint configurations

`stylelint` supports shareable configurations which enable it to work with formatters like `prettier` and frameworks like `Bootstrap`. In a typical project, such utilities or frameworks are quite common and extending `stylelint` configuration will reduce friction between the linting and editing workflows.

### Extending stylelint for prettier

`stylelint-config-prettier` is a configuration that disables `stylelint` rules that conflict with Prettier. `stylelint-prettier` is a plugin that adds a rule that formats content using Prettier. It also exposes a *recommended* configuration that configures both `stylelint-prettier` and `stylelint-config-prettier` in a single step. Add both `stylelint-prettier` and `stylelint-config-prettier` as developer dependencies,

```bash
npm install --save-dev stylelint-config-prettier stylelint-prettier
```

then extend the recommended configuration by adding the following configuration in `.stylelintrc`.

```json
{
  "extends": [
    // Other extensions
    "stylelint-prettier/recommended"
  ]
}
```

### Extending stylelint for Bootstrap

If you are working with Bootstrap, you can extend the behavior of `stylelint` with Bootstrap-specific linting configuration. Execute the following command to add the Bootstrap-specific linting extension.

```bash
npm install --save-dev stylelint-config-twbs-bootstrap
```

Open `.stylelintrc` and add the following configuration.

```json
{
  "extends": [
    // Other extensions
    "stylelint-config-twbs-bootstrap/scss"
  ]
}
```