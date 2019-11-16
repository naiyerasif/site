<template>
  <Layout>
    <div class="decorated-links">
      <div class="container mx-auto">
        <div class="w-full sm:w-3/4">
          <div class="text-2xl md:text-5xl font-semibold leading-tight">
            Hello, I am <span id="about-me" class="text-primary-500">Naiyer</span>
            <br/>a full-stack developer
            <br/>from Bengaluru, India.
          </div>
        </div>
      </div>
      <div class="container pt-6 md:pt-16 -mx-10">
        <main class="w-full sm:w-3/4 px-10 py-4 md:py-10 bg-background-main text-xl">
          <p>I have more than 4 years of experience in Banking &amp; Financial Services, Legal &amp; Compliance and Aviation domains.</p>
          <p class="font-semibold mt-4 md:mt-8">Technologies I am adept at &mdash;</p>
          <div class="pt-4 md:pt-6">
            <div class="grid row flex flex-wrap -mx-6 md:-mx-2">
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Platform</div>
                    <h3 class="card-title">Java</h3>
                    <p>The most popular programming platform for building enterprise applications</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Framework</div>
                    <h3 class="card-title">Spring</h3>
                    <p>Lightweight open-source Java framework for building large-scale applications</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Framework</div>
                    <h3 class="card-title">Angular</h3>
                    <p>An open-source TypeScript-based framework to create single-page applications</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Database</div>
                    <h3 class="card-title">Oracle</h3>
                    <p>A proprietary multi-model database management system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="font-semibold mt-4 md:mt-8">Other technologies that I work on &mdash;</p>
          <div class="pt-4 md:pt-6">
            <div class="grid row flex flex-wrap -mx-6 md:-mx-2">
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Platform</div>
                    <h3 class="card-title">Node.js</h3>
                    <p>An open-source, cross-platform runtime to run JavaScript code on server</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Platform</div>
                    <h3 class="card-title">Docker</h3>
                    <p>Enterprise container platform to build, share and deploy applications anywhere</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Database</div>
                    <h3 class="card-title">MongoDB</h3>
                    <p>A general purpose, cross-platform, document-based, distributed NoSQL database</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Automation</div>
                    <h3 class="card-title">Jenkins</h3>
                    <p>An open-source automation server to build, deploy and automate projects</p>
                  </div>
                </div>
              </div>
              <div class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
                <div class="card rounded-none md:rounded">
                  <div class="p-4">
                    <div class="card-category">Language</div>
                    <h3 class="card-title">Kotlin</h3>
                    <p>An interoperable statically-typed programming language that runs on the Java virtual machine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-4 md:mt-8">
            Besides writing code, I compose poetry, draw vector illustrations and automate boring repetitive stuff using terminal and scripts. I prowl the web to discover typography and digital art (mostly geometric and vector) and find shiny new tools to tinker with (I've signed up for way more beta programs than anyone should). I also dedicate a fair chunk of my time for reading fiction, history, and physics.
          </p>
          <p class="mt-8">Feel free to look around and contact me with any questions at <a target="_blank" rel="noopener noreferrer" href="https://www.twitter.com/Microflash">{{ $page.author.twitter }}</a> (which is the namesake of this site).</p>
        </main>

        <section class="w-full sm:w-3/4 px-10 py-4 md:py-10 mt-0 sm:mt-10 bg-background-card text-base">
          <h2 class="font-bold mb-6" id="about-site">About this site</h2>
          <p class="mb-8">
            This site started out as a pet project for me to learn <a target="_blank" rel="noopener noreferrer" href="https://vuejs.org/">Vue.js</a> and <a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a>, and as a way to get my bearing around Vue.js community. Working on this project, I became more informed about accessible color systems, content preloading, optimization of vector illustrations, <a target="_blank" rel="noopener noreferrer" href="https://unifiedjs.com/">unifiedjs</a> ecosystem, and more.
          </p>
          <p class="mb-8">
            Currently, I'm publishing my notes on development and design collected over the years, mostly to serve as a quickly accessible way to share and refer back. The code described in the examples is for the demonstration of the topic under discussion; it is not meant to be used as-is in production.
          </p>
          <h2 class="font-bold mb-6" id="acknowledgments">Acknowledgements</h2>
          <p class="mb-2">This site was made possible by</p>
          <ul class="mb-8 ml-8">
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://gridsome.org/">Gridsome</a>: a modern Vue.js framework for static websites
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/drehimself/gridsome-portfolio-starter">Gridsome Portfolio Starter</a>: a simple portfolio starter for Gridsome
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://tailwindcss.com/">tailwindcss</a>: a utility-first CSS framework
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://fusejs.io/">Fuse.js</a>: a lightweight fuzzy-search library
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/octref/shiki">Shiki</a>: a beautiful syntax highlighter
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href="https://feathericons.com/">Feather Icons</a>: beautiful open-source icons
            </li>
          </ul>
          <p class="mb-2">It uses</p>
          <ul class="mb-8 ml-8">
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
            The source of this site is <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev">available</a> under <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev/blob/release/LICENSE">MIT</a>, the content under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a>.
          </p>
        </section>
      </div>
    </div>
    <div class="fixed right-4 px-4 text-right z-20" style="bottom: 7vw">
      <a href="#" v-scroll-to="aboutSite">About this site</a><br/>
      <a href="#" v-scroll-to="ack">Acknowledgements</a>
    </div>
    <div class="fixed right-4 bottom-12 z-20">
      <a href="#" title="Back to top" v-scroll-to="aboutMe" class="mr-4">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
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
  computed: {
    aboutMe() {
      return "#about-me"
    },
    aboutSite() {
      return "#about-site"
    },
    ack() {
      return "#acknowledgments"
    }
  }
};
</script>

<style scoped>
@media (max-width: 1024px) {
  .fixed {
    visibility: hidden;
  }
}
</style>