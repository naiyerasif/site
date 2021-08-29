<template>
  <section class="toc text-sm mb-far-base" id="table-of-contents">
    <div class="toc-title text-xs font-bold uppercase tracking-widest py-base px-md flex items-center"><Icon symbol="icon-table-of-content" class="icon-sm text-inform mr-ch-base" /> Table of contents</div>
    <ul class="toc-body list-none py-base px-md">
      <li v-for="header in allHeadings" :key="header.id">
        <a :class="'toc-item-' + header.depth" :href="header.anchor">{{ header.value }}</a>
      </li>
    </ul>
  </section>
</template>

<script>
import Icon from '~/components/Icon'
import * as appConfig from '@/app.config'

export default {
  props: ['headers', 'depth'],
  components: {
    Icon
  },
  computed: {
    allHeadings() {
      const maxDepth = this.depth ? this.depth : appConfig.prefs.maxTocDepth
      return this.headers.filter(h => h.depth <= maxDepth)
    }
  }
}
</script>

<style lang="scss" scoped>
.toc {
  border: 2px solid var(--decorative-spinel);
  border-radius: var(--radius-base);
  max-width: max-content;

  &-title {
    border-bottom: 1px solid var(--decorative-spinel);
  }

  &-body {
    margin-left: 0;
  }

  $toc-margin: 2ch;
  $levels: 3 4 5 6;

  @each $level in $levels {
    .toc-item-#{$level} {
      padding-left: $toc-margin * ($level - 2);
    }
  }
}
</style>
