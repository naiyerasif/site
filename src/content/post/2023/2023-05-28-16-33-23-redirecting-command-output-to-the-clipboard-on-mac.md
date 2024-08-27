---
slug: "2023/05/28/redirecting-command-output-to-the-clipboard-on-mac"
title: "Redirecting command output to the clipboard on Mac"
date: 2023-05-28 16:33:23
update: 2023-05-28 16:33:23
type: "status"
---

Today I learned you can redirect a command output directly to the clipboard on Mac using `pbcopy`. No need to fumble with text selection to copy it.

```sh prompt{1} title="Copying date to clipboard in Nushell"
date now | date format '%Y-%M-%d' | pbcopy
```

Source: https://stackoverflow.com/a/1753127
