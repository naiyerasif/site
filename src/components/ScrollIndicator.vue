<template>
  <ClientOnly>
    <VueScrollIndicator background="transparent" height="2px" color="var(--link)" />
  </ClientOnly>
</template>

<script>
export default {
  components: {
    VueScrollIndicator: () => import('vue-scroll-indicator')
      .then(c => c.VueScrollIndicator)
      .catch()
  }
}
</script>
