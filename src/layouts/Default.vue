<template>
  <div class="layout font-normal overflow-x-hidden">
    <Header>
      <slot name="hero"></slot>
    </Header>
    <slot></slot>
    <Footer>
      <slot name="sidekick"></slot>
    </Footer>
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
