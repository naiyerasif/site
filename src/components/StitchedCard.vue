<template>
  <div class="card">
    <g-link v-if="isInternalLink" :to="src">
      <slot></slot>
    </g-link>
    <template v-else-if="src == '#'">
      <slot></slot>
    </template>
    <a v-else target="_blank" rel="noopener noreferrer" :href="src">
      <slot></slot>
    </a>
  </div>
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
