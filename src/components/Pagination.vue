<template>
  <div class="flex justify-between text-xl items-center">
    <g-link :to="previousPage(info.currentPage)" :class="{'pointer-events-none opacity-0': info.currentPage == 1}" title="Previous">&larr; Prev</g-link>
    <div class="hidden md:flex w-auto text-center text-gray-600 text-base">Page {{ info.currentPage }} of {{ info.totalPages }}</div>
    <g-link :to="nextPage(info.currentPage,info.totalPages)" :class="{'pointer-events-none opacity-0': info.currentPage == info.totalPages}" title="Next">Next &rarr;</g-link>
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
