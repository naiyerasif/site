<template>
  <Layout>
    <div class="hero container-inner mx-auto flex flex-col sm:flex-row justify-between pt-16 pb-5">
      <div class="w-full sm:w-3/5 text-center sm:text-left">
        <div class="text-4xl font-bold leading-tight">Naiyer Asif</div>
        <div class="text-2xl my-2">Bibliophile. Urdu Speaker. Aligarian. I work on Java and Angular codebases. Also, a serial tea-sipper.</div>
      </div>
      <div class="mt-0">
        <g-image src="../../static/developer.svg" width="240px" alt="hero" class="mx-auto sm:mx-0" />
      </div>
    </div>

    <div class="container-inner mx-auto pb-16">
      <p class="text-lg sm:text-xl mb-5">I'm a software engineer from Bengaluru. I have extensive experience on Spring and Angular applications. I have worked on Oracle and MongoDB databases and have experience in many other technologies (including Docker, Jenkins and ODI).</p>
      <p class="text-lg sm:text-xl">I enjoy reading fiction in English and Urdu and listening to Pop and Vocals. Feel free to look around and contact me with any questions.</p>
    </div>

    <div class="overflow-x-hidden">
      <div class="contact-me bg-background-secondary pt-16">
        <div class="container-inner mx-auto text-xl pb-4 relative">
          <h2 class="font-bold mb-6" id="contact">Acknowledgements</h2>

          <div class="absolute right-0 top-0" style="transform: translate(100%) rotate(180deg)">
            <svg width="170px" height="170px"><use xlink:href="#dots-triangle" /></svg>
          </div>

          <p class="mb-12">This site was made possible by
            <ul class="my-5">
              <li>
                <a href="https://gridsome.org/">Gridsome</a> - a modern Vue.js framework which generates this website
              </li>
              <li>
                <a href="https://github.com/drehimself/gridsome-portfolio-starter">Gridsome Portfolio Starter</a> - which was the base for this website
              </li>
              <li>
                <a href="https://tailwindcss.com/">tailwindcss</a> - the CSS framework
              </li>
              <li>
                <a href="https://fusejs.io/">Fuse.js</a> - which powers the search
              </li>
              <li>
                <a href="https://feathericons.com/">Feather Icons</a> - for all the SVG icons
              </li>
              <li>
                <a href="https://undraw.co">unDraw</a> - for the awesome SVG illustrations
              </li>
            </ul>
            The theme switching is done with the help of <a href="https://alligator.io/css/theming-custom-properties/">custom CSS properties</a>, the data is queried through <a href="https://graphql.org/">GraphQL</a> and the components are powered by <a href="https://vuejs.org/">Vue.js</a>. The fonts are mostly system-native with the exception of <code>monospace</code> fonts where <a href="https://fonts.google.com/specimen/Roboto+Mono">Roboto Mono</a> is preferred.
          </p>
          <p class="mb-12">The source of this site can be found at its <a href="https://github.com/Microflash/microflash.github.io">GitHub repo</a>.</p>
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

