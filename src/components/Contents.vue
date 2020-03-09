<template>
  <details class="toc">
    <summary id="table-of-contents">Table of Contents</summary>
    <ul>
      <li v-for="header in allHeadings" :key="header.id">
        <a :class="'header-' + header.depth" :href="header.anchor">{{ header.value }}</a>
      </li>
    </ul>
  </details>
</template>

<script>
import * as appConfig from '../../app.config'

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