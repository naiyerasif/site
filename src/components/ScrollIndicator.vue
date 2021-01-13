<template>
  <ClientOnly>
    <div class="scroll-indicator-wrapper" :style="{ height: height, backgroundColor: backgroundColor }">
      <div class="scroll-indicator" :style="{ background: color, width: width }"></div>
    </div>
  </ClientOnly>
</template>

<script>
export default {
  props: {
    height: {
      type: String,
      default: '2px',
      required: false,
    },
    color: {
      type: String,
      default: 'var(--brand-primary)',
      required: false,
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
      required: false,
    }
  },
  data() {
    return {
      scrolled: '',
      docHeight: '',
      width: '',
    }
  },
  mounted() {
    window.addEventListener('load', this.scrollHandler)
    window.addEventListener('scroll', this.scrollHandler)
  },
  destroyed() {
    window.removeEventListener('load', this.scrollHandler)
    window.removeEventListener('scroll', this.scrollHandler)
  },
  methods: {
    scrollHandler() {
      this.scrolled = document.body.scrollTop || document.documentElement.scrollTop
      this.docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      this.width = (this.scrolled / this.docHeight) * 100 + '%'
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-indicator {
  width: 0;
  height: 100%;
}

.scroll-indicator-wrapper {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
</style>
