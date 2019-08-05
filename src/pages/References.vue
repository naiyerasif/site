<template>
  <Layout>
    <div class="bg-background-quaternary">
      <div class="container-inner mx-auto textl-xl">
        <div class="w-full py-4 md:py-16 bg-background-pattern">
          <h1 class="text-3xl font-bold md:text-5xl mb-4 md:mb-16 leading-tight">References</h1>
        </div>
      </div>
    </div>
    <div class="container-inner mx-auto py-4 md:py-16">
      <div class="max-w-sm rounded overflow-hidden bg-background-secondary shadow">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">Cheatsheets</div>
          <ul>
            <li v-for="cheatsheet in $page.cheatsheets.edges" :key="cheatsheet.node.id">
              <g-link :to="cheatsheet.node.path">{{ cheatsheet.node.title }}</g-link>
            </li>
          </ul>
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

