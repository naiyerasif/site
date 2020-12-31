<template>
  <div class="sidekick">
    <div class="sidekick-wrapper">
      <div class="pagination" v-if="total > 1">
        <g-link class="chip !high" :to="previousPage" v-if="current > 1">&xlarr;</g-link>
        <template v-if="total < 6">
          <g-link class="chip !high" :class="isCurrent(current, idx)" v-for="idx in total" :key="idx" :to="goto(idx)">{{ idx }}</g-link>
        </template>
        <template v-else>
          <g-link class="chip !high" :class="isCurrent(current, pidx)" v-for="pidx in previousRange" :key="pidx" :to="goto(pidx)">{{ pidx }}</g-link>
          <span v-if="showPreviousSeparator" class="pagination-separator">···</span>
          <g-link class="chip !high" :class="isCurrent(current, midx)" v-for="midx in midRange" :key="midx" :to="goto(midx)">{{ midx }}</g-link>
          <span v-if="showNextSeparator" class="pagination-separator">···</span>
          <g-link class="chip !high" :class="isCurrent(current, nidx)" v-for="nidx in nextRange" :key="nidx" :to="goto(nidx)">{{ nidx }}</g-link>
        </template>
        <g-link class="chip !high" :to="nextPage" v-if="current < total">&xrarr;</g-link>
      </div>
      <div class="pagination" v-else>
        <div class="is-muted">🔚 end of the list</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  },
  computed: {
    base() {
      return this.path || ''
    },
    previousRange() {
      return this.current < 3 ? [1, 2, 3] : [1]
    },
    nextRange() {
      return this.total > 5 && (this.total - this.current) < 2 ? [(this.total - 2), (this.total - 1), this.total] : [this.total]
    },
    midRange() {
      return this.current > 2 && (this.total - this.current) > 1 ? [(this.current - 1), this.current, (this.current + 1)] : []
    },
    previousPage() {
      return [0, 1].includes(this.current - 1) ? `${this.base}/` : `${this.base}/${this.current - 1}/`
    },
    nextPage() {
      return this.total > this.current ? `${this.base}/${this.current + 1}/` : `${this.base}/${this.current}/`
    },
    showPreviousSeparator() {
      return this.total > 5 && (this.total - this.current) > 1
    },
    showNextSeparator() {
      return this.total > 5 && this.current > 2
    }
  },
  methods: {
    goto(index) {
      return [0, 1].includes(index) ? `${this.base}/` : `${this.base}/${index}/`
    },
    isCurrent(current, index) {
      return {
        'is-current': current == index
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/variables';

.pagination {
  --pagination-gap: #{variables.$gap-sm};
  
  display: flex;
  align-items: center;
  justify-content: flex-end;

  *:not(:first-child) {
    margin-left: var(--pagination-gap);
  }
  
  .active {
    font-weight: normal;
  }
}
</style>
