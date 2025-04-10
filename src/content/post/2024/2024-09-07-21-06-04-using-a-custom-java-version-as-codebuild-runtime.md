---
slug: "2024/09/07/using-a-custom-java-version-as-codebuild-runtime"
title: "Using a custom Java version as CodeBuild runtime"
date: 2024-09-07 21:06:04
update: 2024-10-07 20:32:08
type: "note"
---

[CodeBuild](https://aws.amazon.com/codebuild/) offers a [range](https://docs.aws.amazon.com/codebuild/latest/userguide/runtime-versions.html) of Java versions on its [standard Linux images](https://docs.aws.amazon.com/codebuild/latest/userguide/available-runtimes.html). But what if your preferred version isn't on the list? Unlike Node.js with [n](https://github.com/tj/n) or Go with [goenv](https://github.com/go-nv/goenv), standard CodeBuild images don't come with a handy tool to switch Java versions. The simplest way I've found is to install a custom version of Amazon's [Corretto](https://aws.amazon.com/corretto/) Java distribution with `java: corretto<major_version>` property in `buildspec.yml`. Here is how you can do it on `Amazon Linux 2023 x86_64 standard:5.0` runtime of CodeBuild.

```yaml title="buildspec.yml"
version: 0.2

phases:
  install:
    runtime-versions:
      java: corretto22

  # use Java 22 in the next phases
```

> ~~You'll need to manually set `JAVA_HOME`, `JRE_HOME`, and `JDK_HOME` because these variables don't get set properly &mdash; at least for now (there is an [issue](https://github.com/aws/aws-codebuild-docker-images/issues/738) tracking it).~~ AWS has patched the `JAVA_HOME` issue, so setting the runtime is now enough.
