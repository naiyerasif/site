---
slug: "2023/05/14/rewriting-git-history"
title: "Rewriting Git history"
description: "You should never rewrite Git history. But in case you need to, here's one way you can accomplish this."
date: 2023-05-14 18:45:00
update: 2023-07-30 17:27:10
category: "note"
tags: ["git", "history"]
---

You should never rewrite Git history. But sometimes you might need it (for example, when separating code from a monorepo into a dedicated repository). Here's an approach you can follow to rewrite the Git history.

## Starting an interactive rebase

### Rebasing commits from checked out branch

Start a rebase from the commit from where you want to start the rewrite.

```sh
# to start from a specific commit
git rebase -i <commit_sha>

# to start from root commit
git rebase -i —root
```

### Rebasing commits from one branch to another

Alternatively, you may want to rebase from another branch, say `source`, to a target branch, say `target`. In such a case, start with creating a checkout from `source`.

```sh
# checkout both source and target
git checkout source
git checkout target

# checkout source on a new branch
git checkout -b rebased_target origin/source

# start the rebase
git rebase -i target
```

## Modifying the changesets

You might want to drop, squash, or edit some commits. When you mark all the items for the action that you want to take on a commit and quit the rebase dialog, rebase will start immediately. It'll show you remaining items to be rebased on a counter in the terminal.

![A rebase counter](/images/post/2023/2023-05-14-18-45-00-rewriting-git-history-01.png)

### Editing the changesets

Rebase will pause on the first commit where it encounters 
- a conflict (due to drop or squash action), or
- an edit action

In case of conflict, you'll have to resolve them. In case of edit, you can edit the files in the changeset. Once done, you can commit the changeset.

```sh
# opens the commit screen to review the commit message
git commit
```

### Preserving the original commit timestamp

The `git commit` command doesn't keep the original commit timestamp. You can manually set `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables to keep the commit timestamp, as follows.

```sh
COMMIT_DATE="2023-05-14T09:31:15Z" GIT_AUTHOR_DATE=$COMMIT_DATE GIT_COMMITTER_DATE=$COMMIT_DATE git commit
```

## Finishing the rebase

After the commit, you'll have to explicitly continue the rebase.

```sh
git rebase —continue
```

After this command, you'd notice that the rebase count jumps up and the next changeset appears in the filesystem. Repeat the earlier steps for all changesets to finish the rewrite.
