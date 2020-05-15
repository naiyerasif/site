#!/bin/sh

target_file='static/assets/images/icons.svg'
backup_file=".archive/backups/icons.svg"
cache_dir='.svgcache'
svg_source_dir='.archive/svg'
svg_source_files="$cache_dir/**/*svg"
svg_cache_dir="$cache_dir/svg"
cache_stage_file="$cache_dir/temp.svg"
cache_target_file="$cache_dir/icons.svg"

echo 'Create a backup'

if [ -f "$target_file" ]; then
  cp $target_file $backup_file
fi

rm -rf $cache_dir
mkdir -p $svg_cache_dir
cp -r "$svg_source_dir/labels" "$cache_dir/labels"
cp -r "$svg_source_dir/icons" "$cache_dir/icons"

echo 'Generate sprite'

cp $svg_source_files $svg_cache_dir
printf '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">' > $cache_target_file
cat $svg_cache_dir/*.svg > $cache_stage_file
sed -i 's/<svg/<symbol/g' $cache_stage_file
sed -i 's/svg>/symbol>/g' $cache_stage_file
sed -i -e 's~ xmlns="http://www\.w3\.org/2000/svg"~~g' $cache_stage_file
cat $cache_stage_file >> $cache_target_file
printf '</svg>' >> $cache_target_file
sed -i ':a;N;$!ba;s/\n//g' $cache_target_file
cp $cache_target_file $target_file

echo 'Done!'
