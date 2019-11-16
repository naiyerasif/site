<template>
  <Layout>
    <section class="container mx-auto mt-2 sm:mt-0 sm:mb-4">
      <div class="w-full sm:w-3/4">
        <h1 id="backToTop" class="text-2xl md:text-5xl font-semibold leading-tight">{{ $page.cheatsheet.title }}</h1>
        <div class="flex items-center py-4" v-for="author in $page.cheatsheet.author" :key="author.id">
          <g-image :alt="author.title" :src="author.avatar" class="h-10 w-10 rounded-full shadow mx-0 mr-2" />
          <div class="text-left text-sm">
            <g-link class="font-semibold" :to="author.path">{{ author.title }}</g-link>
            <p>{{ displayDate }}</p>
          </div>
        </div>
      </div>
    </section>
    <div class="container py-4 md:py-12 -mx-10">
      <markdown class="w-full sm:w-3/4 px-10 py-4 sm:py-10 bg-background-main" v-html="$page.cheatsheet.content" />
      <quick-links :dest="'backToTop'" />
    </div>
    <div class="overflow-x-hidden">
      <div class="container z-10 bg-background-footer mx-auto relative">
        <span class="mr-2">Spotted a mistake or want to improve this cheatsheet?</span>
        <a target="_blank" rel="noopener noreferrer" :href="editUrl"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit this page on GitHub!</a>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Cheatsheet ($path: String!) {
  cheatsheet: cheatsheet (path: $path) {
    title
    date (format: "MMM D, Y")
    updated (format: "MMM D, Y")
    author {
      id
      title
      path
      avatar
    }
    content
    path
  }
}
</page-query>

<script>
import Markdown from '~/components/Markdown'
import QuickLinks from '~/components/QuickLinks'

export default {
  metaInfo() {
    return {
      title: this.$page.cheatsheet.title
    }
  },
  computed: {
    editUrl() {
      const slug = this.$page.cheatsheet.path;
      return "https://github.com/Microflash/mflash.dev/edit/release" + slug.substring(0, slug.length - 1) + ".md";
    },
    displayDate() {
      return this.$page.cheatsheet.updated !== this.$page.cheatsheet.date ? 'Updated ' + this.$page.cheatsheet.updated : 'Published ' + this.$page.cheatsheet.date;
    }
  },
  components: {
    Markdown,
    QuickLinks
  }
}
</script>
