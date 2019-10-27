<template>
  <Layout>
    <section>
      <div class="container mx-auto mb-3 sm:mb-8">
        <div class="w-full">
          <h1 class="text-3xl md:text-5xl leading-tight">
            <span><span class="font-semibold">#{{ $page.tag.title }}</span></span>
          </h1>
        </div>
      </div>
    </section>
    <div class="container mx-auto">
      <div class="w-full sm:w-5/6">
        <div class="grid row flex flex-wrap -mx-6">
          <div v-for="post in $page.tag.belongsTo.edges" :key="post.node.id" class="column flex w-full sm:px-6 py-2 sm:py-6 sm:w-1/2">
            <postcard :item="post.node" />
          </div>
        </div>
        <pagination class="mt-4 mb-0 sm:my-4 sm:w-2/5"
          v-if="$page.tag.belongsTo.pageInfo.totalPages > 1"
          :base="`/tag/${$page.tag.title}`"
          :info="$page.tag.belongsTo.pageInfo"
        />
      </div>
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
import Pagination from '~/components/Pagination'
import Postcard from '~/components/Postcard'

export default {
  metaInfo() {
    return {
      title: '#' + this.$page.tag.title
    }
  },
  components: {
    Pagination,
    Postcard
  }
}
</script>
