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
export default {
  props: ['headers', 'depth'],
  computed: {
    allHeadings() {
      return this.depth ? this.headers.filter(h => h.depth <= this.depth) : this.headers
    }
  }
}
</script>