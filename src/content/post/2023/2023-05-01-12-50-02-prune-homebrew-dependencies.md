---
slug: "2023/05/01/prune-homebrew-dependencies"
title: "Prune homebrew dependencies"
date: "2023-05-01 12:50:02"
update: "2023-05-01 12:50:02"
category: "status"
---

<abbr title="Today I learned">TIL</abbr> you can use `brew autoremove` to prune unused dependencies installed by [Homebrew](https://brew.sh).

```sh prompt{2,5}
# dry run to preview what will be removed
brew autoremove --dry-run

# removes the unused dependencies
brew autoremove
```
