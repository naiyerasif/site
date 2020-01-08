<template>
  <Layout>
    <div class="container hero">
      <h1>{{ $page.post.title }}</h1>
    </div>
    <div class="container">
      <div class="post">
        <main class="panel article" v-html="$page.post.content" />
        <aside>
          <p class="author" v-for="author in $page.post.authors" :key="author.id">
            <g-image :alt="author.name" :src="author.avatar" class="icon" />
            <g-link :to="author.path">{{ author.name }}</g-link>
          </p>
          <p>{{ displayDate }}</p>
          <p>{{ $page.post.timeToRead }} min read</p>
          <p>
            <g-link :to="tag.path" v-for="tag in $page.post.tags" :key="tag.id">
              #{{ tag.title }} 
            </g-link>
          </p>
        </aside>
      </div>
      <div class="options">
        <a target="_blank" rel="noopener noreferrer" :href="$page.post.editUrl"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-edit"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="currentColor" fill-opacity="0.2"></path></svg> Edit this page</a>
        <a :href="jumpToTableOfContents"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-up"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg> Back to top</a>
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
    authors {
      id
      name
      avatar
      path
    }
    content
    path
    timeToRead
    editUrl
    tags {
      title
      path
    }
  }
}
</page-query>

<script>
import siteConfig from '../../data/site.json'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  computed: {
    displayDate() {
      const published = `Published ${this.$page.post.date}`
      return !this.$page.post.hasOwnProperty('updated') ? published : (this.$page.post.updated !== this.$page.post.date ? `Updated ${this.$page.post.updated}` : published); 
    },
    jumpToTableOfContents() {
      return `#${siteConfig.tocPattern.toLowerCase().replace(/ /g, '-')}`
    }
  }
}
</script>
