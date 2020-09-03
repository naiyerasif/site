<template>
  <Layout>
    <Hero>
      <h1 class="title">
        <span class="gap-ch-sm hidden-sm">&mdash;</span>Reflections on <br class="hidden-sm" />design and development <br class="hidden-sm" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
      </h1>
    </Hero>
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
    <Pagination :input="$page.posts.pageInfo" />
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
    title: 'Home'
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
