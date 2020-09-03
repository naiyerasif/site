<template>
  <Layout>
    <Hero>
      <h1 class="title">{{ $page.project.title }}</h1>
      <div class="subtitle">{{ $page.project.description }}</div>
    </Hero>
    <main class="content">
      <Toc v-if="$page.project.toc" :headers="$page.project.headings" :depth="3" />
      <div v-html="$page.project.content" class="article" />
    </main>
    <div class="sidekick">
      <div class="sidekick-wrapper">
        <div class="sidekick-actions">
          <a v-if="$page.project.editable" target="_blank" title="Edit this page" rel="noopener noreferrer" :href="editUrl">
            <Sprite symbol="icon-edit" class="icon-rg" />
          </a>
          <a v-if="$page.project.toc" href="#table-of-contents" title="Table of Contents" class="is-visible-on-phone">
            <Sprite symbol="icon-contents" class="icon-rg" />
          </a>
          <a href="#app" title="Back to top">
            <Sprite symbol="icon-up" class="icon-rg" />
          </a>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Project ($id: ID!) {
  project: project (id: $id) {
    id
    title
    description
    content
    toc
    editable
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
import Hero from '~/components/partials/Hero'
import Sprite from '~/components/Sprite'
import Toc from '~/components/Toc'
import * as appConfig from '@/app.config'

export default {
  metaInfo() {
    return {
      title: this.$page.project.title
    }
  },
  components: {
    Hero,
    Sprite,
    Toc
  },
  computed: {
    editUrl() {
      const editContext = (appConfig.editConfig && appConfig.editConfig.Project ? appConfig.editConfig.Project : appConfig.prefs.editContext)
      return `${editContext}/${this.$page.project.fileInfo.path}`
    }
  }
}
</script>
