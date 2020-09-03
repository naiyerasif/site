<template>
  <details class="toc" id="table-of-contents">
    <summary>Table of contents</summary>
    <ul class="toc-body">
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
