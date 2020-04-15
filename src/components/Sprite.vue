<template>
  <svg>
    <use :xlink:href="url" :href="url"></use>
  </svg>
</template>

<static-query>
query {
  metadata {
    spritePath
  }
}
</static-query>

<script>
export default {
  props: ['symbol'],
  computed: {
    url() {
      return `${this.$static.metadata.spritePath}#${this.symbol}`
    }
  }
}
</script>