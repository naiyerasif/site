<template>
  <g-link v-if="isInternalLink" :to="src">
    <slot></slot>
  </g-link>
  <div v-else-if="src == '#'">
    <slot></slot>
  </div>
  <a v-else target="_blank" rel="noopener noreferrer" :href="src">
    <slot></slot>
  </a>
</template>

<script>
export default {
  props: ['src'],
  computed: {
    isInternalLink() {
      return this.src && this.src.startsWith('/')
    }
  }
}
</script>
