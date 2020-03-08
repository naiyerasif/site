<template>
  <Layout>
    <div class="container hero">
      <section class="profile canvas">
        <div class="metadata">
          <div class="metadata-item">
            <div class="metadata-author-avatar">
              <g-image :alt="firstName" :src="$page.profile.avatar" />
            </div>
          </div>
        </div>
        <div class="intro">
          <h1 class="title">
            Hello, I'm <span class="is-primary">{{ firstName }}</span> 
          </h1>
          <div class="subtitle">
            a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}
          </div>
        </div>
      </section>
    </div>
    <div class="container article">
      <VueRemarkContent class="main" />
    </div>
    <div class="container sidekick">
      <div class="article-actions">
        <a href="#app">
          <IconUp class="icon" /> Back to top
        </a>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Profile ($id: ID!) {
  profile: profile (id: $id) {
    name
    role
    location
    avatar
    path
  }
}
</page-query>

<script>
import IconUp from '@/images/icon-up.svg'

export default {
  metaInfo() {
    return {
      title: this.$page.profile.name
    }
  },
  components: {
    IconUp
  },
  computed: {
    firstName() {
      return this.$page.profile.name.substr(0, this.$page.profile.name.indexOf(' '))
    }
  },
  filters: {
    lowerCase(value) {
      return value.toLowerCase()
    }
  }
}
</script>
