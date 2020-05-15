#!/bin/sh

if [ -f "$1" ]; then
  echo 'Generate ico file'

  for i in 16 32 48 96
  do
    magick convert "$1" -resize "$ix$i" "$i.png"
  done

  magick convert 16.png 32.png 48.png 96.png favicon.ico
  identify favicon.ico
  rm *.png

  if [ ! -d "static" ]; then
    mkdir static
  fi

  mv favicon.ico static/favicon.ico

  echo 'Done!'
else
  echo "$1 not found!"
fi
