---
slug: "2023/05/14/rewriting-git-history"
title: "Rewriting Git history"
description: "You should never rewrite Git history. But in case you need to, here's one way you can accomplish this."
date: 2023-05-14 18:45:00
update: 2023-05-14 18:45:00
category: "note"
tags: ["git", "history"]
---

You should never rewrite Git history. But sometimes you might need it (for example, when separating code from a monorepo into a dedicated repository). Here's an approach you can follow to rewrite the Git history.

Start a rebase from the commit from where you want to start the rewrite.

```sh
# to start from a specific commit
git rebase -i <commit_sha>

# to start from root commit
git rebase -i —root
```

Mark all the items for edit and quit the rebase dialog. The rebase will immediately start and it'll show you remaining items to be rebased.

Edit the first changeset on the file system and commit it.

```sh
# edit the commit message
git commit -m "<commit_message>"
```

This command doesn't keep the original commit timestamp. You can set `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables to keep the commit timestamp, as follows.

```sh
COMMIT_DATE="2023-05-14T09:31:15Z" GIT_AUTHOR_DATE=$COMMIT_DATE GIT_COMMITTER_DATE=$COMMIT_DATE git commit -m "<commit_message>"
```

After the commit, you'll have to explicitly jump to the next rebase operation.

```sh
git rebase —continue
```

After this command, you'd notice that the rebase count jumps by 1 and the next changeset appears in the filesystem. Repeat this for all changesets to finish the rewrite.
