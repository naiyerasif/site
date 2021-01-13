<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="font-headings leading-tight text-lg">Blog</h1>
        <div class="text-md text-neutral">Guides, notes and opinion pieces</div>
      </div>
    </template>
    <main class="container px-far-base">
      <div class="group cursor-pointer max-sm mb-far-base" v-for="post in $page.posts.edges" :key="post.id" @click="$router.push(post.node.path)">
        <div class="text-sm text-neutral separated">
          <strong class="capitalize">{{ post.node.category }}</strong>
          <span>&sim;{{ post.node.timeToRead }} min</span>
          <time v-html="post.node.date" />
        </div>
        <g-link class="block font-bold group-hover:text-deter group-hover:underline text-md my-xs" :to="post.node.path">{{ post.node.title }}</g-link>
        <div class="text-sm" v-html="excerpt(post.node.excerpt)" />
      </div>
    </main>
    <template #sidekick>
      <Pagination class="mt-close-base" path="blog" :total="$page.posts.pageInfo.totalPages" :current="$page.posts.pageInfo.currentPage" />
    </template>
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
        timeToRead
        category
        topics
        excerpt
        path
      }
    }
  }
}
</page-query>

<script>
import Pagination from '~/components/Pagination'

export default {
  metaInfo: {
    title: 'Blog'
  },
  components: {
    Pagination
  },
  methods: {
    excerpt(text) {
      return text.endsWith('.') ? text + '..' : text + '...'
    }
  }
}
</script>
