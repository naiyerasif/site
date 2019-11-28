<template>
  <Layout>
    <div class="container post">
      <div class="article">
        <h2>Page Not Found</h2>
        <g-image src="../../static/404.svg" />
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'Page Not Found'
  }
}
</script>

<style lang="scss" scoped>
.article {
  text-align: center;
  
  h2 {
    margin-bottom: $gap;
    font-size: $text-2xl;
    font-weight: $font-semibold;
  }
}
</style>
