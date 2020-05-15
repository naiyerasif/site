---
id: collection-1
title: 'Git Playbook'
description: 'Useful git commands, tips and shortcuts'
toc: true
enableEdit: true
---

## Setup

###### Setup a local directory as a Git repository

```sh
git init
git init <directory_path>
```

###### Retrieve a repository from remote through a URL

```sh
git clone <repository_url>
git clone -b <branch> <repository_url>
```

## Configure

Remove `--global` flag to set the configuration only for a given Git project.

###### Set a name and email to associate with the history

```sh
git config --global user.name "<name>"
git config --global user.email "<email_address>"
```

###### Set automatic command line coloring to review easily

```sh
git config --global color.ui auto
```

###### Enable autocorrect (with a 1.5 second delay)

```sh
git config --global help.autocorrect 15
```

###### Set an alias for a command

```sh
git config --global alias.<new_alias> <git_function>
```

Use quotes if the alias contains multiple functions.

###### Unset a configuration

```sh
git config --unset-all user.name
git config --unset-all user.email
```

###### List the configurations

```sh
git config --global --list
```

## Stage & Snapshot

###### Show modified files in the working directory, staged for the next commit

```sh
git status
git status -sb
```

`-sb` flag displays a styled status, instead of the plain one.

###### Add a file or directory to the next commit

```sh
git add <path>
```

###### Add all the modified files to the next commit

```sh
git add .
```

###### Stripspace a file

Strip trailing whitespaces, collapse newlines and add a newline at the end of a file with stripspacing.

```sh
git stripspace < README.md
```

###### Show files to be removed from working directory.

```sh
git clean -n
```

`-f` in place of the `-n` flag executes the clean

###### Unstage a file while retaining the changes in working directory

```sh
git reset <file_path>
```

### Revert

###### Revert a commit to undo all the changes made in it, then apply it to the current branch

```sh
git revert <SHA>[ <SHA> ...]
```

Revert `n` commits by providing as many SHAs.

###### Revert last N commits

```sh
git revert HEAD~N..HEAD
```

###### Revert a range of commits

```sh
git revert <SHA1>..<SHA4>
```

### Commit

###### Commit the staged content

```sh
git commit -m "<message>"
```

###### Commit all the local changes in tracked files

```sh
git commit -a
```

###### Commit with no change

```sh
git commit -m "<message>" --allow-empty
```

###### Amend a previous commit

```sh
git commit --amend --no-edit
```

This is useful when the new changes are trivial enough not to warrant a new commit over the previous one.

###### Commit without triggering any precommit or commit-msg hooks

```sh
git commit --no-verify
```

### Temporary Commits

###### Save modified and staged changes

```sh
git stash
```

###### Save a subset of modified and staged file(s)

```sh
git stash push -m <message> <file_path>[ <file_path1> ...]
```

###### Stash untracked files

```sh
git stash push --include-untracked
```

###### List stack-order of stashed file changes

```sh
git stash list
```

###### Write working from top of stash stack

Pop deletes the stash from the stack after it has been applied on the repository.

```sh
git stash pop
git stash pop stash@{<stash_id>}
```

Specify a `<stash_id>` to write a particular stash on the repository and subsequently delete it from the stack.

###### Write a particular file from stash

```sh
git checkout stash -- <file_path>
git checkout stash@{<stash_id>} -- <file_path>
```

Specify a `<stash_id>` to unstash a file from a particular stash and write it in the repository.

###### Write a particular file from stash on a new branch

```sh
git stash branch <branch_name>
git stash branch <branch_name> stash@{<stash_id>}
```

###### Apply the top of stash without deleting it

```sh
git stash apply
git stash apply stash@{<stash_id>}
```

Specify a `<stash_id>` to write a particular stash on the repository without deleting it from the stack.

###### Display a summary of stash diffs

```sh
git stash show
git stash show -p
git stash show stash@{<stash_id>}
```

Use `-p` to display the full diff. Specify a `<stash_id>` to display the diff summary of a particular stash.

###### Discard the changes from top of stash stack

```sh
git stash drop
git stash drop stash@{<stash_id>}
```

Specify a `<stash_id>` to drop a particular stash.

###### Discard all stashes in a repository

```sh
git stash clear
```

## Ignore Patterns

###### System wide ignore pattern for all local repositories

```sh
git config --global core.excludesfile <file_path>
```

###### Ignore a file only on local repository

```sh
git update-index --assume-unchanged <file_path>
```

Vice-versa, to unignore a file, use `--no-assume-unchanged` flag in the above command.

###### Ignore files in a directory only on local repository

```sh
cd <directory_path>
git ls-files -z | xargs -0 git update-index --assume-unchanged
```

###### Save a file with desired patterns as .gitignore with either direct string matches or wildcards.

```properties
logs/
*.notes
pattern*/
```

## Branch & Merge

###### List the branches

```sh
git branch
```

A `*` will appear next to the currently active branch.

###### Create a new branch at the current commit

```sh
git branch <branch>
```

###### Delete a local branch

```sh
git branch -d <branch>
git branch -D <branch>
```

