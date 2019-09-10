<template>
  <Layout>
    <div class="bg-background-header text-content-body">
      <div class="container mx-auto textl-xl">
        <div class="w-full py-4 md:py-16 bg-background-pattern">
          <h1 class="text-3xl font-semibold md:text-5xl mb-4 md:mb-16 leading-tight">References</h1>
        </div>
      </div>
    </div>
    <div class="container mx-auto py-4 md:py-16">
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

