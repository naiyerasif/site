<template>
  <Layout>
    <div class="bg-background-header text-content-body">
      <div class="container mx-auto textl-xl">
        <div class="w-full py-4 md:pt-12 md:pb-24 bg-background-pattern">
          <a class="hidden" id="backToTop"></a>
          <h1 class="text-3xl font-semibold md:text-5xl leading-tight mb-3">{{ $page.cheatsheet.title }}</h1>
          <div class="flex text-gray py-4" v-for="author in $page.cheatsheet.author" :key="author.id">
            <g-image :alt="author.title" :src="author.avatar" class="h-10 w-10 rounded-full mx-0 mr-2" />
            <div class="text-left">
              <g-link class="text-sm font-semibold" :to="author.path">{{ author.title }}</g-link>
              <div class="text-sm">{{ displayDate }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mx-auto py-4 md:py-16">
      <markdown v-html="$page.cheatsheet.content" />
      <quick-links :dest="'backToTop'" />
    </div>
    <div class="overflow-x-hidden">
      <div class="bg-background-card py-8 md:py-12">
        <div class="container mx-auto text-xl relative">
          <span class="mr-2">Spotted a mistake or want to improve this cheatsheet?</span>
          <a target="_blank" rel="noopener noreferrer" :href="editUrl"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit this page on GitHub!</a>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Cheatsheet ($path: String!) {
  cheatsheet: cheatsheet (path: $path) {
    title
    date (format: "MMMM D, Y")
    updated (format: "MMMM D, Y")
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
      return "https://github.com/Microflash/microflash.github.io/edit/release" + slug.substring(0, slug.length - 1) + ".md";
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
