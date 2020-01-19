<template>
  <section class="container pagination">
    <g-link class="is-prev" :to="previousPage(input.currentPage)" v-if="input.currentPage > 1"><svg viewBox="0 0 24 24" class="icon-sm icon-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg> Prev</g-link>
    <div>page {{ input.currentPage }} of {{ input.totalPages }}</div>
    <g-link class="is-next" :to="nextPage(input.currentPage)" v-if="input.currentPage < input.totalPages">Next <svg viewBox="0 0 24 24" class="icon-sm icon-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg></g-link>
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
    nextPage(currentPage) {
      return this.input.totalPages > currentPage ? `${this.base}/${currentPage + 1}/` : `${this.base}/${currentPage}/`;
    }
  }
}
</script>
