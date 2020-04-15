<template>
  <Layout>
    <div class="container hero">
      <section class="canvas">
        <h1 class="title">
          <span class="is-warning">404</span> {{ getMsg() }}
        </h1>
        <div class="subtitle">
          <Sprite symbol="icon-chevron-left" class="icon" /> Go back to <g-link to="/">Home</g-link>.
        </div>
      </section>
    </div>
    <div class="container article">
      <div class="main">
        <g-link to="/">
          <NotFound />
        </g-link>
      </div>
    </div>
  </Layout>
</template>

<script>
import Sprite from '~/components/Sprite'
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
    Sprite,
    NotFound
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
