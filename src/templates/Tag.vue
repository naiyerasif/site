<template>
  <Layout>
    <div class="bg-background-quaternary">
      <div class="container-inner mx-auto textl-xl">
        <div class="w-full pb-10 pt-4 md:pt-12 md:pb-32 bg-background-pattern">
          <a class="hidden" id="backToTop"></a>
          <h1 class="text-3xl md:text-5xl leading-tight">Tag: <span class="font-bold">#{{ $page.tag.title }}</span></h1>
        </div>
      </div>
    </div>
    <div class="container-inner mx-auto my-16">
      <div v-for="post in $page.tag.belongsTo.edges" :key="post.node.id" class="post mb-16">
        <div class="text-copy-quaternary text-xs">{{ post.node.date }} &middot; {{ post.node.timeToRead }} min read</div>
        <g-link :to="post.node.path" class="text-copy-primary">
          <h2 class="text-3xl font-semibold mb-2">{{ post.node.title }} <svg class="inline mb-1" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></h2>
          <div class="text-copy-quaternary font-normal mb-4">{{ post.node.summary }}</div>
        </g-link>
        
        <div class="text-copy-secondary text-gray-700 mb-8">
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
