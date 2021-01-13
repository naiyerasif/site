<template>
  <Layout>
    <template #hero>
      <div class="container flex flex-wrap">
        <div class="avatar mr-far-base md:mb-far-base">
          <g-image class="rounded-full border-1 border-solid border-spinel" :alt="firstName" :src="$page.profile.avatar" />
        </div>
        <div class="introduction">
          <h1 class="font-headings leading-tight text-lg">Hi, I'm <span class="text-deter">{{ firstName }}</span></h1>
          <div class="text-md text-neutral">a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}</div>
        </div>
      </div>
    </template>
    <ScrollIndicator />
    <main class="container px-far-base">
      <article class="article max-sm" v-html="$page.profile.content" />
    </main>
    <template #sidekick>
      <div class="flex justify-end">
        <a class="leading-none tappable focus:bg-ruby hover:bg-ruby" href="#app" title="Back to top">
          <Sprite symbol="icon-back-to-top" class="icon" />
        </a>
      </div>
    </template>
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
import ScrollIndicator from '~/components/ScrollIndicator'

export default {
  metaInfo() {
    return {
      title: this.$page.profile.name
    }
  },
  components: {
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

<style lang="scss" scoped>
@use '~/assets/styles/mixins/size' as *;

.avatar img {
  @include size(auto, calc(5rem + 5vw));
}
</style>
