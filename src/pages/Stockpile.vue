<template>
  <Layout>
    <Hero>Stockpile</Hero>
    <div class="container stockpile">
      <div class="grid-3">
        <div class="column" v-for="item in $page.stockpile.edges" :key="item.node.id">
          <a v-if="item.node.link.startsWith('http')" :href="item.node.link" class="card" target="_blank" rel="noopener noreferrer">
            <div class="card-category">{{ item.node.type }}</div>
            <h3 class="card-title">{{ item.node.title }}&nearr;</h3>
            <p class="description">{{ item.node.description }}</p>
          </a>
          <g-link v-else :to="item.node.link" class="card">
            <div class="card-category">{{ item.node.type }}</div>
            <h3 class="card-title">{{ item.node.title }}</h3>
            <p class="description">{{ item.node.description }}</p>
          </g-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query StockpileItems ($page: Int) {
  stockpile: allStockpile (sortBy: "id", order: ASC, perPage: 15, page: $page) {
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
import Hero from '~/components/Hero'

export default {
  metaInfo() {
    return {
      title: 'Stockpile'
    }
  },
  components: {
    Hero
  }
}
</script>

<style lang="scss" scoped>
.stockpile {
  width: $expanse-full;
  margin-top: $gap;
  margin-bottom: $gap;

  @include tablet-portrait {
    margin-left: $gap-0;
    margin-right: $gap-0;
    margin-bottom: $gap-0;
    width: $expanse-full * .8;
  }

  .card-category, .description {
    color: var(--text-default);
  }
}
</style>