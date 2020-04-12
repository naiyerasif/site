<template>
  <Layout>
    <div class="container hero">
      <section class="canvas">
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
        </div>
        <h1 class="title">{{ $page.post.title }}</h1>
        <div class="subtitle">
          <svg v-svg :symbol="label" v-for="label in $page.post.labels" :key="label"></svg>
        </div>
      </section>
    </div>
    <div class="container article">
      <div class="content">
        <blockquote class="is-warning" v-if="outdationMessage">{{ outdationMessage }}</blockquote>
        <Contents :headers="$page.post.headings" />
        <main class="main" v-html="$page.post.content" />
      </div>
    </div>
    <div class="container sidekick">
      <div class="article-actions">
        <a target="_blank" rel="noopener noreferrer" :href="editUrl">
          <IconEdit class="icon" /> Edit this page
        </a>
        <a href="#table-of-contents">
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
    fileInfo {
      path
    }
    headings {
      depth
      value
      anchor
    }
    authors {
      id
      name
      avatar
      path
    }
    labels
    content
    path
    timeToRead
    outdated
  }
}
</page-query>

<static-query>
query {
  metadata {
    editContext
  }
}
</static-query>

<script>
import Contents from '~/components/Contents'
import IconEdit from '@/images/icon-edit.svg'
import IconList from '@/images/icon-list.svg'
import IconUp from '@/images/icon-up.svg'
import * as appConfig from '../../app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  components: {
    Contents,
    IconEdit,
    IconList,
    IconUp
  },
  computed: {
    displayDate() {
      const published = `Published <time>${this.$page.post.date}</time>`
      return !this.$page.post.hasOwnProperty('updated') ? published : (this.$page.post.updated !== this.$page.post.date ? `Updated <time>${this.$page.post.updated}</time>` : published); 
    },
    editUrl() {
      const editContext = appConfig.editConfig && appConfig.editConfig.Post ? appConfig.editConfig.Post : this.$static.metadata.editContext
      return `${editContext}/${this.$page.post.fileInfo.path}`
    },
    outdationMessage() {
      let warning = null
      if (!['#', 'never'].includes(this.$page.post.outdated)) {
        warning = `This post is marked as ${this.$page.post.outdated}. Some information may be inaccurate.`
      }
      return warning
    }
  },
  methods: {
    resolveLabelIcon(label) {
      return `/assets/images/labels/${label}.svg`
    }
  }
}
</script>
