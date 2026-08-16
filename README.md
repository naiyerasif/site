# site

Personal website of [@naiyerasif](https://github.com/naiyerasif)

## Rote

| #   | Action                    | Command                            |
| --- | ------------------------- | ---------------------------------- |
| 1   | Launch development server | `pn dev`                           |
| 2   | Generate production build | `pn build`                         |
| 3   | Update dependencies       | `pn update --interactive --latest` |
| 4   | Create new post           | `pn new`                           |

## Markdown extensions

This site supports the following extensions in addition to [GFM](https://github.github.com/gfm/).

### `dl` directive

The `dl` directive generates a description list. Wrap the standard unordered list in `:::dl` block. The text immediately following the `-` becomes the definition term (`<dt>`). Any indented content below it becomes the definition description (`<dd>`), which can include multiple paragraphs, links, and other markdown elements.

**Input**

```md
:::dl
- Firefox

  A free, open source, cross-platform web browser.

  Source available at: [@mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox)
:::
```

**Output**

```html
<dl>
  <dt>Firefox</dt>
  <dd>
    <p>A free, open source, cross-platform web browser.</p>
    <p>Source available at: <a href="https://github.com/mozilla-firefox/firefox">@mozilla-firefox/firefox</a></p>
  </dd>
</dl>
```

### `figure` directive

The `figure` directive groups a piece of content (media, blockquote, and so on) with an associated caption. For example, you can wrap an image in a `:::figure` block, and a `::caption` after the image.

**Input**

```md
:::figure
![Elephant at sunset, with birds flying in the background](elephant.jpg)
::caption[An elephant at sunset]
:::
```

**Output**

```html
<figure>
  <p><img src="elephant.jpg" alt="Elephant at sunset, with birds flying in the background"></p>
  <figcaption>An elephant at sunset</figcaption>
</figure>
```

Specify `.popout.popout-image` classes to bleed the image out of the standard content wrapper.

### `time` directive

The `time` directive generates a `<time>` element from an ISO 8601 date string. It automatically formats the human-readable text and normalizes the `datetime` attribute to UTC.

**Input**

```md
:time[2024-01-14T05:12:48]
:time[2024-01-14T05:12]
:time[2024-01-14]
```

**Output**

```html
<time datetime="2024-01-14T05:12:48.000Z">Jan 14, 2024</time>
<time datetime="2024-01-14T05:12:00.000Z">Jan 14, 2024</time>
<time datetime="2024-01-14T00:00:00.000Z">Jan 14, 2024</time>
```

### `youtube` directive

The `youtube` directive embeds responsive YouTube videos. Depending on the output environment, it generates a performance-optimized `<lite-youtube>` component for the website (`client`), and a standard `<iframe>` for RSS feeds (`server`).

**Input**

```md
::youtube[What is Git LFS?]{#9gaTargV5BY}
```

**Output (Client / Website)**

```html
<figure id="9gaTargV5BY" class="directive-youtube">
  <div class="directive-youtube-iframe-container">
    <lite-youtube class="directive-youtube-iframe" videoid="9gaTargV5BY" playlabel="What is Git LFS?" style="background-image: url(&quot;https://i.ytimg.com/vi/9gaTargV5BY/hqdefault.jpg&quot;);">
      <button type="button" class="lty-playbtn">
        <span class="lyt-visually-hidden">What is Git LFS?</span>
      </button>
    </lite-youtube>
  </div>
  <figcaption>What is Git LFS?</figcaption>
</figure>
```

**Output (Server / RSS feeds)**

```html
<figure id="9gaTargV5BY">
  <iframe src="https://www.youtube-nocookie.com/embed/9gaTargV5BY" allow="join-ad-interest-group &#x27;none&#x27;; run-ad-auction &#x27;none&#x27;; encrypted-media; picture-in-picture; fullscreen" loading="lazy" title="What is Git LFS?"></iframe>
  <figcaption>What is Git LFS?</figcaption>
</figure>
```

Specify `.popout.popout-video` classes to bleed the video out of the standard content wrapper.

## Audits

- [Blacklight Privacy Inspection](https://themarkup.org/blacklight?url=naiyerasif.com)
- [Mozilla Observatory](https://observatory.mozilla.org/analyze/naiyerasif.com)
- [Website Carbon Report](https://www.websitecarbon.com/website/naiyerasif-com/)

## Contributing

Since this is my personal site, I am not really looking for feature requests. I would, however, appreciate bug reports and corrections. Please [create an issue](https://github.com/naiyerasif/site/issues/new) on accessibility, browser rendering inconsistencies, performance bottlenecks, and general usability criticism.

## License

The source code of this site is available under [MPL-2.0](./LICENSE.md), the content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---

#### Previous versions

- [v5](https://github.com/naiyerasif/site/tree/v5) (refresh)
- [v4](https://github.com/naiyerasif/site/tree/v4) (redesign)
- [v3](https://github.com/naiyerasif/site/tree/v3) (built with [Astro](https://github.com/withastro/astro) and web components)
- [v2](https://github.com/naiyerasif/site/tree/v2) (built with [Lume](https://github.com/lumeland/lume) and [Alpine.js](https://github.com/alpinejs/alpine))
- [v1](https://github.com/naiyerasif/site/tree/v1) (built with [Gridsome](https://github.com/gridsome/gridsome) and [Vue 2](https://github.com/vuejs/vue))
