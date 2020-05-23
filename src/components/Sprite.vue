<template>
  <svg>
    <use :xlink:href="link" :href="link"></use>
  </svg>
</template>

<script>
import * as appConfig from '@/app.config'

export default {
  props: {
    src: {
      type: String,
      default: 'icons'
    },
    symbol: String
  },
  computed: {
    link() {
      return `${appConfig.prefs.spriteDir}/${this.src}.svg#${this.symbol}`
    }
  }
}
</script>
