---
slug: "2023/08/11/blocking-openais-web-crawler"
title: "Blocking OpenAI's web crawler"
date: 2023-08-11 21:58:27
update: 2023-08-11 21:58:27
category: "status"
---

Turns out you can block [OpenAI](https://openai.com/)'s web crawler, called GPTBot, from crawling your site with the following rule in [robots.txt](https://en.wikipedia.org/wiki/Robots.txt).

```robots.txt
User-agent: GPTBot
Disallow: /
```

Source: https://platform.openai.com/docs/gptbot

You can paste this in _robots.txt_ file but it's anyone's guess [if the bot actually respects these rules](https://news.ycombinator.com/item?id=37030568). Blocking the [IP address block](https://openai.com/gptbot-ranges.txt) of GPTBot is more effective solution.
