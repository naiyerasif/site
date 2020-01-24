<template>
  <section class="container pagination">
    <g-link class="is-prev" :to="previousPage(input.currentPage)" v-if="input.currentPage > 1"><IconChevronLeft class="icon-sm" /> Prev</g-link>
    <div>page {{ input.currentPage }} of {{ input.totalPages }}</div>
    <g-link class="is-next" :to="nextPage(input.currentPage)" v-if="input.currentPage < input.totalPages">Next <IconChevronRight class="icon-sm" /></g-link>
  </section>
</template>

<script>
import IconChevronLeft from '~/assets/images/icon-chevron-left.svg'
import IconChevronRight from '~/assets/images/icon-chevron-right.svg'

export default {
  props: ['path', 'input'],
  components: {
    IconChevronLeft,
    IconChevronRight
  },
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
