---
title: 'Syncing with a massive Git upstream'
date: 2019-12-23 14:23:12
authors: [naiyer]
topics: [git]
---

If a repository has an extremely long history or large size in the version control, contributing to it becomes a challenge. If you execute `git clone` on it, Git will try to download the entire history. This can take up a considerable amount of disk space, network bandwidth and time. How can you handle this scenario?

## Start with a shallow clone

Let's assume that you've forked the repository you want to contribute to. Now, clone only a portion of the commit history that is required for you to work with. Let's say you're interested only in the last 3 commits from the HEAD. You can shallow clone the repository with the following command.

```sh
git clone --depth 3 https://github.com/fork/massive.git
```

A **shallow clone**, as per the [docs](https://www.git-scm.com/docs/git-clone#Documentation/git-clone.txt---depthltdepthgt) fetches a history truncated to the specified number of commits. Also, note that the command mentioned above will only fetch the default branch. This happens because `--single-branch` flag is implied automatically. To fetch the history near the tips of the other branches, `--no-single-branch` flag should be specified while cloning.

In case you forget specifying `--no-single-branch` flag, you can examine the fetch configuration.

```sh
$ git config --get remote.origin.fetch
+refs/heads/master:refs/remotes/origin/master
```

and edit it to fetch the history from all the branches.

```sh
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
```

Execute `git remote update origin` and Git will fetch the history up to the requested depth.

## Add the remote upstream

Add the remote upstream repository so that you can sync with the changes merged into it by other contributors.

```sh
git remote add upstream https://github.com/example/massive.git
```

Just like the fork, you can fetch the history of the upstream upto a certain depth from the HEAD.

```sh
git fetch --depth 2 upstream
```

## Checkout a branch from the upstream

Create a new branch from the HEAD of an upstream branch.

```sh
git checkout -b latest upstream/dev
```

Make your changes, commit them and set the local `latest` branch to track the remote of your fork. 

```sh
git branch latest --set-upstream-to origin/latest
```

When you'll push the changes, `origin/latest` branch of the fork will be updated. You can then create a PR on the upstream repository for your changes to be merged.
