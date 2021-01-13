<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="font-headings leading-tight text-lg">
          <span class="sm:hidden sm:invisible mr-ch-sm">&mdash;</span>Reflections on <br class="sm:hidden sm:invisible" />design and development <br class="sm:hidden sm:invisible" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
        </h1>
      </div>
    </template>
    <main class="container px-far-base">
      <div class="separated">
        <strong><Sprite symbol="icon-new" class="icon mr-base" style="fill:var(--semantic-urge);stroke:var(--semantic-urge)" />Latest</strong>
        <time class="text-sm text-neutral" v-html="mostRecent.node.date" />
      </div>
      <div class="group cursor-pointer max-sm" style="margin-left:2.5rem" @click="$router.push(mostRecent.node.path)">
        <g-link class="block font-bold text-md group-hover:text-deter group-hover:underline my-xs" :to="mostRecent.node.path">{{ mostRecent.node.title }}</g-link>
        <div class="text-sm" v-html="excerpt(mostRecent.node.excerpt)" />
      </div>
      <hr class="my-far-base" />
      <p class="font-bold"><Sprite symbol="icon-popular" class="icon mr-base" style="fill:var(--semantic-deter);stroke:var(--semantic-deter)" />Popular this month</p>
      <div class="group cursor-pointer" style="margin-left:2.5rem" v-for="popular in $page.popularPosts.edges" :key="popular.id" @click="$router.push(popular.node.path)">
        <g-link class="block my-sm group-hover:text-deter group-hover:underline" :to="popular.node.path">{{ popular.node.title }}</g-link>
      </div>
      <hr class="my-far-base" />
      <p class="font-bold"><Sprite symbol="icon-recent" class="icon mr-base" style="fill:var(--semantic-inform);stroke:var(--semantic-inform)" />Recent posts</p>
      <div class="group cursor-pointer mb-md" style="margin-left:2.5rem" v-for="latest in recent" :key="latest.id" @click="$router.push(latest.node.path)">
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
  popularPosts: allPopularBlog(sortBy: "views", order: DESC) {
    edges {
      node {
        id
        title
        path
      }
    }
  }
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

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Sprite
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
