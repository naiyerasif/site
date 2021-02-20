# Tools

### Generate favicon

Requires [imagemagick](http://www.imagemagick.org/)

```sh
node bin/favicon.js static/google-touch-icon.png
```

### Create new post

Pass the post type with `-p` or `--post` option (*guide* (default), *note*, *redirect* or *sideline*), title with `-h` or `--headline` option, and comma-separated topics with `-t` or `--topics` option. Optionally, you can also pass a relative date to override the current date with `-d` or `--date` option.

```sh
# create a new post
node bin/content.js --post guide --headline 'Using Git LFS in CI' --topics 'git, lfs'

# create a new note
node bin/content.js --post note --headline 'Skipping the GitLab CI' --topics 'gitlab ci'

# pass a relative date to override now
node bin/content.js --post note --date '2 days 3 hours ago' --headline 'Customize the PowerShell prompt' --topics 'powershell'
```

### Generate SVG sprites

Dump individual icons in a folder (say, `archive/svg`) and use [`spritely`](https://www.npmjs.com/package/@microflash/spritely) to generate the sprite.

```sh
yarn global add @microflash/spritely      # install spritely globally
spritely --input archive/svg --output cards.svg
```

Refer to the [spritely docs](https://github.com/Microflash/spritely) for usage details.
