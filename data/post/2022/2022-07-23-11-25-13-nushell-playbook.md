---
slug: "2022/07/23/nushell-playbook"
title: "Nushell Playbook"
description: "A collection of useful Nushell patterns, workflows and configurations"
date: 2022-07-23 11:25:13
update: 2025-06-22 12:32:33
type: "reference"
tagline: "Handy recipes for smooth Nushell workflows"
---

In my time with Nushell, I've collected a set of commands and configurations that have helped streamline my workflows. Maybe you'll find something helpful in here as well.

:::commend
If you haven't tried [Nushell](https://www.nushell.sh/) yet, give it a shot! It's a fantastic alternative to classic shells like Bash and Zsh.
:::

## Directory operations

### Relative directory navigation

Just type `.` or `..` to navigate relative directories, no need to use `cd`.

## History

### Fuzzy search history

Press <kbd><kbd>Ctrl</kbd>+<kbd>R</kbd></kbd> to launch interactive fuzzy search of your command history.

### Pruning history

Nushell currently doesn't support preventing duplicate entries in the command history. If your history file grows large, you can clean it up by removing duplicates and sorting it with the following command.

```nu
show ~/.config/nushell/history.txt
	| lines
	| each {|line| $line | str trim }
	| uniq
	| sort
	| save --force ~/.config/nushell/history.txt
```

## Configuration

### Customize configuration location

Set `XDG_CONFIG_HOME=~/.config` environment variable to force Nushell put configuration files under `~/.config` directory instead of default location.

:::warn
You must set `XDG_CONFIG_HOME` _before_ Nushell starts. Configure it at the OS level, not in `config.nu`.
:::

### Restore overridden OS builtin

Sometimes a Nushell command can shadow an OS builtin, for example, Nushell's `open` command can shadow macOS's native `open`. To restore access to the OS version, you can assign the Nushell command a different alias and map the original name back to the system command.

```nu
alias show = open
alias open = ^open
```

This preserves both functionalities: use `show` for Nushell's `open`, and `open` for the macOS builtin.

## Workflows

### Delete local Git branches

To delete multiple local Git branches at once, you can use the following Nushell command.

```nu
git branch
	| lines
	| where ($it !~ '^\*') # exclude the current branch
	| each {|br| git branch -D ($br | str trim)}
	| str trim
```

This filters out the currently checked-out branch and deletes the rest.
