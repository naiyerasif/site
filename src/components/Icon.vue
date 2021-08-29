<template>
  <svg :aria-hidden="decorative" :aria-labelledby="semantic" role="img">
    <title v-if="!!label" :id="semantic">{{ label }}</title>
    <use :href="path" />
  </svg>
</template>

<script>
import * as slugify from '@/lib/slugify'

// sprite file location
const sprites = '/assets/images/icons.svg'

export default {
  props: {
    src: {
      type: String,
      default: sprites
    },
    symbol: String,
    label: String
  },
  computed: {
    path() {
      return `${this.src}#${this.symbol}`
    },
    decorative() {
      return !this.label
    },
    semantic() {
      return !!this.label ? slugify.createSlug(this.label) : false
    }
  }
}
</script>
