<template>
  <div class="layout">
    <div class="crown">
      <Header />
      <slot name="hero"></slot>
    </div>
    <slot></slot>
    <Footer />
  </div>
</template>

<script>
import Header from './partials/Header'
import Footer from './partials/Footer'

export default {
  components: {
    Header,
    Footer
  }
}
</script>
