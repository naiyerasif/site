<template>
  <div class="sidekick">
    <div class="pagination" v-if="input.totalPages > 1">
      <g-link class="is-prev" :to="previousPage(input.currentPage)" v-if="input.currentPage > 1">&larr; Prev</g-link>
      <div>page {{ input.currentPage }} of {{ input.totalPages }}</div>
      <g-link class="is-next" :to="nextPage(input.currentPage)" v-if="input.currentPage < input.totalPages">Next &rarr;</g-link>
    </div>
    <div class="pagination" v-else>
      <div class="is-muted">🔚 end of the list</div>
    </div>
  </div>
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
