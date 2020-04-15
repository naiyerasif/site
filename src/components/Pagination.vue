<template>
  <div class="container sidekick">
    <section class="pagination" v-if="input.totalPages > 1">
      <g-link class="is-prev" :to="previousPage(input.currentPage)" v-if="input.currentPage > 1"><Sprite symbol="icon-chevron-left" class="icon-sm" /> Prev</g-link>
      <div>page {{ input.currentPage }} of {{ input.totalPages }}</div>
      <g-link class="is-next" :to="nextPage(input.currentPage)" v-if="input.currentPage < input.totalPages">Next <Sprite symbol="icon-chevron-right" class="icon-sm" /></g-link>
    </section>
    <section class="pagination" v-else>
      <div class="is-muted">🔚 end of the list</div>
    </section>
  </div>
</template>

<script>
import Sprite from './Sprite'

export default {
  props: ['path', 'input'],
  components: {
    Sprite
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
