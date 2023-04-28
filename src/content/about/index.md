---
title: "Naiyer Asif"
description: "About Naiyer Asif"
user: "naiyer"
date: "2019-06-30 05:14:56"
update: "2022-04-23 11:32:41"
---

I'm a software engineer working from India. Welcome to my corner on the web where I share my thoughts on software engineering, design, books, and other interesting stuff. Most of the posts here are guides and tutorials that document a concept or process. They serve as a reference for what I learn, and a source of ~~criticism and scorn~~ constructive feedback.

## Random facts

- I work on an Aerospace product where I build microservices and enterprise API. Before this, I worked as a full-stack engineer at [Wipro Holmes](https://www.wipro.com/holmes/) and as an <abbr title="Extract Transform Load">ETL</abbr> consultant for [Suncorp](https://www.suncorp.com.au/).
- I like solving problems and exploring ideas. I work in small bursts. For details about my technical experience, take a look at the [stacktrace](/stacktrace/).
- I read a lot of science fiction, fantasy, manga and poetry.
- I'm not tied to a specific ecosystem. I use Android, Linux, Windows, and iPadOS regularly. I do value cross-platform applications and services.

## About this site

- Originally, I built this site with [Gridsome](https://github.com/gridsome/gridsome) to learn [Vue 2](https://github.com/vuejs/vue) and [GraphQL](https://graphql.org/).
- In 2022, I reworked it using [Lume](https://lume.land/) and [Alpine.js](https://alpinejs.dev/). Here are [launch notes](/post/2022/07/13/microflash-version-2/).
- In 2023, I rebuilt it using [Astro](https://astro.build). Here are [launch notes](/post/2023/02/02/introducing-naiyer-dev/).

Building a personal site made me 

- aware of the web community
- inspired me to contribute to the open source, and 
- taught me valuable lessons on accessibility, web performance, typography, design, and more. 

It also spurred my networking with people from different backgrounds.

## All code is _compromise_

:::deter{title=Disclaimer}
All the examples on this site are __optimized for learning__ and __not for use in production__.
:::

Apply your judgement, discuss with your peers, and use what's best suited for _your_ usecase. 

> You can use the content on this site under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by-sa/4.0/), and the source code and the code samples under the [MIT License](https://github.com/naiyerasif/naiyer.dev/blob/main/LICENSE.md).

If you spot something that's horribly wrong, give me a shout on Mastodon [@naiyer](https://mastodon.design/@naiyer) or [start a discussion](https://github.com/naiyerasif/naiyer.dev/discussions/new) on GitHub. If you want to improve something, I've provided the edit links under each post.

## The _stack_

It's fashionable to build personal sites and talk about their stack. I got this asked many times so here’s the _stack_ of this site.

- [Astro](https://astro.build/): the framework that generates this site
- [Remark](https://github.com/remarkjs/remark) & [Rehype](https://github.com/rehypejs/rehype): the markdown and HTML processors
- [Fuse.js](https://fusejs.io/): the library that powers the search
- [Starry Night](https://github.com/wooorm/starry-night): the library that powers the syntax highlighting of the code
- [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono): the body and `monospace` typefaces
- [Vale](https://vale.sh): the spelling and writing style checker

I'm not using any frontend frameworks. It's the boring (but reliable) HTML, CSS, JavaScript, and web components running the show.

:::note
You shouldn't get too hung up on the _stack_ or _tools_. Choose something that’s handy, that lets you do your work, and get started. _Getting started_ is crucial.
:::

## Credits

- [Sara Soueidan](https://sarasoueidan.com/)'s wonderful articles influenced the focus indicators and many other accessibility related optimizations on this site
- [Michelle Barker](https://css-irl.info/)'s article on [aspect-ratio](https://css-irl.info/aspect-ratio-is-great/) gave me a cue on styling the YouTube embeds
- [Josh Comeau](https://www.joshwcomeau.com/)'s [Modern CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/), [Jeremy Thomas](https://jgthms.com/)'s [minireset](https://github.com/jgthms/minireset.css), and [Elly Loel](https://www.ellyloel.com/)'s [CSS Reset](https://gist.github.com/EllyLoel/4ff8a6472247e6dd2315fd4038926522) form the basis of the CSS reset that I've used
- [Kitty Giraudel](https://kittygiraudel.com/)'s article on [using calc to figure out optimal line-height](https://kittygiraudel.com/2020/05/18/using-calc-to-figure-out-optimal-line-height/) influenced how I've setup the line-height
- [Harry Roberts](https://twitter.com/csswizardry)'s excellent talk [Get Your Head Straight](https://speakerdeck.com/csswizardry/get-your-head-straight) influenced the structure of the `<head>` 
- [Óscar Otero](https://oscarotero.com/)'s experimental [Lume plugin](https://github.com/lumeland/experimental-plugins/blob/3d99f245fc46f64344116f14f175821ac329ed12/reading_time/mod.ts) powers the reading time estimates
- [Pascal Schilp](https://github.com/thepassle)'s [generic-components](https://github.com/thepassle/generic-components) library runs the Command Center web component under the hood
