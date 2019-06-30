<template>
  <Layout>
    <div class="container-inner mx-auto my-16">
      <h2 class="text-4xl font-bold mb-6 pb-6 border-b">Tag: #{{ $page.tag.title }}</h2>

      <div v-for="post in $page.tag.belongsTo.edges" :key="post.node.id" class="post border-gray-400 border-b mb-5">
        <g-link :to="post.node.path" class="text-copy-primary">
          <h2 class="text-3xl mb-2">{{ post.node.title }}</h2>
          <div class="text-copy-quaternary font-normal mb-4">{{ post.node.summary }}</div>
        </g-link>
        
        <div class="text-copy-secondary text-gray-700 mb-8">
          <span class="bg-background-quaternary text-copy-quaternary rounded-full px-3 py-1 mr-2 text-xs">{{ post.node.date }} &middot; {{ post.node.timeToRead }} min read</span>
          <g-link class="bg-background-tertiary text-copy-tertiary hover:text-copy-tertiary rounded-full px-2 py-1 mr-2 text-xs" v-for="tag in post.node.tags" :key="tag.id" :to="tag.path">
            <span>#</span>{{ tag.title }}
          </g-link>
        </div>
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
    belongsTo (page: $page, perPage: 7) @paginate {
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
            path
            summary
            tags {
              title
            }
          }
        }
      }
    }
  }
}
</page-query>

<script>
import Pagination from '../components/Pagination'

export default {
  metaInfo() {
    return {
      title: 'Tag: ' + this.$page.tag.title
    }
  },
  components: {
    Pagination
  }
}
</script>
