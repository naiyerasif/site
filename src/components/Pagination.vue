<template>
  <div class="pagination">
    <g-link :to="previousPage(info.currentPage)" :class="{'paginator': info.currentPage === 1}">&larr; Prev</g-link>
    <div class="page-data">Page {{ info.currentPage }} of {{ info.totalPages }}</div>
    <g-link :to="nextPage(info.currentPage,info.totalPages)" :class="{'paginator': info.currentPage === info.totalPages}">Next &rarr;</g-link>
  </div>
</template>

<script>
export default {
  props: ['base','info'],
  methods: {
    previousPage(currentPage) {
      return [0, 1].includes(currentPage - 1) ? `${this.basePath}/` : `${this.basePath}/${currentPage - 1}/`;
    },
    nextPage(currentPage, totalPages) {
      return totalPages > currentPage ? `${this.basePath}/${currentPage + 1}/` : `${this.basePath}/${currentPage}/`;
    }
  },
  computed: {
    basePath() {
      return this.base || ''
    }
  }
}
</script>

<style lang="scss">
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .paginator {
    pointer-events: none;
    opacity: 0;

    @include phone-only {
      visibility: hidden;
    }

    @include tablet-landscape {
      display: none;
    }
  }

  .page-data {
    color: $color-custom;
    width: auto;
    text-align: center;

    @include tablet-landscape {
      display: flex;
    }
  }
}
</style>
