---
title: Git Cheatsheet
path: git-cheatsheet
date: 2019-03-24
updated: 2019-07-25
author: Naiyer Asif
summary: Just a yet another Git cheatsheet
---

## Init

###### Initialize a local directory as a Git repository

```bash
git init
git init <directory_path>
```

###### Retrieve a repository from remote through a URL

```bash
git clone <repository_url>
git clone -b <branch> <repository_url>
```

## Setup

###### Set a name with which the commits are credited to in the version history

```bash
git config --global user.name "<name>"
```

###### Set an email address to be associated with each history marker

```bash
git config --global user.email "<email>"
```

###### Set automatic command line coloring for Git for easy reviewing

```bash
git config --global color.ui auto
```

###### Enable autocorrect (with a 1.5 second delay)

```bash
git config --global help.autocorrect 15
```

###### Setup an alias for a command

```bash
git config --global alias.<new_alias> <git_function>
```

For an alias with multiple functions use quotes. Remove `--global` flag to set the configuration only for a given Git project.

###### Unset a configuration

```bash
git config --unset-all user.name
git config --unset-all user.email
```

###### List the configurations

```bash
git config --global --list
```

## Stage & Snapshot

###### Show modified files in working directory, staged for your next commit

```bash
git status
git status -sb
```

`-sb` flag displays a styled status, instead of plain one

###### Add a file as it looks now to your next commit (stage)

```bash
git add <file_path>
```

###### Add all current files to the next commit

```bash
git add .
```

###### Stripspace a file

Stripspacing a file strips trailing whitespaces, collapses newlines and adds a newline at the end of file

```bash
git stripspace < README.md
```

###### Show files to be removed from working directory.

```bash
git clean -n
```

`-f` in place of the `-n` flag executes the clean

###### Unstage a file while retaining the changes in working directory

```bash
git reset <file_path>
```

### Revert

###### Revert a commit to undo all the changes made in it, then apply it to the current branch

```bash
git revert <SHA>[ <SHA> ...]
```

If `n` SHAs are provided, `n` revert commits will be created.

###### Revert last N commits

```bash
git revert HEAD~N..HEAD
```

###### Revert a range of commits

```bash
git revert <SHA1>..<SHA4>
```

### Commit

###### Commit your staged content as a new commit snapshot

```bash
git commit -m "<message>"
```

###### Commit all the local changes in tracked files

```bash
git commit -a
```

###### Commit with no change

```bash
git commit -m "<message>" --allow-empty
```

###### Amend a previous commit

```bash
git commit --amend --no-edit
```

Useful when the new changes are trivial enough not to warrant a new commit over the previous one

### Temporary Commits

###### Save modified and staged changes

```bash
git stash
```

###### Save a subset of modified and staged file(s)

```bash
git stash push -m <message> <file_path>[ <file_path1> ...]
```

###### Stash untracked files

```bash
git stash push --include-untracked
```

###### List stack-order of stashed file changes

```bash
git stash list
```

###### Write working from top of stash stack

Pop deletes the stash from the stack after it has been applied on the repository.

```bash
git stash pop
git stash pop stash@{<stash_id>}
```

Specifying a `<stash_id>` writes that particular stash on the repository and subsequently deletes it from the stack.

###### Write a particular file from stash

```bash
git checkout stash -- <file_path>
git checkout stash@{<stash_id>} -- <file_path>
```

Specifying a `<stash_id>` unstashes a file from that particular stash and writes it in the repository.

###### Write a particular file from stash on a new branch

```bash
git stash branch <branch_name>
git stash branch <branch_name> stash@{<stash_id>}
```

This creates a new branch, checks out the commit you were on when you stashed your work, reapplies your work there, and then drops the stash if it applies successfully. This is helpful if the changes have been applied on the same file that has been stashed in subsequent commits.

###### Apply the top of stash without deleting it

```bash
git stash apply
git stash apply stash@{<stash_id>}
```

Specifying a `<stash_id>` writes that particular stash on the repository but doesn’t delete it from the stack.

###### Display a summary of stash diffs

```bash
git stash show
git stash show -p
git stash show stash@{<stash_id>}
```

`-p` displays the full diff. Specifying a `<stash_id>` displays the diff summary of that particular stash.

###### Discard the changes from top of stash stack

```bash
git stash drop
git stash drop stash@{<stash_id>}
```

Specifying a `<stash_id>` drops that particular stash.

###### Discard all stashes in a repository

```bash
git stash clear
```

## Ignore Patterns

###### System wide ignore pattern for all local repositories

```bash
git config --global core.excludesfile <file_path>
```

###### Ignore a file only on local repository

```bash
git update-index --assume-unchanged <file_path>
```

Vice-versa, to unignore a file, use `--no-assume-unchanged` flag in the above command.

###### Ignore files in a directory only on local repository

