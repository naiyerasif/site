<template>
  <Layout>
    <template #hero>
      <Hero>
        <h1 class="title">
          <span class="gap-ch-sm hidden-sm">&mdash;</span>Reflections on <br class="hidden-sm" />design and development <br class="hidden-sm" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
        </h1>
      </Hero>
    </template>
    <main class="container has-content-my">
      <div class="has-content-mx">
        <div class="card is-clickable" @click="$router.push(mostRecent.node.path)">
          <div class="card-header has-separated">
            <strong>Most recent</strong>
            <time v-html="mostRecent.node.date" />
          </div>
          <div class="card-title">
            <g-link class="is-header" :to="mostRecent.node.path">{{ mostRecent.node.title }}</g-link>
          </div>
          <div class="card-footer" v-html="excerpt(mostRecent.node.excerpt)" />
        </div>

        <h4 class="mt-3 mb-1 is-middle"><Sprite symbol="icon-popular" class="icon-rg gap-ch-sm" /> Popular this month</h4>
        <div class="grid" style="--grid-column-width: var(--grid-col-xs)">
          <div class="card is-clickable" v-for="popular in $page.popularPosts.edges" :key="popular.id" @click="$router.push(popular.node.path)">
            <div class="card-content is-regular">
              <g-link :to="popular.node.path">{{ popular.node.title }}</g-link>
            </div>
          </div>
        </div>

        <h4 class="mt-3 mb-1 is-middle"><Sprite symbol="icon-recent" class="icon-rg gap-ch-sm" /> Other recent posts</h4>
        <div class="grid" style="--grid-column-width: var(--grid-col-xs)">
          <div class="card is-clickable" v-for="latest in recent" :key="latest.id" @click="$router.push(latest.node.path)">
            <div class="card-header">
              <time v-html="latest.node.date" />
            </div>
            <div class="card-content is-regular">
              <g-link :to="latest.node.path">{{ latest.node.title }}</g-link>
            </div>
          </div>
        </div>
        <div class="is-right">
          <g-link class="label mt-2 is-round is-undecorated is-right" to="/blog/2/">Browse more &rarr;</g-link>
        </div>
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
import Hero from '~/components/partials/Hero'
import Sprite from '~/components/Sprite'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Hero,
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
