# Tools

### Generate favicon

Requires [imagemagick](http://www.imagemagick.org/)

```sh
node bin/favicon.js static/google-touch-icon.png
```

### Create new post/note

Pass the content type (**post** or **note**), title and metadata (**topics**) as arguments. Optionally, you can also pass a relative date to override the current date.

```sh
# create a new post
node bin/content.js --content post --title 'Using Git LFS in CI' --meta 'git, lfs'

# create a new note
node bin/content.js --content note --title 'Skipping the GitLab CI' --meta 'gitlab ci'

# pass a relative date to override now
node bin/content.js --content note --date '2 days 3 hours ago' --title 'Customize the PowerShell prompt' --meta 'powershell'
```

### Generate SVG sprites

Dump individual icons in a folder (say, `archive/svg`) and use [`spritely`](https://www.npmjs.com/package/@microflash/spritely) to generate the sprite.

```sh
yarn global add @microflash/spritely      # install spritely globally
spritely --input archive/svg --output cards.svg
```

Refer to the [spritely docs](https://github.com/Microflash/spritely) for usage details.
