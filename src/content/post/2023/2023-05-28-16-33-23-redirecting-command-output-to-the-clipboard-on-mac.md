---
slug: "2023/05/28/redirecting-command-output-to-the-clipboard-on-mac"
title: "Redirecting command output to the clipboard on Mac"
date: "2023-05-28 16:33:23"
update: "2023-05-28 16:33:23"
category: "status"
---

<abbr title="Today I learned">TIL</abbr> you can redirect a command output directly to the clipboard on Mac using `pbcopy`. No need to fumble with text selection to copy it.

```sh prompt{1} caption='Copying date to clipboard in Nushell'
date now | date format '%Y-%M-%d' | pbcopy
```

Source: https://stackoverflow.com/a/1753127
