<template>
  <Layout>
    <div class="container hero">
      <h1>
        Page not found
        <p class="subtitle">
          <svg viewBox="0 0 24 24" class="icon icon-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Go back to <g-link to="/">Home</g-link>.</p>
      </h1>
    </div>
    <div class="container article">
      <div class="main">
        <g-link to="/">
          <g-image src="../../static/assets/images/404.svg" />
        </g-link>
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'Page not found'
  }
}
</script>
