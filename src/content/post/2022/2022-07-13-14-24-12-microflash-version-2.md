---
slug: "2022/07/13/microflash-version-2"
title: "Microflash: Version 2"
description: "Introducing the redesign of this website. Here, I document the changes done, some website metrics and comparison with the old version, and the notable ‘behind the scenes’ changes."
date: 2022-07-13 14:24:12
update: 2022-07-21 13:57:10
category: "opinion"
---

After more than three years since its inception, here's the redesign of this site. There were three motivations behind this redesign: **improving accessibility and performance**, **consistent design**, and **faster local development**.

## So, what's new?

I overhauled quite a few things.

### New layouts

Layouts now emphasize the content and semantics around the content.

:::figure
![Home Page (old on left, new on right)](/images/post/2022/2022-07-13-14-24-12-microflash-version-2-01.png)
![Post (old on left, new on right)](/images/post/2022/2022-07-13-14-24-12-microflash-version-2-02.png)

Home Page and Post layouts (old on left, new on right)
:::

### New design system

This site uses a new design system with sane defaults, a more [perceptually uniform color system](https://www.youtube.com/watch?v=dOsp6u4bIwI), and [calmer contrast](https://sarajw.hashnode.dev/aspects-of-accessibility-a11y-semantics-contrast-and-anxiety#heading-anxiety-inducing-design=). This design also respects your preferences on themes and even lets you customize some aspects (like text size) to make the reading experience pleasant and comfortable.

### Prescriptive amount of JavaScript

I have also cut down the amount of JavaScript being shipped to the browser (from ~300 KB to ~70 KB). This is because the site is no longer a [Vue](https://v2.vuejs.org/) [SPA](https://en.wikipedia.org/wiki/Single-page_application). Instead, it is mostly static with some interactive elements (for example, search, theme switcher, text resizer, etc) thrown in. As a result, the pages load faster, consume less memory, and are less of a burden on your network and device.

### Improved accessibility

The new version has an [all-green Lighthouse score](https://web.dev/measure/?url=https%3A%2F%2Fmflash.dev). The score aside, I have added skip links on each page, pronounced outlines for links and buttons, and necessary ARIA attributes to make the site accessible.

:::figure
![Lighthouse scores](/images/post/2022/2022-07-13-14-24-12-microflash-version-2-03.png)

Lighthouse score (source: [PageSpeed Insights](https://web.dev/measure/?url=https%3A%2F%2Fmflash.dev))
:::

### Small carbon footprint

The carbon footprint of the previous version was already small. The redesign [reduces](https://www.websitecarbon.com/website/mflash-dev/) this even further.

:::figure
![Carbon impact estimates](/images/post/2022/2022-07-13-14-24-12-microflash-version-2-04.png)

Carbon impact estimates (source: [Website Carbon](https://www.websitecarbon.com/website/mflash-dev/))
:::

## Behind the scenes

Even bigger changes happened behind the scenes.

- **Switch from [Gridsome](https://github.com/gridsome/gridsome) to [Lume](https://lume.land/)**: Gridsome hasn't been maintained for a while and it stopped working on my local last year. I [evaluated](https://github.com/Microflash/site/issues/28) multiple frameworks before I settled on Lume.
- **Switch from [Node.js](https://nodejs.org/en/) to [Deno](https://deno.land/)**: Lume is built for Deno, an alternative runtime for JavaScript and TypeScript. With the latest surge in [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) adoption, Deno has finally become a lot more pleasant to work with. It also helps that there’s no package manager involved and mixing JavaScript and TypeScript is seamless.
- **Switch from [Vue](https://vuejs.org/) to [Alpine.js](https://alpinejs.dev/)**: Firstly, Vue is an awesome framework and I enjoy working with it. However, for the little JavaScript I needed for theme switching, search, etc, it's an overkill. That's why I used Alpine.js which fits my need and is pretty lightweight.
- **Switch from [CIELab](https://en.wikipedia.org/wiki/CIELAB_color_space) to [OkLab](https://bottosson.github.io/posts/oklab/)**: The original color system of this site was based on CIELab, with which I consistently faced trouble dealing with the contrast at small text sizes and the [infamous purple hue shift](https://youtu.be/dOsp6u4bIwI?t=677). I was looking for a color space to design new themes which were beautiful to look at, perceptually uniform, and accessible. OkLab provided a great alternative while I experimented on colors using [Leonardo](https://leonardocolor.io).
- **Switch from [Shiki](https://github.com/shikijs/shiki) to [Starry Night](https://github.com/wooorm/starry-night)**: Although Shiki served me well in the older version, it never worked for me on Deno. Starry Night uses the same syntax highlighting engine and works well with Deno. It is also easier to customize since the themes rely on [CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (which are used extensively on this site).

## What else?

- The markdown on this site is parsed by [Remark](https://github.com/remarkjs/remark) and the HTML from the markdown is generated by [Rehype](https://github.com/rehypejs/rehype). Lume didn’t support either of them at the time I was building this site. So I [added Remark / Rehype support](https://github.com/lumeland/experimental-plugins/commits/main/remark/remark.ts) in Lume.
- There was no Remark / Rehype plugin to integrate Starry Night while I was building this site. So I created and published a [plugin](https://github.com/Microflash/remark-starry-night) to add this support.
- I also wrote a [library](https://github.com/Microflash/fenceparser) to parse codeblock metadata so that I can add support for line highlighting and captions on codeblocks.

With this, I am going to focus more on writing content for this site. I have a huge backlog of drafts and notes that I'll be refining and making them public here. Also, I can finally break the [design loop](https://uxplanet.org/dealing-with-infinite-redesign-loop-5aa70a98bfd4) (for now).
