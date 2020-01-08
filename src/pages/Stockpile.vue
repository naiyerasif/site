<template>
  <Layout>
    <div class="container hero">
      <h1>Stockpile</h1>
    </div>
    <div class="container grid-lg">
      <div class="grid-lg-cell" v-for="item in $page.stockpile.edges" :key="item.node.id">
        <div class="panel card">
          <a v-if="item.node.link.startsWith('http')" :href="item.node.link" target="_blank" rel="noopener noreferrer">
            <div class="box-header">{{ item.node.type }}</div>
            <h3 class="box-body">{{ item.node.title }}&nearr;</h3>
            <p class="card-footer">{{ item.node.description }}</p>
          </a>
          <g-link v-else :to="item.node.link">
            <div class="card-header">{{ item.node.type }}</div>
            <h3 class="card-body">{{ item.node.title }}</h3>
            <p class="card-footer">{{ item.node.description }}</p>
          </g-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query StockpileItems ($page: Int) {
  stockpile: allStockpile (sortBy: "id", order: DESC, perPage: 15, page: $page) {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        type
        description
        link
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo() {
    return {
      title: 'Stockpile'
    }
  }
}
</script>
