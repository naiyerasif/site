---
slug: "2023/07/16/save-clipboard-content-to-a-file-with-nushell"
title: "Save clipboard content to a file with Nushell"
date: 2023-07-16 21:38:02
update: 2023-07-16 21:38:02
type: "status"
---

You can save the clipboard content to a file using Nushell as follows.

```nu
pbpaste | save config.yml
```

> `pbpaste` is a macOS utility to paste data from the clipboard to STDOUT.
