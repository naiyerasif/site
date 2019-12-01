<template>
  <Layout>
    <Hero>
      &mdash; Reflections on<br/>
      design and development<br/>
      by <g-link to="/about/naiyer/">Naiyer Asif</g-link>
    </Hero>
    <div class="container posts">
      <div class="grid-2">
        <div class="column" v-for="post in $page.posts.edges" :key="post.id">
          <Card :item="post.node"/>
        </div>
      </div>
      <Pagination class="post-pagination" v-if="$page.posts.pageInfo.totalPages > 1" :info="$page.posts.pageInfo"/>
    </div>
  </Layout>
</template>

<page-query>
query Posts ($page: Int) {
  posts: allPost (sortBy: "date", order: DESC, perPage: 10, page: $page) @paginate {
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
        summary
        timeToRead
        path
        tags {
          id
          title
          path
        }
      }
    }
  }
}
</page-query>

<script>
import Hero from '~/components/Hero'
import Pagination from '~/components/Pagination'
import Card from '~/components/Card'

export default {
  metaInfo() {
    return {
      title: 'Home'
    }
  },
  components: {
    Hero,
    Pagination,
    Card
  }
}
</script>
