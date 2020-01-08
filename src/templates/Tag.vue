<template>
  <Layout>
    <div class="container hero">
      <h1>
        #{{ $page.tag.title }}
      </h1>
    </div>
    <Posts :posts="$page.tag.belongsTo.edges" />
    <Pagination v-if="$page.tag.belongsTo.pageInfo.totalPages > 1" :path="`/tag/${$page.tag.title}`" :input="$page.tag.belongsTo.pageInfo" />
  </Layout>
</template>

<page-query>
query Tag ($id: ID!, $page: Int) {
  tag: tag (id: $id) {
    title
    belongsTo (sortBy: "updated", order: DESC, page: $page, perPage: 10) @paginate {
      totalCount
      pageInfo {
        totalPages
        currentPage
      }
      edges {
        node {
          ...on Post {
            title
            timeToRead
    	      date (format: "MMM D, Y")
    	      updated (format: "MMM D, Y")
            path
            blurb
            tags {
              title,
              path
            }
          }
        }
      }
    }
  }
}
</page-query>

<script>
import Posts from '~/components/Posts'
import Pagination from '~/components/Pagination'

export default {
  metaInfo() {
    return {
      title: '#' + this.$page.tag.title
    }
  },
  components: {
    Posts,
    Pagination
  }
}
</script>
