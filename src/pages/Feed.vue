<template>
  <Layout>
    <section class="hero is-column">
      <h1 class="title">Feed</h1>
      <div class="subtitle"><small><abbr title="Today I Learned">#TIL</abbr></small> updates, dev tidbits, interesting resources and impulsively random stuff</div>
    </section>
    <main class="content">
      <div class="feed-item" v-for="feed in $page.feeds.edges" :key="feed.id">
        <div class="feed-item-header">
          <span class="feed-item-topic" v-for="topic in feed.node.topics" :key="topic.id">#{{ topic }}</span>
          <span class="feed-item-title">{{ feed.node.title }}</span>
          <time class="feed-item-timestamp" v-html="feed.node.date" />
        </div>
        <div class="feed-item-content" v-html="feed.node.content" />
      </div>
    </main>
    <Pagination :input="$page.feeds.pageInfo" />
  </Layout>
</template>

<page-query>
query Feeds ($page: Int) {
  feeds: allFeed (sortBy: "date", order: DESC, perPage: 10, page: $page) @paginate {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        date (format: "MMM D, Y HH:mm")
        content
        topics
      }
    }
  }
}
</page-query>

<script>
import Pagination from '~/components/Pagination'

export default {
  metaInfo: {
    title: 'Feed'
  },
  components: {
    Pagination
  }
}
</script>
