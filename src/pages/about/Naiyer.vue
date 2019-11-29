<template>
  <Layout>
    <div class="decorated-links">
      <Hero>
        Hello, I am <span id="about-me" class="emphasis">Naiyer</span>
        <br/>a full-stack developer
        <br/>from Bengaluru, India.
      </Hero>
      <div class="container post">
        <main class="article">
          <p class="content">I have more than 4 years of experience in Banking &amp; Financial Services, Legal &amp; Compliance and Aviation domains.</p>
          <h3>Technologies I am adept at &mdash;</h3>
          <div class="grid-3 content">
            <div class="column">
              <div class="card">
                <div class="card-category">Platform</div>
                <h3 class="card-title">Java</h3>
                <p>The most popular programming platform for building enterprise applications</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Framework</div>
                <h3 class="card-title">Spring</h3>
                <p>Lightweight open-source Java framework for building large-scale applications</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Framework</div>
                <h3 class="card-title">Angular</h3>
                <p>An open-source TypeScript-based framework to create single-page applications</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Database</div>
                <h3 class="card-title">Oracle</h3>
                <p>A proprietary multi-model database management system</p>
              </div>
            </div>
          </div>
          <h3>Other technologies that I work on &mdash;</h3>
          <div class="grid-3 content">
            <div class="column">
              <div class="card">
                <div class="card-category">Platform</div>
                <h3 class="card-title">Node.js</h3>
                <p>An open-source, cross-platform runtime to run JavaScript code on server</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Platform</div>
                <h3 class="card-title">Docker</h3>
                <p>Enterprise container platform to build, share and deploy applications anywhere</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Database</div>
                <h3 class="card-title">MongoDB</h3>
                <p>A general purpose, cross-platform, document-based, distributed NoSQL database</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Automation</div>
                <h3 class="card-title">Jenkins</h3>
                <p>An open-source automation server to build, deploy and automate projects</p>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-category">Language</div>
                <h3 class="card-title">Kotlin</h3>
                <p>An interoperable statically-typed programming language that runs on the Java virtual machine</p>
              </div>
            </div>
          </div>
          <p class="content">
            Besides writing code, I compose poetry, draw vector illustrations and automate boring repetitive stuff using terminal and scripts. I prowl the web to discover typography and digital art (mostly geometric and vector) and find shiny new tools to tinker with (I've signed up for way more beta programs than anyone should). I also dedicate a fair chunk of my time for reading fiction, history, and physics.
          </p>
          <p>Feel free to look around and contact me with any questions at <a target="_blank" rel="noopener noreferrer" href="https://www.twitter.com/Microflash">{{ $page.author.twitter }}</a> (which is the namesake of this site).</p>
        </main>

        <section class="article acknowledgments">
          <h2 id="about-site">About this site</h2>
          <p class="content">
            This site started out as a pet project for me to learn <a target="_blank" rel="noopener noreferrer" href="https://vuejs.org/">Vue.js</a> and <a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a>, and as a way to get my bearing around Vue.js community. Working on this project, I became more informed about accessible color systems, content preloading, optimization of vector illustrations, <a target="_blank" rel="noopener noreferrer" href="https://unifiedjs.com/">unifiedjs</a> ecosystem, and more.
          </p>
          <p class="content">
            Currently, I'm publishing my notes on development and design collected over the years, mostly to serve as a quickly accessible way to share and refer back. The code described in the examples is for the demonstration of the topic under discussion; it is not meant to be used as-is in production.
          </p>
          <h2 id="acknowledgments">Acknowledgements</h2>
          <p>This site was made possible by</p>
          <ul class="content">
            <li><a target="_blank" rel="noopener noreferrer" href="https://gridsome.org/">Gridsome</a>: a modern Vue.js framework for static websites</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/drehimself/gridsome-portfolio-starter">Gridsome Portfolio Starter</a>: a simple portfolio starter for Gridsome</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://fusejs.io/">Fuse.js</a>: a lightweight fuzzy-search library</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/octref/shiki">Shiki</a>: a beautiful syntax highlighter</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://feathericons.com/">Feather Icons</a>: beautiful open-source icons</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://mflash.dev/remarkability/">Remarkability</a>: baseline css for HTML generated from markdown</li>
          </ul>
          <p>It uses</p>
          <ul class="content">
            <li><a target="_blank" rel="noopener noreferrer" href="https://alligator.io/css/theming-custom-properties/">custom CSS properties</a> for theme switching</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a> for querying data</li>
            <li><a href="https://vuejs.org/">Vue.js</a> for components and layouts</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://rsms.me/inter/">Inter</a> as the main font</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/be5invis/iosevka">Iosevka SS05</a> as the <code>monospace</code> font</li>
            <li>a customized version of <a target="_blank" rel="noopener noreferrer" href="https://github.com/arcticicestudio/nord">Nord</a> to decorate highlighted codeblocks</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://circleci.com/">CircleCI</a> for continuous integration</li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/tschaub/gh-pages">gh-pages</a> for deployment</li>
            <li>graphics and illustrations created with <a target="_blank" rel="noopener noreferrer" href="https://affinity.serif.com/en-gb/designer/">Affinity Designer</a> and <a target="_blank" rel="noopener noreferrer" href="https://www.adobe.com/in/products/xd.html">Adobe XD</a></li>
          </ul>
          <p>
            The source of this site is <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">available</a> under <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">MIT</a>, the content under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a>.
          </p>
        </section>
      </div>
    </div>
    <div class="to-content">
      <a href="#" v-scroll-to="aboutSite">About this site</a><br/>
      <a href="#" v-scroll-to="acknowledgments">Acknowledgements</a>
    </div>
    <div class="to-the-top">
      <a href="#" title="Back to top" v-scroll-to="aboutMe">
        <svg class="icon icon-up" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
      </a>
    </div>
  </Layout>
</template>

<page-query>
query AuthorById {
  author (id: "naiyer") {
    id
    title
    bio
    avatar
    twitter
  }
}
</page-query>

<script>
import Hero from '~/components/Hero'

export default {
  metaInfo() {
    return {
      title: this.$page.author.title,
      meta: [
        {
          key: "description",
          name: "description",
          content: this.$page.author.bio
        }
      ]
    };
  },
  components: {
    Hero
  },
  computed: {
    aboutMe() {
      return "#about-me"
    },
    aboutSite() {
      return "#about-site"
    },
    acknowledgments() {
      return "#acknowledgments"
    }
  }
};
</script>

<style lang="scss" scoped>
main, section {
  h2 {
    margin-bottom: $gap;
    font-size: $text-md;
    font-weight: $font-semibold;
  }

  h3 {
    margin-top: $gap;
    font-weight: $font-bold;
  }

  .content {
    margin-bottom: $gap-md;
  }

  ul {
    margin-left: $gap;
  }

  a {
    &:focus, &:hover {
      text-decoration: underline;
    }
  }
}

main {
  font-size: $text-md;
}

.acknowledgments {
  margin-top: $gap;

  @include tablet-landscape {
    margin-top: $gap-lg;
  }
}

.to-the-top, .to-content {
  position: fixed;
  text-align: right;
  right: $gap;
  z-index: $rise-lg;
  @include hidden;

  @include tablet-landscape {
    @include visible;
  }
}

.to-the-top {
  bottom: $gap;
}

.to-content {
  bottom: 7vh;
}
</style>
