<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="leading-tight text-xxl">
          <span class="sm:hidden sm:invisible mr-ch-sm">&mdash;</span>Reflections on <br class="sm:hidden sm:invisible" />design and development <br class="sm:hidden sm:invisible" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
        </h1>
      </div>
    </template>
    <main class="container px-far-base">
      <div class="group cursor-pointer" @click="$router.push(mostRecent.node.path)">
        <div class="text-sm text-neutral separated">
          <time v-html="mostRecent.node.date" />
        </div>
        <g-link class="block font-bold text-md group-hover:text-deter group-hover:underline my-xs" :to="mostRecent.node.path">{{ mostRecent.node.title }}</g-link>
        <div class="text-sm" v-html="excerpt(mostRecent.node.excerpt)" />
      </div>
      <hr class="my-far-base" />
      <div class="group cursor-pointer mb-md" v-for="latest in recent" :key="latest.id" @click="$router.push(latest.node.path)">
        <div class="text-sm text-neutral separated">
          <time v-html="latest.node.date" />
        </div>
        <g-link class="block font-bold group-hover:text-deter group-hover:underline" :to="latest.node.path">{{ latest.node.title }}</g-link>
      </div>
      <div class="flex items-center justify-end mt-base">
        <g-link class="tappable text-xs uppercase tracking-wider font-bold bg-quartz focus:bg-ruby hover:bg-ruby focus:no-underline hover:no-underline mt-far-sm" to="/posts/2/">Browse more &xrarr;</g-link>
      </div>
    </main>
  </Layout>
</template>

<page-query>
query {
  latestPosts: allBlog(sortBy: "date", order: DESC, limit: 10) {
    edges {
      node {
        id
        title
        path
        date (format: "MMM D, Y")
        excerpt
      }
    }
  }
}
</page-query>

<script>
import Tag from '~/components/Tag'
import * as siteConfig from '@/data/site.config'

export default {
  metaInfo() {
    const title = 'Home'
    const description = 'Reflections on design and development by Naiyer Asif'
    
    return {
      title: title,
      meta: [
        { name: 'description', content: description },

        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: "og:url", content: `${siteConfig.url}` },

        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:site', content: '@Microflash' },
        { name: 'twitter:creator', content: '@Microflash' }
      ]
    }
  },
  components: {
    Tag
  },
  computed: {
    mostRecent() {
      return this.$page.latestPosts.edges[0]
    },
    recent() {
      return this.$page.latestPosts.edges.slice(1)
    }
  },
  methods: {
    excerpt(text) {
      return text.endsWith('.') ? text + '..' : text + '...'
    }
  }
}
</script>
