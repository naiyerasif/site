<template>
  <Layout>
    <div class="container hero">
      <h1>
        Hello, I am <span id="about-me" class="is-highlighted">{{ firstName }}</span>
        <br>a {{ $page.profile.role | lowerCase }}
        <br>from {{ $page.profile.location }}
      </h1>
    </div>
    <div class="container">
      <VueRemarkContent />
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