```bash
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

###### List your branches

```bash
git branch
```

A `*` will appear next to the currently active branch

###### Create a new branch at the current commit

```bash
git branch <branch>
```

###### Switch to another branch and check it out into your working directory

```bash
git checkout -b <branch>
git checkout -
```

`-` switches to the previous branch

###### Merge the specified branch’s history into the current one

```bash
git merge <branch>
```

###### Find all branches that have been merged into the current branch

```bash
git branch --merged
```

Vice-versa, the flag `--no-merged` lists branches that have not been merged into the current branch.

## Inspect & Compare

###### Show any object in Git in human-readable format

```bash
git show <SHA>
```

### Log

###### Show the commit history for the currently active branch

```bash
git log
```

###### Show the commits on branchA that are not on branchB

```bash
git log branchB..branchA
```

###### Show the commits that changed file, even across renames

```bash
git log --follow <file_path>
```

###### Show all commit logs with indication of any paths that moved

```bash
git log --stat -M
```

###### Limit number of commits

```bash
git log -<limit>
```

###### Condense each commit to a single line

```bash
git log --oneline
```

###### Styled log to print logs in prettyprint

```bash
git log --all --graph --pretty=format:'%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative
```

### Diff

###### Diff of what is changed but not staged

```bash
git diff
```

###### Diff of what is staged but not yet committed

```bash
git diff --staged
```

###### Show the diff of what is in `branchA` that is not in `branchB`

```bash
git diff branchB...branchA
```

## Track Path Changes

###### Delete the file from project and stage the removal for commit

```bash
git rm <file_path>
```

###### Remove all deleted files from the working tree (synonym of `git add .` but only for deleted files)

```bash
git rm $(git ls-files -d)
```

###### Change an existing file path and stage the move

```bash
git mv <existing_path> <new_path>
```

## Search & Browse

###### Search all previous commit messages and find the most recent one matching the query

`<query>` is a case-sensitive search term

```bash
git show :/<query>
```

Press `q` to quit the query.

###### Find a list of lines matching a pattern from all files

```bash
git grep <keyword>
git grep -e <regex or glob>
```

Instead of keyword, regex or glob patterns can also be used. Multiple expressions can be chained through `--and`, `--or` and `--not` flags.

###### Web Server for Browsing Local Repositories

```bash
git instaweb
```

## Share & Update

###### Add a git URL as an alias

```bash
git remote add <alias> <url>
```

###### Fetch down all the branches from that Git remote

```bash
git fetch <alias>
git fetch <alias> <branch>
```

###### Merge a remote branch into your current branch to bring it up to date

```bash
git merge <alias>/<branch>
```

###### Transmit local branch commits to the remote repository branch

```bash
git push <alias> <branch>
```

###### Fetch and merge any commits from the tracking remote branch

```bash
git pull
```

## Rewrite History

###### Apply any commits of current branch ahead of specified one

```bash
git rebase <branch>
```

###### Show a log of changes to the local repository’s HEAD

```bash
git reflog
```

###### Clear staging area, rewrite working tree from specified commit

```bash
git reset --hard <commit>
git reset --hard <branch>@{<spec>}
```

`<spec>` could be an SHA or a fuzzy time like "4 hours ago"

## Useful Aliases

| **Alias**      | **Command**                                                  | **Setup**                                                    |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `git feed`     | `git status -sb`                                             | `git config --global alias.feed 'status -sb'`                |
| `git ledger`   | `git log --all --graph --pretty=format:'%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative` | `git config --global alias.ledger "log --all --graph --pretty=format:'%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"` |
| `git tally`    | `git log --oneline`                                          | `git config --global alias.tally "log --oneline"`            |
| `git branches` | `git branch -a`                                              | `git config --global alias.branches 'branch -a'`             |
| `git remotes`  | `git remote -v`                                              | `git config --global alias.remotes 'remote -v'`              |
| `git amend`    | `git commit --amend --no-edit`                               | `git config --global alias.amend "commit --amend --no-edit"` |

## References

> **Other cheatsheets/references**
> - [Atlassian Git Cheatsheet](https://www.atlassian.com/git/tutorials/atlassian-git-cheatsheet)
> - [GitHub Cheatsheet](http://git.io/sheet)
> - [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
> - [Git Immersion](http://gitimmersion.com)
> 
> **Discussions**
> - [git update-index --assume-unchanged on directory](https://stackoverflow.com/a/12288918)
> - [How can I git stash a specific file? [duplicate]](https://stackoverflow.com/a/5506483)
> - [How to revert a Git repository to a previous commit](https://stackoverflow.com/a/4114122)
> - [Useful tricks you might not know about Git stash](https://medium.freecodecamp.org/useful-tricks-you-might-not-know-about-git-stash-e8a9490f0a1a)