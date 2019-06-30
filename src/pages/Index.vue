<template>
  <Layout>
    <div class="container-inner mx-auto py-16">
      <div v-for="post in $page.posts.edges" :key="post.id" class="post border-color-primary border-b mb-4">
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

