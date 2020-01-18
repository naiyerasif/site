<template>
  <Layout>
    <div class="container hero">
      <h1>Page not found</h1>
      <p>Go back to <g-link to="/">Home</g-link>.</p>
    </div>
    <div class="container grid-wrapper">
      <div class="post">
        <g-link to="/" class="panel">
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
