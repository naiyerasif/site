<template>
  <div class="hero">
    <div class="hero-wrapper" :class="{ 'is-flex': flex }">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    flex: Boolean
  }
}
</script>
