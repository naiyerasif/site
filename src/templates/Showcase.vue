<template>
  <Layout>
    <div class="hero-media">
      <div class="hero-image">//TODO</div>
    </div>
    <div class="hero-content">
      <h1 class="title">{{ $page.showcase.title }}</h1>
      <div class="subtitle">{{ $page.showcase.description }}</div>
    </div>
    <div class="container article">
      <div class="content">
        <Contents v-if="$page.showcase.toc" :headers="$page.showcase.headings" :depth="3" />
        <VueRemarkContent class="main" />
      </div>
    </div>
    <div class="container sidekick">
      <div class="article-actions">
        <a v-if="$page.showcase.enableEdit" target="_blank" rel="noopener noreferrer" :href="editUrl">
          <Sprite symbol="icon-edit" class="icon" /> Edit this page
        </a>
        <a v-if="$page.showcase.toc" href="#table-of-contents">
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
query Showcase ($id: ID!) {
  showcase: showcase (id: $id) {
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

<static-query>
query {
  metadata {
    editContext
  }
}
</static-query>

<script>
import Contents from '~/components/Contents'
import Sprite from '~/components/Sprite'
import * as appConfig from '../../app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.showcase.title
    }
  },
  components: {
    Contents,
    Sprite
  },
  computed: {
    editUrl() {
      const editContext = (appConfig.editConfig && appConfig.editConfig.Showcase ? appConfig.editConfig.Showcase : this.$static.metadata.editContext) + '/content/showcase'
      return `${editContext}/${this.$page.showcase.fileInfo.path}`
    }
  }
}
</script>
