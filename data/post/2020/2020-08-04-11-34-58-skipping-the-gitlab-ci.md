---
slug: "2020/08/04/skipping-the-gitlab-ci"
title: "Skipping the GitLab CI"
description: "GitLab CI is a valuable tool for executing CI pipelines with Docker. Learn how to skip it when making changes to README or LICENSE files."
date: 2020-08-04 11:34:58
update: 2020-08-04 11:34:58
type: "guide"
---

[GitLab CI](https://gitlab.com/help/ci/yaml/README.md) is a pretty nifty tool to run your CI pipelines using Docker. At times, you may want to skip it, though, e.g., when you update a README or LICENSE. There are multiple ways to do that.

**Skipping files**  

You can skip the CI for some files using the wildcards and `except.changes` key in the `.gitlab-ci.yml` file, e.g., the following configuration will skip the CI when changes are made to a markdown or `.gitignore` file.

```yml
build:
  script: ./gradlew --build-cache assemble
  except:
    changes:
      - "*.md"
      - ".gitignore"
```

**Skipping a commit**  

You can skip the CI for a commit by adding `[ci skip]` or `[skip ci]` in the commit message. In case you forget to do that, you can pass the `ci.skip` option while pushing your changes.

```sh
git push -o ci.skip
```

Note that this works only for Git 2.10 and onwards.
