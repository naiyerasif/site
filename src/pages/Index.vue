<template>
  <Layout>
    <div class="container hero">
      <section class="canvas">
        <h1 class="title">
          <span class="is-separated is-hidden-on-phone">&mdash;</span>Reflections on design and development by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
        </h1>
      </section>
    </div>
    <Posts :posts="$page.posts.edges" />
    <Pagination :input="$page.posts.pageInfo" />
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
        excerpt
        timeToRead
        path
      }
    }
  }
}
</page-query>

<script>
import Posts from '~/components/Posts'
import Pagination from '~/components/Pagination'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Posts,
    Pagination
  }
}
</script>
