<template>
  <Layout>
    <section class="hero is-column">
      <h1 class="title">{{ $page.collection.title }}</h1>
      <div class="subtitle">{{ $page.collection.description }}</div>
    </section>
    <main class="content">
      <Toc v-if="$page.collection.toc" :headers="$page.collection.headings" :depth="3" />
      <VueRemarkContent :class="$page.collection.toc ? 'article' : 'collection'" />
    </main>
    <div class="sidekick">
      <div class="sidekick-actions">
        <a v-if="$page.collection.enableEdit" target="_blank" rel="noopener noreferrer" :href="editUrl">
          <Sprite symbol="icon-edit" class="icon" /> Edit this page
        </a>
        <a v-if="$page.collection.toc" href="#table-of-contents" class="is-visible-on-phone">
          <Sprite symbol="icon-list" class="icon" /> Table of Contents
        </a>
        <a href="#app">
          <Sprite symbol="icon-up" class="icon" /> Back to top
        </a>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Collection ($id: ID!) {
  collection: collection (id: $id) {
    id
    title
    description
    toc
    enableEdit
    fileInfo {
      path
    }
    headings {
      depth
      value
      anchor
    }
  }
}
</page-query>

<script>
import Sprite from '~/components/Sprite'
import Toc from '~/components/Toc'
import * as appConfig from '@/app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.collection.title
    }
  },
  components: {
    Sprite,
    Toc
  },
  computed: {
    editUrl() {
      const editContext = (appConfig.editConfig && appConfig.editConfig.Collection ? appConfig.editConfig.Collection : appConfig.prefs.editContext) + '/content/collection'
      return `${editContext}/${this.$page.collection.fileInfo.path}`
    }
  }
}
</script>
