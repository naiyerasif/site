<template>
  <Layout>
    <template #hero>
      <div class="container">
        <h1 class="font-headings leading-tight text-lg">{{ getMsg() }}</h1>
        <div class="text-md text-neutral">&xlarr; Return to <g-link to="/">Home</g-link>.</div>
      </div>
    </template>
    <main class="container px-far-base">
      <div class="article max-sm">
        <figure>
          <NotFound />
        </figure>
      </div>
    </main>
  </Layout>
</template>

<script>
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
    NotFound
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
