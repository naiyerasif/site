<template>
  <div class="sidekick">
    <div class="sidekick-wrapper">
      <div class="pagination" v-if="input.totalPages > 1 && input.totalPages < 6">
        <g-link class="is-prev" :to="previousPage" v-if="input.currentPage > 1">&xlarr;</g-link>
        <g-link :class="{ 'is-current': input.currentPage == idx }" v-for="idx in input.totalPages" :key="idx" :to="destination(idx)">{{ idx }}</g-link>
        <g-link class="is-next" :to="nextPage" v-if="input.currentPage < input.totalPages">&xrarr;</g-link>
      </div>
      <div class="pagination" v-else>
        <div class="is-muted">🔚 end of the list</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['path', 'input'],
  computed: {
    base() {
      return this.path || ''
    },
    previousPage() {
      const currentPage = this.input.currentPage
      return [0, 1].includes(currentPage - 1) ? `${this.base}/` : `${this.base}/${currentPage - 1}/`
    },
    nextPage() {
      const currentPage = this.input.currentPage
      const totalPages = this.input.totalPages
      return totalPages > currentPage ? `${this.base}/${currentPage + 1}/` : `${this.base}/${currentPage}/`
    }
  },
  methods: {
    destination(index) {
      return [0, 1].includes(index) ? `${this.base}/` : `${this.base}/${index}/`
    }
  }
}
</script>
