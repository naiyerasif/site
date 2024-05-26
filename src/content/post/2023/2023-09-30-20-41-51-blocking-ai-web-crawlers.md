---
slug: "2023/09/30/blocking-ai-web-crawlers"
title: "Blocking AI web crawlers"
description: "To prevent web crawlers from scraping your website to build AI models, you can take certain measures. You can disallow them through robots.txt and block their IP ranges."
date: 2023-09-30 20:41:51
update: 2023-09-30 20:41:51
type: "post"
category: "reference"
---

Most AI chatbots and services crawl the web and [scrape](https://en.wikipedia.org/wiki/Web_scraping) websites to enrich their underlying models. Here's how you can prevent such web crawlers from scraping your website.

## Blocking with `robots.txt`

In theory, a [robots.txt](https://en.wikipedia.org/wiki/Robots.txt) file like this should block the web crawlers.

```robots.txt
User-agent: CCBot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /
```

- [CCBot](https://commoncrawl.org/ccbot) is used by Common Crawl to build crawl data that can be used by anyone.
- [ChatGPT-User](https://platform.openai.com/docs/plugins/bot) is used by ChatGPT plugins to answer questions through its browsing feature.
- [GPTBot](https://platform.openai.com/docs/gptbot) crawls the web to build the language models for ChatGPT.
- [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers#google-extended) is used by Google's Bard and Vertex AI.

## Blocking IP ranges of crawlers

It's important to note that the bots can choose to ignore the rules specified in _robots.txt_ file. That's why blocking the IP addresses of these bots is a more effective solution.

- ChatGPT-User makes calls from the `23.98.142.176/28` IP address block.
- GPTBot makes calls from a range of addresses [listed here](https://openai.com/gptbot-ranges.txt).
- CCBot and Google-Extended don't have documented IP addresses. You'll have to rely on your server logs to identify and block such addresses.
