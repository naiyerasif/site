<template>
  <Layout>
    <Hero>
      <h1 class="title">{{ getMsg() }}</h1>
      <div class="subtitle">
        &larr; Return to <g-link to="/">Home</g-link>.
      </div>
    </Hero>
    <main>
      <figure>
        <NotFound />
      </figure>
    </main>
  </Layout>
</template>

<script>
import Hero from '~/components/partials/Hero'
import NotFound from '@/static/assets/images/404.svg'

const msgs = [
  `Page not found`,
  `There's nothing here`,
  `Something is missing`,
  `This link is broken`
]

export default {
  metaInfo: {
    title: 'Page not found'
  },
  components: {
    Hero,
    NotFound
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
