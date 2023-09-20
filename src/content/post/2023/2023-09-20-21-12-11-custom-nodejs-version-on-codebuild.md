---
slug: "2023/09/20/custom-nodejs-version-on-codebuild"
title: "Custom Node.js version on CodeBuild"
date: 2023-09-20 21:12:11
update: 2023-09-20 21:12:11
category: "status"
---

<abbr title="Today I learned">TIL</abbr> that Amazon Linux [runtime](https://docs.aws.amazon.com/codebuild/latest/userguide/available-runtimes.html) comes with [n](https://github.com/tj/n), a Node.js version manager, out of box. So, if you needed Node.js 17 on Amazon Linux 2 `x86_64 standard:5.0` (which comes with Node.js 18), you can install it with `n` during the `install` phase in your [buildspec.yml](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html) file.

```yml {5,10-11} caption="buildspec.yml"
version: 0.2

env:
  variables:
    CUSTOM_NODE_VERSION: 17

phases:
  install:
    commands:
      - n $CUSTOM_NODE_VERSION
      - node -v

# rest of the buildspec.yml
```

This might come handy during Node.js migrations.
