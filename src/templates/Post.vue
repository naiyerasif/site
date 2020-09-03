<template>
  <Layout>
    <Hero>
      <div class="metadata">
        <div class="metadata-author" v-for="author in $page.post.authors" :key="author.id">
          <g-link :to="author.path">{{ author.name }}</g-link>
        </div>
        <div class="metadata-item" v-html="displayDate"></div>
        <div class="metadata-item">&sim;{{ $page.post.timeToRead }} min read</div>
      </div>
      <h1 class="title">{{ $page.post.title }}</h1>
      <div class="topics">
        <span class="gap-ch"><strong class="gap-ch">{{ $page.post.category }}</strong>on</span>
        <span class="gap-ch" v-for="topic in $page.post.topics" :key="topic">{{ topic }}</span>
      </div>
    </Hero>
    <ScrollIndicator />
    <main class="content">
      <div v-if="outdationMessage" class="admonition admonition-warning alert alert--danger">
        <div class="admonition-heading"><h5><span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"></path></svg></span>warning</h5></div>
        <div class="admonition-content">
          <p>{{ outdationMessage }}</p>
        </div>
      </div>
      <Toc v-if="$page.post.headings.length > 0" :headers="$page.post.headings" />
      <article class="article" v-html="$page.post.content" />
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
      <div class="sidekick-wrapper">
        <div class="sidekick-actions">
          <a target="_blank" rel="noopener noreferrer" title="Edit this page" :href="editUrl">
            <Sprite symbol="icon-edit" class="icon-rg" />
          </a>
          <a v-if="$page.post.headings.length > 0" href="#table-of-contents" title="Table of Contents">
            <Sprite symbol="icon-contents" class="icon-rg" />
          </a>
          <a href="#app" title="Back to top">
            <Sprite symbol="icon-up" class="icon-rg" />
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
    topics
    content
    category
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
import Hero from '~/components/partials/Hero'
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
    Hero,
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
