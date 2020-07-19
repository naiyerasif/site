<template>
  <Layout>
    <div class="hero">
      <h1 class="title">
        <span class="gap-ch-sm hidden-sm">&mdash;</span>Reflections on <br class="hidden-sm" />design and development <br class="hidden-sm" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
      </h1>
    </div>
    <main class="content">
      <div class="card" v-for="post in $page.posts.edges" :key="post.id" @click="$router.push(post.node.path)">
        <div class="card-metadata">
          <time v-html="post.node.date" />
          <span>&sim;{{ post.node.timeToRead }} min read</span>
          <section class="topics">
            <span class="gap-ch" v-for="topic in post.node.topics" :key="topic">#{{ topic }}</span>
          </section>
        </div>
        <div class="card-content">
          <g-link class="card-title" :to="post.node.path">{{ post.node.title }}</g-link>
          <div class="card-description">{{ post.node.excerpt | clip }}</div>
        </div>
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
        excerpt
        timeToRead
        topics
        path
      }
    }
  }
}
</page-query>

<script>
import Pagination from '~/components/Pagination'
import Sprite from '~/components/Sprite'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Pagination,
    Sprite
  }
}
</script>
