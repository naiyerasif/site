<template>
  <Layout>
    <template #hero>
      <div class="container flex flex-wrap items-center">
        <div class="avatar mr-far-base md:mb-far-base">
          <g-image class="rounded-full border-1 border-solid border-spinel" :alt="firstName" :src="$page.profile.avatar" />
        </div>
        <div class="introduction">
          <h1 class="leading-tight text-xxl">Hi, I'm <span class="text-deter">{{ firstName }}</span></h1>
          <div class="text-md text-neutral">a {{ $page.profile.role | lowerCase }} from {{ $page.profile.location }}</div>
        </div>
      </div>
    </template>
    <main class="container px-far-base">
      <article class="article max-sm" v-html="$page.profile.content" />
    </main>
    <template #sidekick>
      <div class="flex justify-end">
        <a class="leading-none" href="#app" title="Back to top">
          <Icon symbol="icon-back-to-top" class="icon" />
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
import Icon from '~/components/Icon'
import * as siteConfig from '@/data/site.config'

export default {
  metaInfo() {
    const title = this.$page.profile.name
    const description = 'About Naiyer Asif'
    
    return {
      title: title,
      meta: [
        { name: 'description', content: description },

        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: "og:url", content: `${siteConfig.url}${this.$page.profile.path}` },

        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:site', content: '@Microflash' },
        { name: 'twitter:creator', content: '@Microflash' }
      ]
    }
  },
  components: {
    Icon
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
  @include size(calc(5rem + 5vw));
}
</style>
