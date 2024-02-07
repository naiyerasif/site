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

#### Time directive

The following directive

```md
:time{datetime="2024-01-14T05:12:48.000Z"}
```

gets converted to

```html
<time datetime="2024-01-14T05:12:48.000Z">Jan 14, 2024</time>
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
