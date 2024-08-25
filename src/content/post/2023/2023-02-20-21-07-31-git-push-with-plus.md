---
slug: "2023/02/20/git-push-with-plus"
title: "Git push with +"
date: "2023-02-20 21:07:31"
update: "2023-02-20 21:07:31"
category: "status"
---

<abbr title="Today I learned">TIL</abbr> that `+` sets a force flag on a Git [refspec](https://git-scm.com/book/en/v2/Git-Internals-The-Refspec). That means I can force push to a branch with any of the following commands:

```sh
git push --force origin main
git push -f origin main
git push origin +main
```

https://stackoverflow.com/a/69745212
