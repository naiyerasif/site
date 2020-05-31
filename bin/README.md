# Tools

- [Generate favicon](#generate-favicon)
- [Generate SVG sprites](#generate-svg-sprites)
- [Create new post](#create-new-post)
- [Create new status](#create-new-status)
- [Clean deployment history](#clean-deployment-history)

### Generate favicon

Requires [imagemagick](http://www.imagemagick.org/).

```sh
source bin/generate-favicon.sh static/google-touch-icon.png
```

### Generate SVG sprites

Assumes SVG icons are located in `.archive/svg/icons` and `.archive/svg/labels` directories.

```sh
source bin/generate-sprites.sh
```

### Create new post

Pass the title and labels as first and second arguments.

```sh
node bin/newPost.js
```

### Create new status

Pass the title and topic as first and second arguments.

```sh
node bin/newStatus.js
```

### Clean deployment history

1. Create an orphan branch by `git checkout --orphan rm-pages`.
2. Dump the latest commit from `master` on this branch. Commit the change.
3. Remove `master` by `git branch -D master`
4. Checkout a new `master` by `git checkout -b master`.
5. Set this `master` to track remote `master` by `git branch -u origin/master`
6. Force push the clean branch `git push -f`.
