<template>
  <Layout>
    <Hero>#{{ $page.tag.title }}</Hero>
    <div class="container posts">
      <div class="grid-2">
        <div class="column" v-for="post in $page.tag.belongsTo.edges" :key="post.node.id">
          <PostCard :item="post.node" />
        </div>
      </div>
      <Pagination class="post-pagination" v-if="$page.tag.belongsTo.pageInfo.totalPages > 1" :base="`/tag/${$page.tag.title}`" :info="$page.tag.belongsTo.pageInfo" />
    </div>
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
            summary
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
import Hero from '~/components/Hero'
import Pagination from '~/components/Pagination'
import PostCard from '~/components/PostCard'

export default {
  metaInfo() {
    return {
      title: '#' + this.$page.tag.title
    }
  },
  components: {
    Hero,
    Pagination,
    PostCard
  }
}
</script>
