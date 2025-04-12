---
slug: "2025/04/13/export-voiceover-speech-to-audio-file"
title: "Export VoiceOver speech to audio file"
date: 2025-04-13 01:31:26
update: 2025-04-13 01:31:26
type: "note"
---

Today I learned that you can export VoiceOver speech to an audio file using the `say` command in macOS.

```sh prompt{2,6}
# export speech to an AIFF file
say "Hello, world!" -o hello_world.aiff

# export speech by reading text file 
# using Karen voice to an m4a file
say -f input.txt -o output.m4a -v Karen
```

The `say` command supports exporting audio in various formats, including AIFF, WAVE, m4a, and others depending on the selected voice. You can also customize the voice, adjust audio quality, and more.
