<template>
  <Layout>
    <div class="container hero">
      <section class="canvas">
        <h1 class="title">
          Page not found
        </h1>
        <div class="subtitle">
          <IconChevronLeft class="icon" /> Go back to <g-link to="/">Home</g-link>.
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
import IconChevronLeft from '@/images/icon-chevron-left.svg'
import NotFound from '@/images/404.svg'

export default {
  metaInfo: {
    title: 'Page not found'
  },
  components: {
    IconChevronLeft,
    NotFound
  }
}
</script>
