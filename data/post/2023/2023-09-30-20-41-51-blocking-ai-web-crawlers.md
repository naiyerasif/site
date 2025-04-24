---
slug: "2023/09/30/blocking-ai-web-crawlers"
title: "Blocking AI web crawlers"
description: "To prevent web crawlers from scraping your website to build AI models, you can take certain measures. You can disallow them through robots.txt and block their IP ranges."
date: 2023-09-30 20:41:51
update: 2024-06-23 00:19:53
type: "reference"
---

Most AI chatbots and services typically browse the internet and [scrape](https://en.wikipedia.org/wiki/Web_scraping) information from websites to enrich their internal models. Here are some steps you can take to prevent such web crawlers from scraping your website.

## Blocking with `robots.txt`

You can create a [robots.txt](https://en.wikipedia.org/wiki/Robots.txt) file (such as the one below), and place it in the root of your website.

```robots.txt
# AI search crawler used by Amazon Alexa
User-agent: Amazonbot
Disallow: /

# AI agent possibly used by Anthropic to train Claude
User-agent: anthropic-ai
Disallow: /

# AI search crawler used by Siri
User-agent: Applebot
Disallow: /

# AI data scraper used by Apple Intelligence
User-agent: Applebot-Extended
Disallow: /

# AI data scraper used by ByteDance
User-agent: Bytespider
Disallow: /

# AI data scraper used by Common Crawl used to train many LLMs
User-agent: CCBot
Disallow: /

# AI agent used by ChatGPT to visit websites on user prompt
User-agent: ChatGPT-User
Disallow: /

# AI data scraper used by Anthropic to train Claude
User-agent: ClaudeBot
Disallow: /

# AI agent possibly used by Anthropic Claude
User-agent: Claude-Web
Disallow: /

# AI agent possibly used by Cohere AI chat to visit websites on user prompt
User-agent: cohere-ai
Disallow: /

# AI data scraper to aggregate website data to train AI models
User-agent: Diffbot
Disallow: /

# AI data scraper used by Meta to collect training data
User-agent: FacebookBot
Disallow: /

# AI data scraper used by Google Gemini
User-agent: Google-Extended
Disallow: /

# AI data scraper used by OpenAI to power its products like ChatGPT
User-agent: GPTBot
Disallow: /

# AI data scraper used by Webz.io that sells data to others to train AI models
User-agent: omgili
Disallow: /

# AI search crawler used by Perplexity to index search results for its AI assistant
User-agent: PerplexityBot
Disallow: /

# AI search crawler used by You.com to index search results for its AI assistant
User-agent: YouBot
Disallow: /
```

## Blocking IP ranges of the crawlers

Unfortunately, [many crawlers do not respect the rules](https://www.wired.com/story/perplexity-is-a-bullshit-machine/) specified by the `robots.txt` file. That is why blocking the IP addresses associated with these bots is a more effective solution.

Usually, the companies maintain a public documentation on the IP ranges of their bots, such as, [Amazonbot](https://developer.amazon.com/amazonbot#verifying-amazonbot), [Anthropic](https://docs.anthropic.com/en/api/ip-addresses), [Applebot](https://search.developer.apple.com/applebot.json), [FacebookBot](https://developers.facebook.com/docs/sharing/bot), [ChatGPT-User](https://platform.openai.com/docs/plugins/bot/ip-egress-ranges), [GPTBot](https://openai.com/gptbot-ranges.txt), and so on. Unfortunately, many companies, such as Common Crawl and Perplexity, do not even bother to keep such a documentation publicly available. You will have to rely on your server logs to identify and block their crawlers.
