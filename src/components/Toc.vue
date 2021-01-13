<template>
  <details class="toc max-sm text-sm mb-far-sm" id="table-of-contents">
    <summary>Table of contents</summary>
    <ul class="toc-body list-none px-base py-sm">
      <li v-for="header in allHeadings" :key="header.id">
        <a :class="'toc-item-' + header.depth" :href="header.anchor">{{ header.value }}</a>
      </li>
    </ul>
  </details>
</template>

<script>
import * as appConfig from '@/app.config'

const { prefs } = appConfig

export default {
  props: ['headers', 'depth'],
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
