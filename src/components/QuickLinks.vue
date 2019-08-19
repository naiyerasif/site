<template>
  <div class="fixed right-4 bottom-4 z-0">
    <a href="#" title="Back to top" v-scroll-to="scrollPath" class="mr-4 text-gray-400 hover:text-green-200">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="10" style="background:#fff"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
    </a>
    <a href="/" title="Home" class="text-gray-400 hover:text-green-200">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><path style="background:#fff" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
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