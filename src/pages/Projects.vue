<template>
  <Layout>
    <Hero>
      <h1 class="title">Projects</h1>
      <div class="subtitle">Tools, utilities and experiments</div>
    </Hero>
    <main class="content">
      <article class="article">
        <blockquote>
          <p>I've contributed to many open-source projects over the last few years; I maintain a few of them in my spare time. Here's a selection of projects that I've been involved with.</p>
        </blockquote>
        <dl class="prominent-list">
          <div v-for="project in $page.projects.edges" :key="project.id">
            <dt><a target="_blank" rel="nofollow noopener noreferrer" :href="project.node.path">{{ project.node.title }}</a></dt>
            <dd>{{ project.node.description }}</dd>
          </div>
        </dl>
      </article>
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
        path
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
