#!/bin/sh

echo "Create a backup"
mv static/assets/images/sprites.svg archive/sprites.bkp.svg

echo "Generate sprites"
printf '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">' > sprites.svg
cat archive/labels/*.svg > temp.svg
cat archive/images/*.svg >> temp.svg
sed -i 's/<svg/<symbol/g' temp.svg
sed -i 's/svg>/symbol>/g' temp.svg
sed -i -e 's~ xmlns="http://www\.w3\.org/2000/svg"~~g' temp.svg
cat temp.svg >> sprites.svg
printf '</svg>' >> sprites.svg
rm -rf temp.svg

echo "Write sprite file"
mv sprites.svg static/assets/images/sprites.svg

echo "Done!"
