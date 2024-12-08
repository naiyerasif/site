---
slug: "2023/12/29/scaling-a-video-with-ffmpeg-using-nushell"
title: "Scaling a video with FFmpeg using Nushell"
date: 2023-12-29 22:22:41
update: 2023-12-29 22:22:41
type: "ping"
---

I've been using the following [Nushell](https://www.nushell.sh/) script for a while to scale down high resolution videos with [FFmpeg](https://ffmpeg.org/).

```nu
def scale_a_video [] {
	print "? Input file path: "
	let input_file_path = (ls | get name | input list)
	print $input_file_path
	print "? Scale: "
	let video_scale = (["2160:3840", "1080:1920"] | input list)
	print $video_scale
	print "? Output file path: "
	let output_file_path = (input)
	ffmpeg -i $input_file_path -c:v libx265 -vtag hvc1 -vf scale=$video_scale -crf 20 -c:a copy $output_file_path
}
```

- I invoke this function through an [alias](https://www.nushell.sh/book/aliases.html#persisting) declared in `env.nu`.
- I'm using [`input list`](https://www.nushell.sh/commands/docs/input_list.html) (instead of [`input`](https://www.nushell.sh/commands/docs/input.html)) because it gives me a list of options which I can tab through instead of typing them manually. You can see this in action for `input_file_path` variable where it lists video files in a directory that I can select from to scale down.
