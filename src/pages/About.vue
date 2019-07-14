<template>
  <Layout>
    <div class="bg-background-quaternary">
      <div class="container-inner mx-auto textl-xl">
        <div class="w-full py-8 md:py-12">
          <h1 class="text-3xl md:text-5xl mb-4 leading-tight">Hello, I'm <span class="text-green-500">Naiyer</span>,<br>
            a full-stack developer <br>from Bengaluru, India.</h1>
        </div>
      </div>
      <div class="container-inner mx-auto -mt-48 md:-mt-32 pb-4 overflow-x-hidden">
        <g-image src="../../static/pattern.svg" class="inline"/>
      </div>
    </div>
    <div class="container-inner mx-auto py-8 md:py-16">
      <p class="text-lg sm:text-xl">I have more than 4 years of experience in Banking &amp; Financial Services, Legal &amp; Compliance and Aviation domains.</p>
      <p class="text-lg sm:text-xl mt-8">I'm adept at &mdash;</p>
      <g-image src="../../static/java.svg" class="w-1/6 inline my-4" alt="Java" />
      <g-image src="../../static/spring.svg" class="w-1/6 inline my-4" alt="Spring Framework" />
      <g-image src="../../static/angular.svg" class="w-1/6 inline my-4" alt="Angular" />
      <g-image src="../../static/oracle.svg" class="w-1/6 inline my-4" alt="Oracle Database" />
      <p class="text-lg sm:text-xl mt-8">I have also worked on the following technologies, amongst others &mdash;</p>
      <g-image src="../../static/docker.svg" class="w-1/6 inline my-4" alt="Docker" />
      <g-image src="../../static/mongodb.svg" class="w-1/6 inline my-4" alt="mongoDB" />
      <g-image src="../../static/jenkins.svg" class="w-1/6 inline my-4" alt="Jenkins" />
      <g-image src="../../static/kotlin.svg" class="w-1/6 inline my-4" alt="Kotlin" />
      <p class="text-lg sm:text-xl mt-8">Besides writing code, I love to write documentation that is easy to read and digest (shoutout to fantastic <a href="https://spring.io/guides">Spring</a>, <a href="https://docs.docker.com/">Docker</a> and <a href="https://vuejs.org/v2/guide/">Vue.js</a> guides).</p>
      <p class="text-lg sm:text-xl mt-8">When I'm not solving problems, I'm reading (mostly science fiction and spy thrillers) in English or Urdu, and listening to Pop and Vocals.</p>
      <p class="text-lg sm:text-xl mt-8">Feel free to look around and contact me with any questions at <a href="https://www.twitter.com/Microflash">@Microflash</a> (which is the namesake of this blog).</p>
    </div>

    <div class="overflow-x-hidden">
      <div class="contact-me bg-background-secondary pt-16">
        <div class="container-inner mx-auto text-xl pb-4 relative">
          <h2 class="font-bold mb-6" id="contact">Acknowledgements</h2>

          <div class="absolute right-0 top-0" style="transform: translate(100%) rotate(180deg)">
            <svg width="170px" height="170px"><use xlink:href="#dots-triangle" /></svg>
          </div>

          <p class="mb-12">This site is made possible by:
            <ul class="my-5">
              <li>
                <a href="https://gridsome.org/">Gridsome</a>: a modern Vue.js framework for static websites
              </li>
              <li>
                <a href="https://github.com/drehimself/gridsome-portfolio-starter">Gridsome Portfolio Starter</a>: a simple portfolio starter for Gridsome
              </li>
              <li>
                <a href="https://tailwindcss.com/">tailwindcss</a>: a utility-first CSS framework
              </li>
              <li>
                <a href="https://fusejs.io/">Fuse.js</a>: a lightweight fuzzy-search library
              </li>
              <li>
                <a href="https://feathericons.com/">Feather Icons</a>: beautiful open-source icons
              </li>
            </ul>
            The theme switching is done with the help of <a href="https://alligator.io/css/theming-custom-properties/">custom CSS properties</a>, the data is queried through <a href="https://graphql.org/">GraphQL</a> and the components and layouts are powered by <a href="https://vuejs.org/">Vue.js</a>. The fonts are mostly system-native with the exception of <code>monospace</code> fonts where <a href="https://fonts.google.com/specimen/Roboto+Mono">Roboto Mono</a> is preferred.
          </p>
          <p class="mb-12">Continuous Integration is handled through <a href="https://circleci.com/">CircleCI</a> and deployments are done with <a href="https://github.com/tschaub/gh-pages">gh-pages</a>. Graphics and illustrations are created using <a href="https://affinity.serif.com/en-gb/designer/">Affinity Designer</a>, <a href="https://products.office.com/en-in/visio/flowchart-software">Microsoft Visio</a> and <a href="https://www.adobe.com/in/products/xd.html">Adobe XD</a>.</p>
          <p class="mb-12">The source of this site is <a href="https://github.com/Microflash/microflash.github.io">available</a> under <a href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE">MIT</a>, the content under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a>.</p>
        </div>
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

