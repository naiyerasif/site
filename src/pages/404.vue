<template>
  <Layout>
    <div class="container hero">
      <h1>
        Page not found
        <p class="subtitle">
          <IconChevronLeft class="icon" /> Go back to <g-link to="/">Home</g-link>.
        </p>
      </h1>
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
import IconChevronLeft from '~/assets/images/icon-chevron-left.svg'
import NotFound from '~/assets/images/404.svg'

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
