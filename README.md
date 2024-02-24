# site

Personal website of [@naiyerasif](https://github.com/naiyerasif)

## Development

- To launch the development server, run `pnpm dev`
- To generate a production build, run `pnpm build`
- To update dependencies interactively, run `pnpm update --interactive --latest`

## Authoring

- To create a new post, run `pnpm post`

### Spellcheck

[Vale](https://vale.sh) enforces the spellcheck and prose styling of this blog.

- To verify a prose, run `vale <path>`
- To sync packages and styles, run `vale sync`

### Custom markdown directives

The following custom directives are supported.

#### Figure directive

The following directive

```md
:::figure
![a short description of the information an image conveys](./image.png)

Captions are brief descriptions related to the image (for example commentary, attributions or quotations).
:::
```

gets converted to

```html
<figure class="figure">
  <img src="./image.png" alt="a short description of the information an image conveys">
  <figcaption>
    <p>Captions are brief descriptions related to the image (for example commentary, attributions or quotations).</p>
  </figcaption>
</figure>
```

#### Sprite directive

The following directive

```md
:sprite{href="#viking" .hint}
```

gets converted to

```xml
<svg role="img" aria-hidden="true" class="hint">
  <use href="#work-aws-eventbridge"/>
</svg>
```

#### Time directive

The following directive

```md
:time{datetime="2024-01-14T05:12:48.000Z"}
```

gets converted to

```html
<time datetime="2024-01-14T05:12:48.000Z">Jan 14, 2024</time>
```

#### Youtube directive

Youtube directive has two output variants: `client` (for the website) and `server` (for the RSS feeds)

The following directive

```md
::youtube[What is Git LFS?]{#9gaTargV5BY}
```

gets converted to the following HTML for the website.

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

It gets converted to the following HTML for the RSS feeds.

```html
<figure id="9gaTargV5BY">
  <iframe src="https://www.youtube-nocookie.com/embed/9gaTargV5BY" allow="join-ad-interest-group &#x27;none&#x27;; run-ad-auction &#x27;none&#x27;; encrypted-media; picture-in-picture; fullscreen" loading="lazy" title="What is Git LFS?"></iframe>
  <figcaption>What is Git LFS?</figcaption>
</figure>
```

## Audits

- To launch a full lighthouse audit, run `pnpm lighthouse`

### Additional audits

- [Blacklight Privacy Inspection](https://themarkup.org/blacklight?url=www.naiyerasif.com)
- [Mozilla Observatory](https://observatory.mozilla.org/analyze/www.naiyerasif.com)
- [Website Carbon Report](https://www.websitecarbon.com/website/naiyerasif-com/)

## Contributing

Since this is my personal site, I'm not really looking for feature requests. I'd, however, appreciate bug reports and corrections. Please [create an issue](https://github.com/naiyerasif/site/issues/new) on accessibility, browser rendering inconsistencies, performance bottlenecks, and general usability criticism.

## License

The source code of this site is available under [MPL-2.0](./LICENSE.md), the content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---

#### Previous versions

- [v3](https://github.com/Microflash/site.v3) (built with [Astro](https://github.com/withastro/astro) and web components)
- [v2](https://github.com/Microflash/site.v2) (built with [Lume](https://github.com/lumeland/lume) and [Alpine.js](https://github.com/alpinejs/alpine))
- [v1](https://github.com/Microflash/site.v1) (built with [Gridsome](https://github.com/gridsome/gridsome) and [Vue 2](https://github.com/vuejs/vue))
