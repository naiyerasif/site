---
slug: "2023/07/15/hacker-news-dark-mode-with-larger-text"
title: "Hacker News dark mode with larger text"
date: 2023-07-15 16:17:55
update: 2023-07-15 16:17:55
type: "status"
category: "update"
---

To browse [Hacker News](https://news.ycombinator.com) with dark mode and larger text, add the following [uBlock filters](https://github.com/gorhill/uBlock/wiki/Dashboard:-My-filters). This works well enough on desktop and mobile.

```adblock
news.ycombinator.com##html:style(filter:invert(100%) hue-rotate(180deg))
news.ycombinator.com##body:style(background: #e6e6e6)
news.ycombinator.com##*:style(font-family: system-ui; font-size: 1rem)
news.ycombinator.com##code:style(font-family: monospace)
news.ycombinator.com##tbody:style(background: #e6e6e6)
news.ycombinator.com###hnmain:remove-attr(bgcolor)
news.ycombinator.com##:matches-path("/item") tbody:style(background: #dbdbdb)
news.ycombinator.com##div.toptext:style(color: black)
news.ycombinator.com###hnmain td[bgcolor="#000000"]
```

Based on: https://letsblock.it/filters/hackernews-darkmode

Also, <abbr title="Today I learned">TIL</abbr> that you can override site styles with [uBlock](https://github.com/gorhill/uBlock).
