<template>
  <Layout>
    <div class="container hero">
      <h1>
        Hello, I'm <span id="top" class="is-primary">{{ firstName }}</span>, a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}
      </h1>
    </div>
    <div class="container article">
      <VueRemarkContent class="main" />
      <div class="article-actions">
        <a href="#top">
          <svg viewBox="0 0 24 24" class="icon icon-up"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg> Back to top
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
    path
  }
}
</page-query>

<script>
export default {
  metaInfo() {
    return {
      title: this.$page.profile.name
    }
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
