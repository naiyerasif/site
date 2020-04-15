#!/bin/sh

echo "Create a backup"
now=$(date +"%Y_%m_%d")
mv static/assets/images/icons.svg archive/backups/icons_$now.svg

echo "Generate sprites"
printf '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">' > icons.svg
cat archive/svg/*.svg > temp.svg
sed -i 's/<svg/<symbol/g' temp.svg
sed -i 's/svg>/symbol>/g' temp.svg
sed -i -e 's~ xmlns="http://www\.w3\.org/2000/svg"~~g' temp.svg
cat temp.svg >> icons.svg
printf '</svg>' >> icons.svg
rm -rf temp.svg

echo "Write sprite file"
mv icons.svg static/assets/images/icons.svg

echo "Done!"
