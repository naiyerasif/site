<template>
  <Layout>
    <div class="container-inner mx-auto py-16">
      <div v-for="post in $page.posts.edges" :key="post.id" class="post mb-16">
        <div class="text-copy-quaternary text-xs">{{ post.node.date }} &middot; {{ post.node.timeToRead }} min read</div>
        <g-link :to="post.node.path" class="text-copy-primary">
          <h2 class="text-3xl font-normal mb-2">{{ post.node.title }} <svg class="inline mb-1" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></h2>
          <div class="text-copy-quaternary font-normal mb-4">{{ post.node.summary }}</div>
        </g-link>
        
        <div class="text-copy-secondary text-gray-700 mb-8">
          <g-link class="bg-background-tertiary text-copy-tertiary hover:text-copy-tertiary rounded-full px-2 py-1 mr-2 text-xs" v-for="tag in post.node.tags" :key="tag.id" :to="tag.path">
            <span>#</span>{{ tag.title }}
          </g-link>
        </div>
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
import Pagination from '../components/Pagination'

export default {
  metaInfo: {
    title: 'Home'
  },
  components: {
    Pagination
  }
}
</script>

