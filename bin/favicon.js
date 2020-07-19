#!/usr/bin/env node

const shell = require('shelljs')

const sizes = [16, 32, 48, 96]

const execCheck = shell.exec('magick --version', { silent: true }).stdout

if (execCheck) {
  let cmd = 'magick convert'
  sizes.forEach(size => {
    shell.exec(`magick convert "${size}" -resize "${size}x${size}" "${size}.png"`)
    cmd += ` ${size}.png`
  })
  shell.exec(`${cmd} favicon.ico`)
  shell.exec('identify favicon.ico')
  shell.rm('*.png')
  shell.mv('favicon.ico', 'static/favicon.ico')
  console.log('Done!')
} else {
  console.log('ImageMagick not found. Install from https://imagemagick.org/script/download.php and try again.')
}
