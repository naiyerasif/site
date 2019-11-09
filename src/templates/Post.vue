<template>
  <Layout>
    <section>
      <div class="container mx-auto mt-2 sm:mt-0 sm:mb-4">
        <div class="w-full sm:w-3/4">
          <h1 class="text-3xl md:text-5xl font-semibold leading-tight mb-4">{{ $page.post.title }}</h1>
          <div class="flex items-center pb-2" v-for="author in $page.post.author" :key="author.id">
            <g-image :alt="author.title" :src="author.avatar" class="h-10 w-10 rounded-full shadow mx-0 mr-2" />
            <div class="text-left text-sm">
              <g-link class="font-semibold" :to="author.path">{{ author.title }}</g-link>
              <p>{{ displayDate }}</p>
            </div>
          </div>
          <div class="flex text-sm items-center">
            <g-link :to="tag.path" v-for="(tag, i) in $page.post.tags" :key="tag.id" :class="{'font-bold': i === 0}" class="tag">
              <span v-if="i !== 0">#</span>{{ tag.title }}
            </g-link> 
            <p><span class="opacity-25">&sol;</span> {{ $page.post.timeToRead }} min read</p>
          </div>
        </div>
      </div>
    </section>
    <div class="container py-8 md:py-12 -mx-10">
      <markdown class="w-full sm:w-3/4 px-10 py-4 sm:py-10 bg-background-main" v-html="$page.post.content" />
      <quick-links :dest="'table-of-contents'" />
    </div>
    <div class="overflow-x-hidden">
      <div class="container z-10 bg-background-footer mx-auto text-xl relative">
        <span class="mr-2">Spotted a mistake or want to improve this post?</span>
        <a target="_blank" rel="noopener noreferrer" :href="editUrl"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit this page on GitHub!</a>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Post ($path: String!) {
  post: post (path: $path) {
    title
    date (format: "MMM D, Y")
    updated (format: "MMM D, Y")
    author {
      id
      title
      avatar
      path
    }
    content
    path
    timeToRead
    tags {
      title
      path
    }
  }
}
</page-query>

<script>
import Markdown from '~/components/Markdown'
import QuickLinks from '~/components/QuickLinks'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  computed: {
    editUrl() {
      const tokens = this.$page.post.path.split('/');
      tokens[1] = tokens[1] + "/" + tokens[2];
      const slug = tokens.splice(1,2).join('/') + tokens.join('-');
      return "https://github.com/Microflash/mflash.dev/edit/release/content/" + slug.substring(0, slug.length - 1) + ".md";
    },
    displayDate() {
      return this.$page.post.updated !== this.$page.post.date ? 'Updated ' + this.$page.post.updated : 'Published ' + this.$page.post.date;
    }
  },
  components: {
    Markdown,
    QuickLinks
  }
}
</script>
