<template>
  <Layout>
    <div class="hero">
      <div class="metadata-content">
        <h1 class="title">Notes</h1>
        <div class="subtitle"><small><abbr title="Today I Learned">#TIL</abbr></small> updates, dev tidbits, interesting resources and impulsively random stuff</div>
      </div>
    </div>
    <main class="content">
      <div class="article" v-for="note in $page.notes.edges" :key="note.id">
        <div class="note-header">
          <time v-html="note.node.date" />
          <section class="topics">
            <span class="gap-ch" v-for="topic in note.node.topics" :key="topic">#{{ topic }}</span>
          </section>
          <hr>
        </div>
        <p class="subtitle">{{ note.node.title }}</p>
        <div class="note-content" v-html="note.node.content" />
      </div>
    </main>
    <Pagination :input="$page.notes.pageInfo" />
  </Layout>
</template>

<page-query>
query Notes ($page: Int) {
  notes: allNote (sortBy: "date", order: DESC, perPage: 10, page: $page) @paginate {
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
    title: 'Notes'
  },
  components: {
    Pagination
  }
}
</script>
