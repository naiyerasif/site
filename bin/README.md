# Tools

### Generate favicon

Requires [imagemagick](http://www.imagemagick.org/)

```sh
node bin/favicon.js static/google-touch-icon.png
```

### Creat new post/status

Pass the content type (**post** or **status**), title and metadata (**topics**) as arguments.

```sh
node bin/content.js --content post --title "<title>" --meta "<meta>"
node bin/content.js --content status --title "<title>" --meta "<meta>"
```

### Generate SVGs

Dump individual icons in a folder (say, `.archive/svg`) and use [`spritely`](https://www.npmjs.com/package/@microflash/spritely) to generate the sprite.

```sh
yarn global add @microflash/spritely      # install spritely globally
spritely --input .archive/svg --output cards.svg
```

Refer to the [spritely docs](https://github.com/Microflash/spritely) for usage details.
