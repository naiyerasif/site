<template>
  <section class="container pagination">
    <g-link class="is-prev" :to="previousPage(input.currentPage)" v-if="input.currentPage > 1">&larr; Prev</g-link>
    <div>page {{ input.currentPage }} of {{ input.totalPages }}</div>
    <g-link class="is-next" :to="nextPage(input.currentPage, input.totalPages)" v-if="input.currentPage < input.totalPages">Next &rarr;</g-link>
  </section>
</template>

<script>
export default {
  props: ['path', 'input'],
  computed: {
    base() {
      return this.path || ''
    }
  },
  methods: {
    previousPage(currentPage) {
      return [0, 1].includes(currentPage - 1) ? `${this.base}/` : `${this.base}/${currentPage - 1}/`;
    },
    nextPage(currentPage, totalPages) {
      return totalPages > currentPage ? `${this.base}/${currentPage + 1}/` : `${this.base}/${currentPage}/`;
    }
  }
}
</script>
