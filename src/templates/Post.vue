<template>
  <Layout>
    <div class="bg-background-quaternary">
      <div class="container-inner mx-auto textl-xl">
        <div class="w-full py-4 md:pt-12 md:pb-24 bg-background-pattern">
          <a class="hidden" id="backToTop"></a>
          <h1 class="text-3xl font-bold md:text-5xl leading-tight mb-3">{{ $page.post.title }}</h1>
          <div class="flex text-gray py-4" v-for="author in $page.post.author" :key="author.id">
            <g-image :alt="author.title" :src="author.avatar" class="h-10 w-10 rounded-full mx-0 mr-2" />
            <div class="text-left">
              <g-link class="text-sm font-semibold" :to="author.path">{{ author.title }}</g-link>
              <div class="text-sm">{{ displayDate }} &middot; {{ $page.post.timeToRead }} min read</div>
            </div>
          </div>
          <div class="flex mb-8 text-sm">
            <g-link
              :to="tag.path"
              v-for="(tag, i) in $page.post.tags"
              :key="tag.id" :class="{'font-bold': i === 0}"
              class="bg-background-tertiary z-10 text-copy-tertiary hover:text-copy-tertiary rounded-full px-2 py-1 mr-2 text-xs hover:bg-background-quinary">
              <span v-if="i !== 0">#</span>{{ tag.title }}
            </g-link>
          </div>
        </div>
      </div>
    </div>
    <div class="container-inner mx-auto py-4 md:py-16">
      <markdown v-html="$page.post.content" />
      <div class="fixed right-4 bottom-4 z-0">
        <a href="#" title="Back to top" v-scroll-to="'#backToTop'" class="mr-4 text-gray-400 hover:text-green-200">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline">
            <circle cx="12" cy="12" r="10" style="background:#fff"></circle>
            <polyline points="16 12 12 8 8 12"></polyline>
            <line x1="12" y1="16" x2="12" y2="8"></line>
          </svg>
        </a>
        <a href="/" title="Home" class="text-gray-400 hover:text-green-200">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline">
            <path style="background:#fff" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </a>
      </div>
    </div>
    <div class="overflow-x-hidden">
      <div class="bg-background-secondary py-8 md:py-12">
        <div class="container-inner mx-auto text-xl relative">
          <span class="mr-2">Spotted a mistake or want to improve this post?</span>
          <a target="_blank" rel="noopener noreferrer" :href="editUrl"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit this page on GitHub!</a>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Post ($path: String!) {
  post: post (path: $path) {
    title
    date (format: "MMMM D, Y")
    updated (format: "MMMM D, Y")
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

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  computed: {
    editUrl() {
      const tokens = this.$page.post.path.split('/');
      const slug = tokens.splice(1,2).join('/') + tokens.join('-');
      return "https://github.com/Microflash/microflash.github.io/edit/release/" + slug + ".md";
    },
    displayDate() {
      return this.$page.post.updated !== this.$page.post.date ? 'Updated ' + this.$page.post.updated : 'Published ' + this.$page.post.date;
    }
  },
  components: {
    Markdown
  }
}
</script>
