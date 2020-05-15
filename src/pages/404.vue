<template>
  <Layout>
    <section class="hero">
      <div class="container">
        <div class="metadata">
          <div class="metadata-content">
            <h1 class="title">{{ getMsg() }}</h1>
            <div class="subtitle">
              &larr; Go back to <g-link to="/">Home</g-link>.
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="content">
      <main class="container">
        <NotFound />
      </main>
    </div>
  </Layout>
</template>

<script>
import NotFound from 'static/assets/images/404.svg'

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
    NotFound
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
