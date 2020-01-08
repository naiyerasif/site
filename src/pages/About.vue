<template>
  <Layout>
    <div class="container hero">
      <h1 id="top">About this site</h1>
    </div>
    <div class="container">
      <div class="post">
        <main class="panel article">
          <p>This site started out as a pet project for <g-link to="/profile/naiyer/">me</g-link> to learn <a target="_blank" rel="noopener noreferrer" href="https://vuejs.org/">Vue.js</a> and <a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a>, and as a way to get my bearing around Vue.js community. Working on this project, I became more informed about accessible color systems, content preloading, optimization of vector illustrations, <a target="_blank" rel="noopener noreferrer" href="https://unifiedjs.com/">unifiedjs</a> ecosystem, and more.</p>
          <p>Currently, I'm publishing my notes on development and design collected over the years, mostly to serve as a quickly accessible way to share and refer back. The code described in the examples is for the demonstration of the topic under discussion; it is not meant to be used as-is in production.</p>
          <h2>Acknowledgements</h2>
          <p>This site was made possible by</p>
          <ul>
            <li><a target="_blank" rel="noopener noreferrer" href="https://gridsome.org/">Gridsome</a>: a modern Vue.js framework for static websites (and more)</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/drehimself/gridsome-portfolio-starter">Gridsome Portfolio Starter</a>: a simple portfolio starter for Gridsome</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://fusejs.io/">Fuse.js</a>: a lightweight fuzzy-search library</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/octref/shiki">Shiki</a>: a beautiful syntax highlighter</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://feathericons.com/">Feather Icons</a>: beautiful open-source icons</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://mflash.dev/remarkability/">Remarkability</a>: the baseline css for HTML generated from markdown</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/jonsuh/hamburgers">Hamburgers</a>: a collection of tasty CSS-animated hamburger icons</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://gridbyexample.com/">Grid By Example</a>: a collection of examples and references on CSS Grid maintained by <a target="_blank" rel="noopener noreferrer" href="https://rachelandrew.co.uk/">Rachel Andrew</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/adobe/leonardo">Leonardo</a>: an adaptive color scale generator developed by Adobe</li>
          </ul>
          <p>It uses</p>
          <ul class="content">
            <li><a target="_blank" rel="noopener noreferrer" href="https://alligator.io/css/theming-custom-properties/">custom CSS properties</a> for theme switching</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a> for querying data</li>
            <li><a href="https://vuejs.org/">Vue.js</a> for components and layouts</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://rsms.me/inter/">Inter</a> as the main font</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/Iosevka/tree/curvy">Iosevka Curvy</a> as the <code>monospace</code> font</li>
            <li>a customized version of <a target="_blank" rel="noopener noreferrer" href="https://github.com/arcticicestudio/nord">Nord</a> to decorate the codeblocks</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://circleci.com/">CircleCI</a> for continuous integration</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/tschaub/gh-pages">gh-pages</a> for deployment</li>
            <li>graphics and illustrations created with <a target="_blank" rel="noopener noreferrer" href="https://affinity.serif.com/en-gb/designer/">Affinity Designer</a> and <a target="_blank" rel="noopener noreferrer" href="https://www.adobe.com/in/products/xd.html">Adobe XD</a></li>
          </ul>
          <p>
            The source of this site is <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">available</a> under <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">MIT</a>, the content under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a>. If you want to create a site similar to this one, get started with <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/jada">jada</a>.
          </p>
        </main>
      </div>
      <div class="options">
        <a href="#top"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-up"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg> Back to top</a>
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'About'
  }
}
</script>
