<template>
  <Layout>
    <div class="container mx-auto pt-16">
      <div v-for="post in $page.posts.edges" :key="post.id" class="post mb-16">
        <postcard :item="post.node" />
      </div>

      <pagination
        v-if="$page.posts.pageInfo.totalPages > 1"
        :info="$page.posts.pageInfo"
      />
    </div>
  </Layout>
</template>

<page-query>
query Posts ($page: Int) {
  posts: allPost (sortBy: "date", order: DESC, perPage: 7, page: $page) @paginate {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        date (format: "MMMM D, Y")
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
import Pagination from '~/components/Pagination'
import Postcard from '~/components/Postcard'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Pagination,
    Postcard
  }
}
</script>

