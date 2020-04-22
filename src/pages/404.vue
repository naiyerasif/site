<template>
  <Layout>
    <div class="hero-media">
      <div class="hero-image">
        <h1 class="is-warning">404</h1>
      </div>
    </div>
    <div class="hero-content">
      <h1 class="title">{{ getMsg() }}</h1>
      <div class="subtitle">
        &larr; Go back to <g-link to="/">Home</g-link>.
      </div>
    </div>
    <div class="content">
      <g-link to="/">
        <NotFound />
      </g-link>
    </div>
  </Layout>
</template>

<script>
import NotFound from '@/images/404.svg'

const msgs = [
  `Page not found`,
  `There's nothing here`,
  `Looks like something went wrong`,
  `This link seems broken `
]

export default {
  metaInfo: {
    title: 'Page not found'
  },
  components: {
    NotFound
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
