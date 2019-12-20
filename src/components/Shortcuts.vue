<template>
  <div class="shortcuts">
    <a href="#" title="Back to top" v-scroll-to="scrollPath">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-up"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"></circle><polyline points="16 12 12 8 8 12" fill="none"></polyline><line x1="12" y1="16" x2="12" y2="8" fill="none"></line></svg>
    </a>
    <a href="/" title="Home">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" fill-opacity="0.2"></path><polyline points="9 22 9 12 15 12 15 22" fill="none"></polyline></svg>
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
