<template>
  <Layout>
    <template #hero>
      <Hero>
        <h1 class="title">Blog</h1>
        <div class="subtitle">Guides, notes and opinion pieces</div>
      </Hero>
    </template>
    <main class="container has-content-my">
      <div class="has-content-mx">
        <div class="grid" style="--grid-column-width: 18rem">
          <div class="card is-clickable" v-for="post in $page.posts.edges" :key="post.id" @click="$router.push(post.node.path)">
            <div class="card-header has-separated">
              <time v-html="post.node.date" />
              <span>&sim;{{ post.node.timeToRead }} min read</span>
              <strong class="captialize">{{ post.node.category }}</strong>
            </div>
            <div class="card-title is-header">
              <g-link :to="post.node.path">{{ post.node.title }}</g-link>
            </div>
            <div class="card-footer" v-html="excerpt(post.node.excerpt)" />
          </div>
        </div>
      </div>
    </main>
    <template #sidekick>
      <Pagination path="blog" :total="$page.posts.pageInfo.totalPages" :current="$page.posts.pageInfo.currentPage" />
    </template>
  </Layout>
</template>

<page-query>
query Blogs ($page: Int) {
  posts: allBlog (sortBy: "date", order: DESC, perPage: 10, page: $page) @paginate {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        date (format: "MMM D, Y")
        timeToRead
        category
        topics
        excerpt
        path
      }
    }
  }
}
</page-query>

<script>
import Hero from '~/components/partials/Hero'
import Pagination from '~/components/Pagination'

export default {
  metaInfo: {
    title: 'Blog'
  },
  components: {
    Hero,
    Pagination
  },
  methods: {
    excerpt(text) {
      return text.endsWith('.') ? text + '..' : text + '...'
    }
  }
}
</script>
