# Tools

- [Generate favicon](#generate-favicon)
- [Create new post](#create-new-post)

### Generate favicon

Requires [imagemagick](http://www.imagemagick.org/).

```sh
source tools/generate_favicons.sh src/favicon.png
```

### Create new post

```sh
node tools/newPost.js
```

### Clean deployment history

1. Create an orphan branch by `git checkout --orphan rm-pages`.
2. Dump the latest commit from `master` on this branch. Commit the change.
3. Remove `master` by `git branch -D master`
4. Checkout a new `master` by `git checkout -b master`.
5. Set this `master` to track remote `master` by `git branch -u origin/master`
6. Force push the clean branch `git push -f`.
