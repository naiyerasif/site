<template>
  <Layout>
    <section>
      <div class="container mx-auto">
        <div class="w-full">
          <h1 class="text-3xl font-semibold md:text-5xl mb-3 md:mb-12 leading-tight">References</h1>
        </div>
      </div>
    </section>
    <div class="container mx-auto">
      <div class="grid row flex flex-wrap -mx-6 md:-mx-2">
        <div v-for="cheatsheet in $page.cheatsheets.edges" :key="cheatsheet.node.id" class="column flex w-full p-2 sm:w-1/2 md:w-1/3">
          <g-link :to="cheatsheet.node.path" class="card rounded-none md:rounded">
            <div class="p-4">
              <div class="card-category text-content-body">{{ cheatsheet.node.label }}</div>
              <h3 class="card-title">{{ cheatsheet.node.title }}</h3>
              <p class="text-content-body">{{ cheatsheet.node.summary }}</p>
            </div>
          </g-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Cheatsheets ($page: Int) {
  cheatsheets: allCheatsheet (sortBy: "title", order: DESC, perPage: 3, page: $page) {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        path
        summary
        label
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo: {
    title: 'References'
  }
}
</script>