`-d` is an alias for `--delete`, which only deletes the branch if it has already been fully merged in its upstream branch. Use `-D`, which is an alias for `--delete --force`, to delete the branch irrespective of its merged status.

###### Delete a remote branch

```sh
git push <remote> --delete <branch>
```

In most cases, `<remote>` is `origin`.

###### Switch to another branch and check it out into your working directory

```sh
git checkout -b <branch>
git checkout -
```

Switch to the previous branch by using `-`.

###### Create an orphan branch

```sh
git checkout --orphan <branch>
git rm -rf .
```

###### Merge the specified branch’s history into the current one

```sh
git merge <branch>
```

###### Find all branches that have been merged into the current branch

```sh
git branch --merged
```

Vice-versa, list the branches that have not been merged into the current branch using the flag `--no-merged`.

## Inspect & Compare

###### Show any object in Git in human-readable format

```sh
git show <SHA>
```

### Log

###### Show the commit history for the currently active branch

```sh
git log
```

###### Show the commits on `branchA` that are not on `branchB`

```sh
git log branchB..branchA
```

###### Show the commits that changed file, even across renames

```sh
git log --follow <file_path>
```

###### Show all commit logs with indication of any paths that moved

```sh
git log --stat -M
```

###### Limit number of commits

```sh
git log -<limit>
```

###### Condense each commit to a single line

```sh
git log --oneline
```

###### Styled log to print logs in prettyprint

```sh
git log --all --graph --pretty=format:'%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative
```

### Diff

###### Diff of what is changed but not staged

```sh
git diff
```

###### Diff of what is staged but not yet committed

```sh
git diff --staged
```

###### Show the diff of what is in `branchA` that is not in `branchB`

```sh
git diff branchB...branchA
```

## Track Path Changes

###### Delete the file from project and stage the removal for commit

```sh
git rm <file_path>
```

###### Remove all deleted files from the working tree (synonym of `git add .` but only for deleted files)

```sh
git rm $(git ls-files -d)
```

###### Change an existing file path and stage the move

```sh
git mv <existing_path> <new_path>
```

## Search & Browse

###### Search all previous commit messages and find the most recent one matching the query

`<query>` is a case-sensitive search term

```sh
git show :/<query>
```

Press `q` to quit the query.

###### Find a list of lines matching a pattern from all files

```sh
git grep <keyword>
git grep -e <regex or glob>
```

Besides a keyword, you can also use regex or glob patterns. You can even chain multiple expressions through `--and`, `--or` and `--not` flags.

###### Web Server for Browsing Local Repositories

```sh
git instaweb
```

## Share & Update

###### Add a git URL as an alias

```sh
git remote add <alias> <url>
```

###### Fetch down all the branches from that Git remote

```sh
git fetch <alias>
git fetch <alias> <branch>
```

###### Merge a remote branch into the current branch to bring it up to date

```sh
git merge <alias>/<branch>
```

###### Transmit local branch commits to the remote repository branch

```sh
git push <alias> <branch>
```

###### Fetch and merge any commits from the tracking remote branch

```sh
git pull
```

## Rewrite History

###### Apply any commits of current branch ahead of specified one

```sh
git rebase <branch>
```

###### Show a log of changes to the local repository’s HEAD

```sh
git reflog
```

###### Clear staging area, rewrite working tree from specified commit

```sh
git reset --hard <commit>
git reset --hard <branch>@{<spec>}
```

`<spec>` could be an SHA or a fuzzy time like "4 hours ago"

## Useful Aliases

###### Display status in short-format with branch and tracking info

```sh
git config --global alias.feed 'status -sb'
```

###### Print log graph in color

```sh
git config --global alias.ledger "log --all --graph --pretty=format:'%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
```

###### Display log in oneline format

```sh
git config --global alias.tally "log --oneline"
```

###### Display all branches

```sh
git config --global alias.branches 'branch -a'
```

###### Display all remotes

```sh
git config --global alias.remotes 'remote -v'
```

###### Amend a commit

```sh
git config --global alias.amend "commit --amend --no-edit"
```

## References

This playbook is based on the references and discussions listed below.

**Cheatsheets and references**
- [Atlassian Git Cheatsheet](https://www.atlassian.com/git/tutorials/atlassian-git-cheatsheet)
- [GitHub Cheatsheet](http://git.io/sheet)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Git Immersion](http://gitimmersion.com)

**Discussions**
- [git update-index --assume-unchanged on directory](https://stackoverflow.com/a/12288918)
- [How can I git stash a specific file? [duplicate]](https://stackoverflow.com/a/5506483)
- [How to revert a Git repository to a previous commit](https://stackoverflow.com/a/4114122)
- [Useful tricks you might not know about Git stash](https://medium.freecodecamp.org/useful-tricks-you-might-not-know-about-git-stash-e8a9490f0a1a)
- [How do I delete a Git branch locally and remotely?](https://stackoverflow.com/questions/2003505/how-do-i-delete-a-git-branch-locally-and-remotely/2003515#2003515)
- [In git, is there a simple way of introducing an unrelated branch to a repository?](https://stackoverflow.com/a/4288660/5005580)