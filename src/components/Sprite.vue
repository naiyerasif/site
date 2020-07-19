<template>
  <svg role="img">
    <use :xlink:href="link" :href="link" />
  </svg>
</template>

<script>
import * as appConfig from '@/app.config'

const { spriteDir } = appConfig.prefs

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
      return `${spriteDir}/${this.src}.svg#${this.symbol}`
    }
  }
}
</script>
