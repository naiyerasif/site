<template>
  <Layout>
    <template #hero>
      <Hero>
        <h1 class="title">Projects</h1>
        <div class="subtitle">Tools, utilities and experiments</div>
      </Hero>
    </template>
    <main class="content">
      <blockquote class="mb-2">
        <p>I've contributed to many open-source projects over the last few years; I maintain a few of them in my spare time. Here's a selection of projects that I've been involved with.</p>
      </blockquote>
      <div class="grid" style="--grid-column-width: var(--grid-col-xs)">
        <div class="card shadow %active is-clickable" v-for="project in $page.projects.edges" :key="project.id">
          <a class="card-content is-bold is-regular" target="_blank" rel="nofollow noopener noreferrer" :href="project.node.link">{{ project.node.title }}</a>
          <div class="card-footer" v-html="project.node.description" />
        </div>
      </div>
    </main>
  </Layout>
</template>

<page-query>
query {
  projects: allProject {
    edges {
      node {
        id
        title
        description
        link
      }
    }
  }
}
</page-query>

<script>
import Hero from '~/components/partials/Hero'

export default {
  metaInfo: {
    title: 'Projects'
  },
  components: {
    Hero
  }
}
</script>
