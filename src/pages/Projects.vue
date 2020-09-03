<template>
  <Layout>
    <Hero>
      <h1 class="title">Projects</h1>
      <div class="subtitle">Tools, utilities and experiments</div>
    </Hero>
    <main class="content">
      <article class="article">
        <dl>
          <div class="definition" v-for="project in $page.projects.edges" :key="project.id">
            <dt>
              <g-link v-if="!!project.node.link" :to="project.node.link">{{ project.node.title }}</g-link>
              <a v-else target="_blank" rel="nofollow noopener noreferrer" :href="project.node.link">{{ project.node.title }}</a>
            </dt>
            <dd>{{ project.node.description }}</dd>
          </div>
        </dl>
      </article>
    </main>
  </Layout>
</template>

<page-query>
query CompleteProjects {
  projects: allCompleteProject (sortBy: "id", order: DESC) {
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
  metaInfo() {
    return {
      title: 'Projects'
    }
  },
  components: {
    Hero
  }
}
</script>
