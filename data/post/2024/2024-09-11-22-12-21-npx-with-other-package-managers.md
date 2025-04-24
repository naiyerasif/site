---
slug: "2024/09/11/npx-with-other-package-managers"
title: "npx with other package managers"
date: 2024-09-11 22:12:21
update: 2024-09-11 22:12:21
type: "note"
---

How many times have you searched for a way to use an `npx` command to install a Node.js tool, but with a different package manager, like `pnpm`, instead of `npm`? Today I found out you can use the `--pm` flag with `npx` to specify your favorite package manager.

```sh title="Generating an Angular app with pnpm"
npx -p @angular/cli --pm pnpm \ 
	ng new <project_name> --skip-git --skip-install
```
