<template>
  <Layout>
    <template #hero>
      <div class="container flex flex-wrap flex-col items-start">
        <div class="flex items-center flex-wrap text-sm separated mb-base">
          <div v-html="displayDate" />
          <div>Reading time <span class="font-bold">&sim;{{ $page.post.timeToRead }} mins</span></div>
        </div>
        <h1 class="leading-tight text-xxl my-far-base">{{ $page.post.title }}</h1>
        <div class="flex flex-wrap items-center text-xs tracking-wide uppercase font-bold separated">
          <strong>{{ $page.post.category }}</strong>
          <tag v-for="(tag, idx) in $page.post.tags" :key="idx" :keyword="tag"/>
        </div>
      </div>
    </template>
    <ScrollIndicator />
    <main class="container px-far-base">
      <div v-if="expiryMessage" class="admonition admonition-warning alert alert--danger">
        <div class="admonition-heading"><h5><span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"></path></svg></span>warning</h5></div>
        <div class="admonition-content">
          <p>{{ expiryMessage }}</p>
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
        <a class="leading-none mr-ch-base" target="_blank" rel="noopener noreferrer" title="Edit this page" :href="editUrl">
          <Icon symbol="icon-edit-file" class="icon" />
        </a>
        <a class="leading-none mr-ch-base" v-if="$page.post.headings.length > 0" href="#table-of-contents" title="Table of Contents">
          <Icon symbol="icon-table-of-content" class="icon" />
        </a>
        <a class="leading-none" href="#app" title="Back to top">
          <Icon symbol="icon-back-to-top" class="icon" />
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
    tags
    content
    category
    path
    timeToRead
    expired
    excerpt
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
import Tag from '~/components/Tag'
import Icon from '~/components/Icon'
import ScrollIndicator from '~/components/ScrollIndicator'
import dayjs from 'dayjs'
import * as siteConfig from '@/data/site.config'

export default {
  metaInfo() {
    const links = [{ rel: 'source', href: this.editUrl }]
    
    if (this.$page.previous) {
      links.push({ rel: 'prev', 'aria-label': 'Previous post', href: `${siteConfig.url}${this.$page.previous.path}` })
    }

    if (this.$page.next) {
      links.push({ rel: 'next', 'aria-label': 'Next post', href: `${siteConfig.url}${this.$page.next.path}` })
    }

    const title = this.$page.post.title
    const description = this.$page.post.excerpt

    const metas = [
      { name: 'description', content: description },

      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: "og:url", content: `${siteConfig.url}${this.$page.post.path}` },
      { property: "article:published_time", content: dayjs(this.$page.post.date).format('YYYY-MM-DD') },

      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:site', content: '@Microflash' },
      { name: 'twitter:creator', content: '@Microflash' }
    ]

    if (this.$page.post.updated !== this.$page.post.date) {
      metas.push({ property: "article:modified_time", content: dayjs(this.$page.post.updated).format('YYYY-MM-DD') })
    }

    return {
      title: title,
      link: links,
      meta: metas
    }
  },
  components: {
    Toc,
    Tag,
    Icon,
    ScrollIndicator
  },
  computed: {
    displayDate() {
      const prefix = this.$page.post.updated !== this.$page.post.date ? 'Updated' : 'Published'
      return `${prefix} <time class="font-bold">${this.$page.post.updated}</time>`
    },
    editUrl() {
      return `${siteConfig.editContext}/${this.$page.post.fileInfo.path}`
    },
    expiryMessage() {
      return !this.$page.post.expired || this.$page.post.expired === 'never' ? null : this.$page.post.expired
    }
  }
}
</script>
