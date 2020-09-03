<template>
  <Layout>
    <Hero flex>
      <div class="hero-media">
        <g-image :alt="firstName" :src="$page.profile.avatar" />
      </div>
      <div class="hero-content">
        <h1 class="title">Hello, I'm <span class="is-primary">{{ firstName }}</span></h1>
        <div class="subtitle">a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}</div>
      </div>
    </Hero>
    <ScrollIndicator />
    <main class="content">
      <article class="article" v-html="$page.profile.content" />
    </main>
    <div class="sidekick">
      <div class="sidekick-wrapper">
        <div class="sidekick-actions">
          <a href="#app" title="Back to top">
            <Sprite symbol="icon-up" class="icon-rg" />
          </a>
        </div>
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
import Hero from '~/components/partials/Hero'
import Sprite from '~/components/Sprite'
import ScrollIndicator from '~/components/ScrollIndicator'

export default {
  metaInfo() {
    return {
      title: this.$page.profile.name
    }
  },
  components: {
    Hero,
    Sprite,
    ScrollIndicator
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
