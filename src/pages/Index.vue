<template>
  <Layout>
    <section class="hero">
      <h1 class="title">
        <span class="gap-end-sm hidden-sm">&mdash;</span>Reflections on <br class="hidden-sm" />design and development <br class="hidden-sm" />by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
      </h1>
    </section>
    <main class="content">
      <Card v-for="post in $page.posts.edges" :key="post.id" :title="post.node.title" :description="post.node.excerpt | clip" :src="post.node.path">
        <time v-html="post.node.date" />
        <span>{{ post.node.timeToRead }} min read</span>
        <Sprite :symbol="label" class="label" v-for="label in post.node.labels" :key="label" />
      </Card>
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
        labels
        path
      }
    }
  }
}
</page-query>

<script>
import Card from '~/components/Card'
import Pagination from '~/components/Pagination'
import Sprite from '~/components/Sprite'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Card,
    Pagination,
    Sprite
  }
}
</script>
