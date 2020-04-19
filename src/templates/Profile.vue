<template>
  <Layout>
    <div class="hero-media">
      <div class="hero-image">
        <g-image :alt="firstName" class="metadata-media" :src="$page.profile.avatar" />
      </div>
    </div>
    <div class="hero-content">
      <h1 class="title">
        Hello, I'm <span class="is-primary">{{ firstName }}</span> 
      </h1>
      <div class="subtitle">
        a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}
      </div>
    </div>
    <VueRemarkContent class="content" />
    <div class="sidekick">
      <div class="sidekick-actions">
        <a href="#app">
          <Sprite symbol="icon-up" class="icon" /> Back to top
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
