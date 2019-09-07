<template>
  <Layout>
    <div class="bg-background-quaternary">
      <div class="container mx-auto textl-xl">
        <div class="w-full pb-10 pt-4 md:pt-12 md:pb-32 bg-background-pattern">
          <h1 class="text-3xl md:text-5xl leading-tight">
            <span class="font-semibold" v-if="category">{{ header }}</span>
            <span v-else>Tag: <span class="font-semibold">#{{ $page.tag.title }}</span></span>
          </h1>
        </div>
      </div>
    </div>
    <div class="container mx-auto my-16">
      <div v-for="post in $page.tag.belongsTo.edges" :key="post.node.id" class="post mb-16">
        <postcard :item="post.node" />
      </div>

      <pagination
        v-if="$page.tag.belongsTo.pageInfo.totalPages > 1"
        :base="`/tag/${$page.tag.title}`"
        :info="$page.tag.belongsTo.pageInfo"
      />

    </div>
  </Layout>
</template>

<page-query>
query Tag ($id: String!, $page: Int) {
  tag: tag (id: $id) {
    title
    belongsTo (sortBy: "updated", order: DESC, page: $page, perPage: 7) @paginate {
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
    	      date (format: "MMMM D, YYYY")
    	      updated (format: "MMMM D, YYYY")
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
      title: this.category ? this.header : 'Tag: ' + this.$page.tag.title
    }
  },
  computed: {
    header() {
      const first = this.$page.tag.title[0] || this.$page.tag.title.charAt(0);
      return first.toUpperCase() + this.$page.tag.title.substring(1) + 's';
    },
    category() {
      return this.$page.tag.title === 'guide'
    }
  },
  components: {
    Pagination,
    Postcard
  }
}
</script>
