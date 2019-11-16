<template>
  <Layout>
    <div class="font-sans">
      <div class="container mx-auto mb-3 sm:mb-12">
        <div class="w-full sm:w-3/4">
          <div class="text-2xl md:text-5xl font-semibold leading-tight">
            &mdash; A collection<br/>
            of thoughts and processes<br/>
            on development and design<br/>
            by <g-link class="font-semibold" to="/about/naiyer/">Naiyer Asif</g-link>
          </div>
        </div>
      </div>
    </div>
    <div class="container mx-auto">
      <div class="w-full sm:w-6/7">
        <div class="grid row flex flex-wrap -mx-6">
          <div v-for="post in $page.posts.edges" :key="post.id" class="column flex w-full sm:px-6 py-2 sm:py-6 sm:w-1/2">
            <postcard :item="post.node" />
          </div>
        </div>
        <pagination class="mt-4 mb-0 sm:my-4 sm:w-3/7"
          v-if="$page.posts.pageInfo.totalPages > 1"
          :info="$page.posts.pageInfo"
        />
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Posts ($page: Int) {
  posts: allPost (sortBy: "date", order: DESC, perPage: 10, page: $page) @paginate {
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

