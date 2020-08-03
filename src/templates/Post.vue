<template>
  <Layout>
    <section class="hero">
      <div class="metadata">
        <div class="metadata-content">
          <div class="metadata-header">
            <div class="metadata-author" v-for="author in $page.post.authors" :key="author.id">
              <g-link :to="author.path">{{ author.name }}</g-link>
            </div>
            <div class="metadata-item" v-html="displayDate"></div>
            <div class="metadata-item">&sim;{{ $page.post.timeToRead }} min read</div>
          </div>
          <h1 class="title">{{ $page.post.title }}</h1>
          <div class="metadata-footer topics">
            <span class="gap-ch" v-for="topic in $page.post.topics" :key="topic">#{{ topic }}</span>
          </div>
        </div>
      </div>
    </section>
    <main class="content">
      <ScrollIndicator />
      <Toc :headers="$page.post.headings" />
      <div class="article">
        <blockquote class="is-warning" v-if="outdationMessage">{{ outdationMessage }}</blockquote>
        <article v-html="$page.post.content" />
      </div>
    </main>
    <div class="sidekick">
      <div class="sidekick-navigation">
        <div class="is-prev">
          <g-link v-if="$page.previous" :to="$page.previous.path">
            <small class="indicator">&larr;</small>
            <span><small class="label">Previous</small>{{ $page.previous.title }}</span>
          </g-link>
        </div>
        <div class="is-next">
          <g-link v-if="$page.next" :to="$page.next.path">
            <span>{{ $page.next.title }}<small class="label">Next</small></span>
            <small class="indicator">&rarr;</small>
          </g-link>
        </div>
      </div>
      <div class="sidekick-actions">
        <a target="_blank" rel="noopener noreferrer" title="Edit this page" :href="editUrl">
          <Sprite symbol="icon-edit" class="icon-rg" />
        </a>
        <a href="#table-of-contents" title="Table of Contents">
          <Sprite symbol="icon-contents" class="icon-rg" />
        </a>
        <a href="#app" title="Back to top">
          <Sprite symbol="icon-up" class="icon-rg" />
        </a>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Blog ($id: ID!, $previousId: ID!, $nextId: ID!) {
  post: blog (id: $id) {
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
      path
    }
    topics
    content
    path
    timeToRead
    outdated
  }

  previous: blog (id: $previousId) {
    title
    path
  }

  next: blog (id: $nextId) {
    title
    path
  }
}
</page-query>

<script>
import Toc from '~/components/Toc'
import Sprite from '~/components/Sprite'
import ScrollIndicator from '~/components/ScrollIndicator'
import * as appConfig from '@/app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  components: {
    Toc,
    Sprite,
    ScrollIndicator
  },
  computed: {
    displayDate() {
      const published = `Published <time>${this.$page.post.date}</time>`
      return !this.$page.post.hasOwnProperty('updated') ? published : (this.$page.post.updated !== this.$page.post.date ? `Updated <time>${this.$page.post.updated}</time>` : published); 
    },
    editUrl() {
      const editContext = appConfig.editConfig && appConfig.editConfig.Post ? appConfig.editConfig.Post : appConfig.prefs.editContext
      return `${editContext}/${this.$page.post.fileInfo.path}`
    },
    outdationMessage() {
      return this.$page.post.outdated !== 'undefined' && this.$page.post.outdated === 'true' ? 'This post is outdated. Some information may be inaccurate.' : null
    }
  }
}
</script>
