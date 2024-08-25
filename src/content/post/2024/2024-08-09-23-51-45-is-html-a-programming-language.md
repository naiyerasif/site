---
slug: "2024/08/09/is-html-a-programming-language"
title: "Is HTML a programming language?"
date: 2024-08-09 23:51:45
update: 2024-08-09 23:51:45
type: "status"
category: "update"
---

Today I learned that you can load images specific to a color scheme using the `media` attribute of [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source) element.

```html {2}
<picture>
	<source media="(prefers-color-scheme: dark)" srcset="logo_dark.svg">
	<img src="logo.svg" alt="logo" width="48">
</picture>
```

Similarly, you can load a smaller file when people are on metered connection, present a richer image if a display supports wider [color gamut](https://en.wikipedia.org/wiki/Gamut), and so on. Wait, we are doing conditionals with HTML. Does this make HTML a programming language?
