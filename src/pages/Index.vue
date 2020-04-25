<template>
  <Layout>
    <div class="hero-media">
      <div class="hero-image">
        <Poster class="metadata-media" />
      </div>
    </div>
    <div class="hero-content">
      <h1 class="title">
        <span class="is-separated is-hidden-on-phone">&mdash;</span>Reflections on design and development by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>
      </h1>
    </div>
    <Posts :posts="$page.posts.edges" />
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
import Posts from '~/components/Posts'
import Pagination from '~/components/Pagination'
import Poster from '@/images/index.svg'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Posts,
    Pagination,
    Poster
  }
}
</script>
