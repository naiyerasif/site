<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="leading-tight text-lg">
          <span class="sm:hidden sm:invisible mr-ch-sm">&mdash;</span>Reflections on <br class="sm:hidden sm:invisible" />design and development <br class="sm:hidden sm:invisible" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
        </h1>
      </div>
    </template>
    <main class="container px-far-base">
      <div class="separated">
        <strong><Sprite symbol="icon-new" class="icon text-urge mr-base" />Latest</strong>
        <time class="text-sm text-neutral" v-html="mostRecent.node.date" />
      </div>
      <div class="group cursor-pointer max-sm" style="margin-left:3rem" @click="$router.push(mostRecent.node.path)">
        <g-link class="block font-bold text-md group-hover:text-deter group-hover:underline my-xs" :to="mostRecent.node.path">{{ mostRecent.node.title }}</g-link>
        <div class="text-sm" v-html="excerpt(mostRecent.node.excerpt)" />
      </div>
      <hr class="my-far-base" />
      <p class="font-bold"><Sprite symbol="icon-popular" class="icon text-deter mr-base" />Popular topics</p>
      <div class="flex flex-wrap items-center text-xs tracking-wide uppercase font-bold" style="margin-left:3rem">
        <tag class="mb-base mr-base" v-for="(topic, index) in popularTopics" :key="index" :keyword="topic"/>
      </div>
      <hr class="my-far-base" />
      <p class="font-bold"><Sprite symbol="icon-recent" class="icon text-inform mr-base" />Recent posts</p>
      <div class="group cursor-pointer mb-md" style="margin-left:3rem" v-for="latest in recent" :key="latest.id" @click="$router.push(latest.node.path)">
        <div class="text-sm text-neutral separated">
          <time v-html="latest.node.date" />
        </div>
        <g-link class="block font-bold group-hover:text-deter group-hover:underline" :to="latest.node.path">{{ latest.node.title }}</g-link>
      </div>
      <div class="flex items-center justify-end mt-base">
        <g-link class="tappable text-xs uppercase tracking-wider font-bold bg-quartz focus:bg-ruby hover:bg-ruby focus:no-underline hover:no-underline mt-far-sm" to="/blog/2/">Browse more &xrarr;</g-link>
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
import Sprite from '~/components/Sprite'
import Tag from '~/components/Tag'
import topics from '@/static/topics.json'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Sprite,
    Tag
  },
  computed: {
    popularTopics() {
      return topics.sort()
    },
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
