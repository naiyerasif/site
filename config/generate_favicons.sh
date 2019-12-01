#!/bin/sh

if [ -f "$1" ]; then
  echo "Generating favicon assets..."
  magick convert "$1" -resize 16x16 16.png
  magick convert "$1" -resize 32x32 32.png
  magick convert "$1" -resize 48x48 48.png
  magick convert "$1" -resize 96x96 96.png
  magick convert 16.png 32.png 48.png 96.png favicon.ico

  identify favicon.ico

  rm *.png

  if [ ! -d "static" ]; then
    mkdir static
  fi

  mv favicon.ico static/favicon.ico

  echo "Done!"
else
  echo "$1 not found!"
fi
