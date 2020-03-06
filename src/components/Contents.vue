<template>
  <details class="toc">
    <summary id="table-of-contents">Table of Contents</summary>
    <ul>
      <li v-for="header in headers" :key="header.id">
        <a :class="'header-' + header.depth" :href="header.anchor">{{ header.value }}</a>
      </li>
    </ul>
  </details>
</template>

<script>
export default {
  props: ['headers'],
}
</script>