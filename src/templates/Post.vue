<template>
  <Layout>
    <div class="container hero">
      <div class="metadata">
        <div class="metadata-item">
          <div class="metadata-author" v-for="author in $page.post.authors" :key="author.id">
            <g-image :alt="author.name" :src="author.avatar" />
            <g-link :to="author.path">{{ author.name }}</g-link>
          </div>
        </div>
        <div class="separator"></div>
        <div class="metadata-item" v-html="displayDate"></div>
        <div class="separator"></div>
        <div class="metadata-item">{{ $page.post.timeToRead }} min read</div>
        <div class="separator"></div>
        <div class="metadata-item">
          <g-link :to="tag.path" v-for="tag in $page.post.tags" :key="tag.id">#{{ tag.title }} </g-link>
        </div>
      </div>
      <h1>{{ $page.post.title }}</h1>
    </div>
    <div class="container article">
      <main class="main" v-html="$page.post.content" />
      <div class="article-actions">
        <a target="_blank" rel="noopener noreferrer" :href="$page.post.editUrl">
          <IconEdit class="icon" /> Edit this page
        </a>
        <a :href="jumpToTableOfContents">
          <IconList class="icon" /> Table of Contents
        </a>
        <a href="#app">
          <IconUp class="icon" /> Back to top
        </a>
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
import IconEdit from '~/assets/images/icon-edit.svg'
import IconList from '~/assets/images/icon-list.svg'
import IconUp from '~/assets/images/icon-up.svg'
import siteConfig from '../../data/site.json'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  components: {
    IconEdit,
    IconList,
    IconUp
  },
  computed: {
    displayDate() {
      const published = `Published <time>${this.$page.post.date}</time>`
      return !this.$page.post.hasOwnProperty('updated') ? published : (this.$page.post.updated !== this.$page.post.date ? `Updated <time>${this.$page.post.updated}</time>` : published); 
    },
    jumpToTableOfContents() {
      return `#${siteConfig.tocPattern.toLowerCase().replace(/ /g, '-')}`
    }
  }
}
</script>
