<template>
  <header class="container header">
    <g-link class="brand" to="/">
      <Logo />
    </g-link>
    <a @click="toggle" class="hamburger" title="Menu">
      <transition name="slide-up" mode="out-in">
        <Sprite symbol="icon-menu" key="open" class="icon" v-if="!isOpen" />
        <Sprite symbol="icon-close" key="close" class="icon" v-else />
      </transition>
    </a>
    <nav class="menu" :class="isOpen ? 'is-visible': 'is-hidden-on-phone'">
      <Search />
      <ThemeSwitcher />
      <g-link to="/showcase/">Showcase</g-link>
      <g-link to="/profile/naiyer/">About</g-link>
    </nav>
  </header>
</template>

<script>
import Sprite from '~/components/Sprite'
import Logo from '@/images/logo.svg'
import Search from '~/components/Search'
import ThemeSwitcher from '~/components/ThemeSwitcher'

export default {
  components: {
    Logo,
    Sprite,
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
