<template>
  <Layout>
    <template #hero>
      <div class="container flex flex-wrap flex-col items-start">
        <div class="flex items-center flex-wrap font-mono text-sm separated mb-base">
          <div v-html="displayDate" />
          <div>Reading time <strong>&sim;{{ $page.post.timeToRead }} mins</strong></div>
        </div>
        <h1 class="font-headings leading-tight text-lg">{{ $page.post.title }}</h1>
        <div class="text-sm separated">
          <strong class="capitalize">{{ $page.post.category }}</strong>
          <span v-for="(topic, idx) in $page.post.topics" :key="idx" class="font-mono uppercase">{{ topic }}</span>
        </div>
      </div>
    </template>
    <ScrollIndicator />
    <main class="container px-far-base">
      <div v-if="outdationMessage" class="admonition admonition-warning alert alert--danger">
        <div class="admonition-heading"><h5><span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"></path></svg></span>warning</h5></div>
        <div class="admonition-content">
          <p>{{ outdationMessage }}</p>
        </div>
      </div>
      <Toc v-if="$page.post.headings.length > 0" :headers="$page.post.headings" />
      <article class="article max-sm" v-html="$page.post.content" />
    </main>
    <template #sidekick>
      <g-link class="flex focus:no-underline hover:no-underline" v-if="$page.previous" :to="$page.previous.path">
        <small class="font-bold">&xlarr;</small>
        <span class="ml-ch-base">
          <small class="block uppercase tracking-wider font-bold text-neutral">Previous</small>
          <span class="text-md">{{ $page.previous.title }}</span>
        </span>
      </g-link>
      <g-link class="flex focus:no-underline hover:no-underline my-lg" v-if="$page.next" :to="$page.next.path">
        <small class="font-bold">&xrarr;</small>
        <span class="ml-ch-base">
          <small class="block uppercase tracking-wider font-bold text-neutral">Next</small>
          <span class="text-md">{{ $page.next.title }}</span>
        </span>
      </g-link>
      <div class="flex justify-end">
        <a class="leading-none tappable focus:bg-ruby hover:bg-ruby" target="_blank" rel="noopener noreferrer" title="Edit this page" :href="editUrl">
          <Sprite symbol="icon-edit-file" class="icon" />
        </a>
        <a class="leading-none tappable focus:bg-ruby hover:bg-ruby" v-if="$page.post.headings.length > 0" href="#table-of-contents" title="Table of Contents">
          <Sprite symbol="icon-table-of-content" class="icon" />
        </a>
        <a class="leading-none tappable focus:bg-ruby hover:bg-ruby" href="#app" title="Back to top">
          <Sprite symbol="icon-back-to-top" class="icon" />
        </a>
      </div>
    </template>
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
      const published = `Published <strong><time>${this.$page.post.date}</time></strong>`
      return !this.$page.post.hasOwnProperty('updated') ? published : (this.$page.post.updated !== this.$page.post.date ? `Updated <strong><time>${this.$page.post.updated}</time></strong>` : published); 
    },
    editUrl() {
      const editContext = appConfig.editConfig && appConfig.editConfig.Post ? appConfig.editConfig.Post : appConfig.prefs.editContext
      return `${editContext}/${this.$page.post.fileInfo.path}`
    },
    outdationMessage() {
      return this.$page.post.outdated !== 'undefined' && this.$page.post.outdated === 'true' ? 'This post is old. Some information may be inaccurate.' : null
    }
  }
}
</script>
