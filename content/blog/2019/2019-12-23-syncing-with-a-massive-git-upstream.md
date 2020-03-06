---
title: 'Syncing with a massive Git upstream'
date: 2019-12-23 14:23:12
authors: [naiyer]
tags: ['tip']
---

If the upstream Git repository is extremely large, cloning it on local and syncing the changes with the remote becomes a challenge since a `git clone` will try to download the entire history. This tip shows you one of the ways to handle this problem.

## Start with a shallow clone

Clone only a portion of history that is required for your work by using `--depth` option.

```sh
git clone --depth 3 https://github.com/Example/massive.git
```

> This may only fetch the default branch (say, `master`) up to the specified depth. 

> If you execute `git fetch`, Git may not pull other branches. Why so? Your configuration may be a culprit.
>
> ```sh
> $ git config --get remote.origin.fetch
> +refs/heads/master:refs/remotes/origin/master
> ```
>
> As you can see, `remote.origin.fetch` is configured to fetch only the `master`. To pull other branches, change this configuration as follows.
>
> ```sh
> git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
> ```
> 
> Now, if you sync the remote with
>
> ```sh
> git remote update origin
> ```
>
> all the branches should be pulled by Git.

## Add the remote upstream

So far, we've managed to sync with the fork of an upstream repository upto a certain depth (`3` in the example above).

To start syncing with the upstream, add it to your remotes.

```sh
git remote add upstream https://github.com/Example/massive-upstream.git
```

Now, fetch the required history (say `2` levels of depth) of the upstream with the following command.

```sh
git fetch --depth 2 upstream
```

## Checkout a branch from the upstream

Create a new branch from the HEAD of an upstream branch.

```sh
git checkout -b latest upstream/latest
```

This branch is currently available only on local. You need to track this branch on remote.

```sh
git branch latest --set-upstream-to origin/latest
```

Alternatively, you might want to merge the latest changes into the fork's `master`. To do that, first checkout the master and then merge the HEAD of the `upstream/master`.
