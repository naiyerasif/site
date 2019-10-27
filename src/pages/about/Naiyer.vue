<template>
  <Layout>
    <div class="decorated-links">
      <div class="bg-background-header text-content-body">
        <div class="container mx-auto text-xl">
          <div class="w-full py-4 md:py-16 bg-background-pattern">
            <h1 class="text-3xl font-semibold md:text-5xl mb-4 md:mb-16 leading-tight">
              Hello, I am <span class="text-primary-500">Naiyer</span>
              <br />a full-stack developer
              <br />from Bengaluru, India.
            </h1>
          </div>
        </div>
      </div>
      <div class="container mx-auto py-4 md:py-16">
        <p class="text-xl">I have more than 4 years of experience in Banking &amp; Financial Services, Legal &amp; Compliance and Aviation domains.</p>
        <p class="text-xl font-semibold mt-4 md:mt-8">Technologies I am adept at &mdash;</p>
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
        <p class="text-xl font-semibold mt-4 md:mt-8">Other technologies that I work on &mdash;</p>
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
                  <h3 class="card-title">mongoDB</h3>
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
        <p class="text-xl mt-4 md:mt-8">
          Besides writing code, I love to create documentation that is easy to read and comprehend (shoutout to fantastic <a target="_blank" rel="noopener noreferrer" href="https://spring.io/guides">Spring</a>, <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/">Docker</a> and <a target="_blank" rel="noopener noreferrer" href="https://vuejs.org/v2/guide/">Vue.js</a> guides).
        </p>
        <p class="text-xl mt-8">When I am not solving problems, I am reading English or Urdu science fiction and thrillers, listening to Pop and Vocals or drawing SVG illustrations.</p>
        <p class="text-xl mt-8">Feel free to look around and contact me with any questions at <a target="_blank" rel="noopener noreferrer" href="https://www.twitter.com/Microflash">{{ $page.author.twitter }}</a> (which is the namesake of this blog).</p>
      </div>
      <div class="overflow-x-hidden">
        <div class="bg-background-card pt-4 md:pt-20">
          <div class="container mx-auto text-xl pb-4 relative">
            <h2 class="font-bold mb-6">Acknowledgements</h2>
            <div class="absolute right-0 top-0" style="transform: translate(100%) rotate(180deg)">
              <svg width="170px" height="170px"><use xlink:href="#dots-triangle" /></svg>
            </div>
            <p class="mb-8">This site is made possible by:</p>
            <ul class="mb-8">
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
                <a target="_blank" rel="noopener noreferrer" href="https://feathericons.com/">Feather Icons</a>: beautiful open-source icons
              </li>
            </ul>
            <p class="mb-8">
              The theme switching is done with the help of <a target="_blank" rel="noopener noreferrer" href="https://alligator.io/css/theming-custom-properties/">custom CSS properties</a>, the data is queried through <a target="_blank" rel="noopener noreferrer" href="https://graphql.org/">GraphQL</a> and the components and layouts are powered by <a href="https://vuejs.org/">Vue.js</a>. <a target="_blank" rel="noopener noreferrer" href="https://rsms.me/inter/">Inter</a> is used as the main font (with an optional support for <a target="_blank" rel="noopener noreferrer" href="https://v-fonts.com/">variable fonts</a>) and <a target="_blank" rel="noopener noreferrer" href="https://fonts.google.com/specimen/Roboto+Mono">Roboto Mono</a> as the <code>monospace</code> font across the website.
            </p>
            <p class="mb-8">
              Continuous Integration is handled through <a target="_blank" rel="noopener noreferrer" href="https://circleci.com/">CircleCI</a> and deployments are done with <a target="_blank" rel="noopener noreferrer" href="https://github.com/tschaub/gh-pages">gh-pages</a>. Graphics and illustrations are created using <a target="_blank" rel="noopener noreferrer" href="https://affinity.serif.com/en-gb/designer/">Affinity Designer</a>, <a target="_blank" rel="noopener noreferrer" href="https://www.adobe.com/in/products/xd.html">Adobe XD</a> and <a target="_blank" rel="noopener noreferrer" href="https://products.office.com/en-in/visio/flowchart-software">Microsoft Visio</a>.
            </p>
            <p class="mb-1 md:mb-20">
              The source of this site is <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev">available</a> under <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev/blob/release/LICENSE">MIT</a>, the content under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a>.
            </p>
          </div>
        </div>
      </div>
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
  }
};
</script>
