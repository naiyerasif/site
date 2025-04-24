---
slug: "2024/09/25/uv-for-python-projects"
title: "uv for Python projects"
date: 2024-09-25 02:20:26
update: 2024-09-25 02:20:26
type: "note"
---

Got back to tinker with a Python project after ages (since 2018!). Used [`uv`](https://github.com/astral-sh/uv) to set things up. And I'm blown away by the experience. This is like a million miles ahead of `pip`, `pyenv`, and what not I was inflicted with years ago. Bonus points to `uv` for working with [Nushell](https://www.nushell.sh/).

```sh
uv venv
overlay use .venv/bin/activate.nu
uv sync
uv run run.py
```
