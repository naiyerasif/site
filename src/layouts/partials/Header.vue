<template>
  <header class="container header">
    <g-link class="brand" to="/">
      <g-image class="logo" src="../../../static/logo.svg" alt="Microflash" />
    </g-link>
    <button class="hamburger hamburger-icon" :class="{ active: isOpen }" type="button" aria-label="Menu" @click="toggle">
      <span class="hamburger-box" aria-hidden="true">
        <span class="hamburger-inner"></span>
      </span>
    </button>
    <ul class="menu" :class="isOpen ? 'is-visible': 'is-hidden-on-phone'">
      <li><Search /></li>
      <li><ThemeSwitcher /></li>
      <li><g-link to="/stockpile/">Stockpile</g-link></li>
      <li><g-link to="/about">About</g-link></li>
    </ul>
  </header>
</template>

<script>
import Search from '~/components/Search'
import ThemeSwitcher from '~/components/ThemeSwitcher'

export default {
  components: {
    Search,
    ThemeSwitcher
  },
  data() {
    return {
      isOpen: false
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    }
  }
}
</script>
