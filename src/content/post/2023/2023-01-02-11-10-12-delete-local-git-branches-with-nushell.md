---
slug: "2023/01/02/delete-local-git-branches-with-nushell"
title: "Delete local Git branches with Nushell"
date: 2023-01-02 11:10:12
update: 2023-01-02 11:10:12
type: "status"
category: "update"
---

If you accumulate a lot of local Git branches over time, you can get rid of them in one go with the following [Nushell](https://www.nushell.sh/) script:

```nu
(git branch | lines | where ($it !~ '^\*') | each {|br| git branch -D ($br | str trim)} | str trim)
```
