<template>
  <Layout>
    <template #hero>
      <Hero>
        <h1 class="title">Blog</h1>
        <div class="subtitle">Guides, notes and opinion pieces</div>
      </Hero>
    </template>
    <main class="posts">
      <div class="post-item" v-for="post in $page.posts.edges" :key="post.id" @click="$router.push(post.node.path)">
        <div class="post-header">
          <time v-html="post.node.date" />
          <span>&sim;{{ post.node.timeToRead }} min read</span>
          <section class="topics">
            <span class="gap-ch"><strong class="gap-ch">{{ post.node.category }}</strong>on</span>
            <span class="gap-ch" v-for="topic in post.node.topics" :key="topic">{{ topic }}</span>
          </section>
        </div>
        <div class="post-title">
          <g-link :to="post.node.path">{{ post.node.title }}</g-link>
        </div>
        <div class="post-excerpt" v-html="excerpt(post.node.excerpt)" />
      </div>
    </main>
    <template #sidekick>
      <Pagination path="blog" :input="$page.posts.pageInfo" />
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
import Sprite from '~/components/Sprite'

export default {
  metaInfo: {
    title: 'Blog'
  },
  components: {
    Hero,
    Pagination,
    Sprite
  },
  methods: {
    excerpt(text) {
      return text.endsWith('.') ? text + '..' : text + '...'
    }
  }
}
</script>
