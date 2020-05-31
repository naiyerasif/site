---
title: 'Customize the PowerShell prompt'
date: 2020-05-31 21:26:42
topics: [til]
---

I've been using the [PowerShell Core](https://github.com/powershell/powershell) on [Windows Terminal](https://github.com/Microsoft/Terminal) for a while. I wanted to customize the prompt to display `>` on a newline and the current Git branch alongwith the working directory. You can do this by overriding the [`Prompt`](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_prompts?view=powershell-7) function and saving it in one of the [profiles](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7). Here's the snippet that I'm using:

```powershell
function prompt {
  "`n$env:Username@$env:ComputerName $($executionContext.SessionState.Path.CurrentLocation) $(git branch --show-current)`n$('>' * ($nestedPromptLevel + 1)) "
}
```

To have a colorful prompt, you can use [VT Sequences](https://docs.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences#screen-colors) as follows:

```powershell
function prompt {
  "`n`e[32m$env:Username@$env:ComputerName`e[0m `e[34m$($executionContext.SessionState.Path.CurrentLocation)`e[0m `e[33m$(git branch --show-current)`e[0m`n$('>' * ($nestedPromptLevel + 1)) "
}
```

I was not familiar with VT Sequences but [this Stackoverflow post](https://stackoverflow.com/questions/56679782/how-to-use-ansi-escape-sequence-color-codes-for-psreadlineoption-v2-in-powershel) helped me figure it out.
