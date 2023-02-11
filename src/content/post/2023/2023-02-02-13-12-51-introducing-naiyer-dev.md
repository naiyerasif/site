---
slug: "2023/02/02/introducing-naiyer-dev"
title: "Introducing naiyer.dev"
description: "Introducing the latest redesign of this website. Here are the motivations for the revamp, some website metrics and comparison with the old version, and the interesting ‘behind the scenes’ changes."
date: "2023-02-02 13:12:51"
update: "2023-02-11 18:41:22"
category: opinion
tags: ["site"]
---

Barely a yearly has passed since I launched the last [version](/post/2022/07/13/microflash-version-2/) of this site and here I'm with a fresh rewrite. You might be thinking: developers and their never-ending blog rewrites, 🙄! But hear me out on why I did it.

## Ownership of my content

2022 was an eventful year for Twitter, my primary social network. This got people talking about the ownership of their content and [building their own little corner on the web](https://www.theverge.com/23513418/bring-back-personal-blogging). 

Many folks took this to heart and implemented this beautifully. Take a look at Adam Argyle's [nerdy.dev](https://nerdy.dev) and Jhey Tompkins' [jhey.dev](https://jhey.dev). In a similar vein, this version moves a lot of my content from Twitter and elsewhere to one place.

With this change, you'd notice a more personal tone on this site. For those who subscribe through RSS, the [original feed](/feed.xml) will continue to syndicates everything except my statuses. If you want to keep track of everything I post here, subscribe to a new [everything feed](/all.xml) using your favorite RSS reader.

> Speaking of RSS, I gave it a bit more prominent treatment in the footer, with a link to [Matt Webb](https://interconnected.org/home/)'s excellent [explainer about all things RSS](https://aboutfeeds.com/).

## New domain

This site was located at [mflash.dev](https://mflash.dev). Microflash was my username on Twitter. I've been de-emphasizing its use lately. The move to a new domain [naiyer.dev](https://naiyer.dev) is a part of that effort.

The old domain will continue to work. The redirection rules will transparently take care of switching the domain and whatnot.

## So, what's new?

Here are some quality of life improvements introduced in this version.

### Command bar

The popularity of [Spotlight](https://en.wikipedia.org/wiki/Spotlight_(Apple)) inspired search boxes has been on the rise lately.[^1] They're pretty handy way to offer search and navigation for your site.

[^1]: See Chris Coyier's write up on [Command Bars](https://chriscoyier.net/2022/12/18/command-bars/)

This version replaces the good old search with a Command bar (represented by &#8984; symbol).

![Command bar in action](/images/post/2023/2023-02-02-13-12-51-introducing-naiyer-dev-01.png)

I've used [Fuse.js](https://fusejs.io/) to power the fuzzy search here. You can search posts, navigation, and even preferences (such as theme) to surface relevant results for you.

### Bottom navigation bar for small screens

I've switched from the traditional hamburger menu (which sat on top right in the last version) to a bottom navigation bar on small screens.

![Bottom navigation bar](/images/post/2023/2023-02-02-13-12-51-introducing-naiyer-dev-02.png)

You'll have reachable access to home, posts, command bar and a link to jump to the top all the time.

### Progressive enhancements

In the last version, I cut down the amount of JavaScript from ~300 KB to ~70 KB (by switching from Vue.js to Alpine.js). Now, I've removed Alpine.js as well and switched to web components and vanilla JavaScript. This has brought down the amount of scripts from ~70KB to ~31KB. As a result, this site should be less of a burden on your device and network.

And if you're visiting this site with JavaScript turned off, things would still work and you'd have good time reading my posts.

### Other changes

- The table of contents now shows more items. Pretty handy if you need to quickly jump into subsections of an article.
- I swapped [Lume](https://lume.land) with [Astro](https://astro.build) mainly because I was facing a lot of paper cuts with [Deno](https://deno.land). Lume is fantastic and I still use it many places.
- I've audited each page of this site with Lighthouse and the overall score sits at 96 which I think is acceptable for now. I'll continue to improve the score in future and keep running the scan on newer pages.
- There's a new logo which accompanies this launch. I can wax philosophical about how it looks like the character `n`, bookmark icon or game controller but it really is just a shape that I found unique enough to represent my personal branding.
