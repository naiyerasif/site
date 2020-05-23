<template>
  <Layout>
    <section class="hero">
      <div class="container">
        <div class="metadata">
          <div class="metadata-content">
            <div class="metadata-header">
              <div class="metadata-author" v-for="author in $page.post.authors" :key="author.id">
                <g-link :to="author.path">{{ author.name }}</g-link>
              </div>
              <div class="metadata-item" v-html="displayDate"></div>
              <div class="metadata-item">{{ $page.post.timeToRead }} min read</div>
            </div>
            <h1 class="title">{{ $page.post.title }}</h1>
            <div class="metadata-footer">
              <Sprite :symbol="label" class="label" v-for="label in $page.post.labels" :key="label" />
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="content">
      <main class="container">
        <Toc :headers="$page.post.headings" />
        <div class="article">
          <blockquote class="is-warning" v-if="outdationMessage">{{ outdationMessage }}</blockquote>
          <article v-html="$page.post.content" />
        </div>
      </main>
    </div>
    <div class="sidekick">
      <div class="container">
        <div class="sidekick-recommendations">
          <g-link v-if="$page.previous" :to="$page.previous.path">
            &larr; {{ $page.previous.title }}
          </g-link>
          <g-link v-if="$page.next" :to="$page.next.path" style="text-align: right">
            {{ $page.next.title }} &rarr;
          </g-link>
        </div>
        <div class="sidekick-actions">
          <a target="_blank" rel="noopener noreferrer" :href="editUrl">
            <Sprite symbol="icon-edit" class="icon" /> Edit this page
          </a>
          <a href="#table-of-contents" class="is-visible-on-phone">
            <Sprite symbol="icon-list" class="icon" /> Table of Contents
          </a>
          <a href="#app">
            <Sprite symbol="icon-up" class="icon" /> Back to top
          </a>
        </div>
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
    labels
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
import * as appConfig from '@/app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  components: {
    Toc,
    Sprite
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
      let warning = null
      if (!['#', 'never'].includes(this.$page.post.outdated)) {
        warning = `This post is marked as ${this.$page.post.outdated}. Some information may be inaccurate.`
      }
      return warning
    }
  }
}
</script>
