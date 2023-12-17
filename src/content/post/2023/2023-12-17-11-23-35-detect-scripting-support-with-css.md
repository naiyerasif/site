---
slug: "2023/12/17/detect-scripting-support-with-css"
title: "Detect scripting support with CSS"
date: 2023-12-17 11:23:35
update: 2023-12-17 11:23:35
category: "status"
---

<abbr title="Today I learned">TIL</abbr> about `@media (scripting)` query with which you can detect using CSS if the browser supports JavaScript and whether it's active.

<https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting>

One example of this query is how Firefox hides the `noscript` element when JavaScript is active.

```css
@media (scripting) {
	noscript {
		display: none !important;
	}
}
```

> You can view this stylesheet at `resource://gre-resources/html.css` in Firefox.
