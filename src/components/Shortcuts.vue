<template>
  <div class="shortcuts">
    <a href="#" title="Back to top" v-scroll-to="scrollPath">
      <svg class="icon icon-up" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
    </a>
    <a href="/" title="Home">
      <svg class="icon icon-home" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </a>
  </div>
</template>

<script>
export default {
  props: ['dest'],
  computed: {
    scrollPath() {
      return "#" + this.dest
    }
  }
}
</script>

<style lang="scss">
.shortcuts {
  position: fixed;
  right: $gap;
  bottom: $gap;
  z-index: $rise-md;

  .icon-up {
    margin-right: $gap-sm;
  }
}
</style>
