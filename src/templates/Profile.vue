<template>
  <Layout>
    <div class="hero">
      <div class="metadata">
        <div class="metadata-media">
          <g-image :alt="firstName" :src="$page.profile.avatar" />
        </div>
        <div class="metadata-content">
          <h1 class="title">Hello, I'm <span class="is-primary">{{ firstName }}</span></h1>
          <div class="subtitle">a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}</div>
        </div>
      </div>
    </div>
    <main class="content">
      <article v-html="$page.profile.content" />
    </main>
    <div class="sidekick">
      <div class="sidekick-actions">
        <a href="#app" title="Back to top">
          <Sprite symbol="icon-up" class="icon-rg" />
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
    content
    path
  }
}
</page-query>

<script>
import Sprite from '~/components/Sprite'

export default {
  metaInfo() {
    return {
      title: this.$page.profile.name
    }
  },
  components: {
    Sprite
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
