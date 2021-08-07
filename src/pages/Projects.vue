<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="leading-tight text-lg">Projects</h1>
        <div class="text-md text-neutral">Tools, utilities and experiments</div>
      </div>
    </template>
    <main class="container px-far-base">
      <section class="article max-sm">
        <blockquote>
          <p>I've contributed to many open-source projects over the last few years; I maintain a few of them in my spare time. Here's a selection of projects that I've been involved with.</p>
        </blockquote>
        <div class="group cursor-pointer mt-far-sm" v-for="project in $page.projects.edges" :key="project.id">
          <a class="block font-bold text-md my-xs group-hover:text-deter group-hover:underline" target="_blank" rel="nofollow noopener noreferrer" :href="project.node.link">{{ project.node.title }}</a>
          <div class="text-sm" v-html="project.node.description" />
        </div>
      </section>
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
import * as appConfig from '@/app.config'

export default {
  metaInfo() {
    const title = 'Projects'
    const description = 'Tools, utilities and experiments by Naiyer Asif'
    
    return {
      title: title,
      meta: [
        { name: 'description', content: description },

        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: "og:url", content: `${appConfig.url}/projects/` },

        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:site', content: '@Microflash' },
        { name: 'twitter:creator', content: '@Microflash' }
      ]
    }
  },
}
</script>
