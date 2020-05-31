<template>
  <svg>
    <use :xlink:href="uri" :href="uri" />
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
    uri() {
      return `${spriteDir}/${this.src}.svg#${this.symbol}`
    }
  }
}
</script>
