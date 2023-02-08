---
slug: "2020/09/05/using-git-lfs-in-ci"
title: "Using Git LFS in CI"
description: "Git LFS is the recommended way to version large binary files alongside the source code in Git. Your CI will pull these objects every time it runs the pipeline which can be a problem if you’ve limited bandwidth. What can you do get around this issue?"
date: "2020-09-05 12:31:38"
update: "2020-09-05 12:31:38"
category: "guide"
tags: ["git", "lfs", "ci"]
---

[Git LFS](https://git-lfs.github.com/) is a great way to version large binary files alongside the source code in Git. It replaces the actual files with text pointers in the Git repository and stores them on a remote server that works with Git LFS (e.g., GitHub.com, Azure DevOps, etc.). When you clone a repository with LFS objects, you'll receive the pointers instead. You'll have to install [the Git LFS client](https://github.com/git-lfs/git-lfs/releases/latest) which will convert these pointers into actual files during the checkout; this process is called **smudging**. You can watch an introduction to how this works on the following YouTube video.

::youtube[Git Large File Storage - How to Work with Big Files?]{#uLR1RNqJ1Mw}

Many Git vendors put certain bandwidth limits on LFS pulls. For example, GitHub provides 1 GB a month of free bandwidth for pulling LFS objects. Your CI will pull these objects every time it runs the pipeline. Depending on your project size and the frequency of CI, you may eventually hit the bandwidth limit. To avoid this from happening, you can cache the LFS objects and reuse the cache between the builds.

## Creating a lockfile for the LFS assets

Every LFS asset has a unique 64-character object identifier (OID). You can create a lockfile (say, `.lfs-assets-id`) containing the OIDs of all the LFS objects and use it as a key to generating a cache.

:::note{title=Lockfile}
A lockfile stores the specific versions of the dependencies specified by a management system (e.g., a package manager, file system, etc). In other words, it *locks* the versions of those dependencies. Common examples of the lockfiles are `package-lock.json` used by the [Node Package Manager](https://docs.npmjs.com/configuring-npm/package-lock-json.html), `Cargo.lock` used by [Cargo](https://doc.rust-lang.org/cargo/), etc. The purpose of a lockfile is to enable the system to recreate the dependency graph accurately. In a CI environment, a lockfile helps ensure that your pipelines are immutable.
:::

To begin with, you'll need the OIDs of the LFS objects, which can be found by `ls-files` command.

```sh
$ git lfs ls-files -l

eb732e65ea439f310b442ca8cc549262aadccb1debad1bbe991f0e2b56a17b10 * favicon.ico
5f98669c05b808ac70c582d8eb56d964bf12281273575c7dfaf21936ce59581e * favicon.svg
bf5dc1cc2494073310cf96b1af6d802c981d9eb3f19dd1941a344555b62deae7 * google-touch-icon.png
860e1154d9c6a6fb0fc2f6251d70d4f717cce1cfbad62fa91293eb071b361b05 * mask-icon.svg
```

Remove the file names and other stuff by cutting the OID on each line. You can do this with the `cut` command.

```sh
$ git lfs ls-files -l | cut -d' ' -f1

eb732e65ea439f310b442ca8cc549262aadccb1debad1bbe991f0e2b56a17b10
5f98669c05b808ac70c582d8eb56d964bf12281273575c7dfaf21936ce59581e
bf5dc1cc2494073310cf96b1af6d802c981d9eb3f19dd1941a344555b62deae7
860e1154d9c6a6fb0fc2f6251d70d4f717cce1cfbad62fa91293eb071b361b05
```

Finally, sort the OIDs so that the lockfile remains the same even when the order in which the files are pulled changes.

```sh
$ git lfs ls-files -l | cut -d' ' -f1 | sort > .lfs-assets-id

$ cat .lfs-assets-id

5f98669c05b808ac70c582d8eb56d964bf12281273575c7dfaf21936ce59581e
860e1154d9c6a6fb0fc2f6251d70d4f717cce1cfbad62fa91293eb071b361b05
bf5dc1cc2494073310cf96b1af6d802c981d9eb3f19dd1941a344555b62deae7
eb732e65ea439f310b442ca8cc549262aadccb1debad1bbe991f0e2b56a17b10
```

This lockfile should serve our purpose: it'd change only when you add a new LFS object or modify an existing one. Whenever this file will change, Git LFS will pull the new objects from the remote server, else it'll reuse the objects from the cache.

## Caching the LFS assets with CircleCI

For a [CircleCI](https://circleci.com/) pipeline, you'd need a Docker image with the Git LFS client installed. For example, in the case of a Node.js project, you can create a custom image (call it `microflash/node:14-buster`) using the following Dockerfile.

```dockerfile
FROM circleci/node:14-buster
RUN sudo apt-get update \
  && sudo apt-get install -y git-lfs \
  && sudo git lfs install
CMD ["/bin/sh"]
```

You can publish this image on [Docker Hub](https://hub.docker.com/) and use it in your pipeline as follows.

```yml {9,12-22}
# .circleci/config.yaml

version: 2
jobs:
  build:
    docker:
      - image: microflash/node:14-buster
    environment:
      - GIT_LFS_SKIP_SMUDGE: 1
    working_directory: ~/repo
    steps:
      - checkout
      - run: git lfs ls-files -l | cut -d' ' -f1 | sort > .lfs-assets-id
      - restore_cache:
          keys:
            - v1-lfscache-{{ checksum ".lfs-assets-id" }}
            - v1-lfscache-
      - run: git lfs pull
      - save_cache:
          paths:
            - .git/lfs
          key: v1-lfscache-{{ checksum ".lfs-assets-id" }}
      # other steps
```

In this configuration, we're 
- creating the lockfile `.lfs-assets-id` after the checkout
- restoring the LFS cache
- executing `git lfs pull` to pull any changes, and
- recreating the LFS cache (only when any new object is pulled)

Note that the above configuration sets an environment variable `GIT_LFS_SKIP_SMUDGE=1`; this is needed to prevent the checkout step from smudging the LFS objects before the cache is restored.

## Caching LFS assets with GitHub Actions

You can do the same thing with GitHub Actions. In your configuration file, add the following steps. 

```yml {7-18}
# .github/workflows/deploy.yml

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: checkout source
        uses: actions/checkout@v2
      - name: generate lfs file list
        run: git lfs ls-files -l | cut -d' ' -f1 | sort > .lfs-assets-id
      - name: restore lfs cache
        uses: actions/cache@v2
        id: lfs-cache
        with:
          path: .git/lfs
          key: ${{ runner.os }}-lfs-${{ hashFiles('.lfs-assets-id') }}-v1
      - name: pull lfs files
        run: git lfs pull
      
      # other steps
```

Note that GitHub's [checkout action](https://github.com/actions/checkout) provides Git LFS support by default, so you won't have to create a custom Docker image in this case.

:::postscript
Related
- [Avoiding git-lfs bandwidth waste with GitHub and CircleCI](https://www.develer.com/en/avoiding-git-lfs-bandiwdth-waste-with-github-and-circleci/)
- [Cache for LFS](https://github.com/actions/checkout/issues/165#issuecomment-657673315)
:::
