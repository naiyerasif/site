<template>
  <div class="sidebar-start">
    <details class="toc is-hidden-on-phone" open>
      <summary>Table of Contents</summary>
      <ul>
        <li v-for="header in allHeadings" :key="header.id">
          <a :class="'header-' + header.depth" :href="header.anchor">{{ header.value }}</a>
        </li>
      </ul>
    </details>
    <details class="toc is-visible-on-phone">
      <summary id="table-of-contents">Table of Contents</summary>
      <ul>
        <li v-for="header in allHeadings" :key="header.id">
          <a :class="'header-' + header.depth" :href="header.anchor">{{ header.value }}</a>
        </li>
      </ul>
    </details>
  </div>
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