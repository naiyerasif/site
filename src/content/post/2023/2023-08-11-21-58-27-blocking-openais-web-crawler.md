---
slug: "2023/08/11/blocking-openais-web-crawler"
title: "Blocking OpenAI's web crawler"
date: 2023-08-11 21:58:27
update: 2023-08-15 12:11:30
category: "status"
---

Turns out you can block [OpenAI](https://openai.com/)'s bots from accessing your site with the following rules in [robots.txt](https://en.wikipedia.org/wiki/Robots.txt).

```robots.txt
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /
```

[GPTBot](https://platform.openai.com/docs/gptbot) crawls the web to build the language models. [ChatGPT-User](https://platform.openai.com/docs/plugins/bot) is used by ChatGPT plugins to answer questions through its browsing feature.

You can paste these rules in _robots.txt_ file but it's anyone's guess [if the bots actually respect these rules](https://news.ycombinator.com/item?id=37030568). Blocking the IP address block is more effective solution. ChatGPT-User makes calls from the `23.98.142.176/28` IP address block while GPTBot makes calls from a range of addresses [listed here](https://openai.com/gptbot-ranges.txt).
