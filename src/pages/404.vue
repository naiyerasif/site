<template>
  <Layout>
    <div class="container mx-auto">
      <div class="grid row flex flex-wrap -mx-6 md:-mx-2">
        <div class="column flex w-full p-2 sm:w-3/4">
          <div class="card rounded-none md:rounded">
            <div class="p-16 sm:p-24 text-center">
              <h1 class="text-3xl font-semibold md:text-5xl mb-4 leading-tight">Page Not Found</h1>
              <g-image src="../../static/404.svg" />
            </div>
          </div>
        </div>
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

