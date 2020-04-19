<template>
  <nav class="menu" role="navigation">
    <ThemeSwitcher />
    <a @click="toggle" class="expandable-toggle" title="Expandable menu toggle">
      <Sprite symbol="icon-menu" key="open" class="icon" v-if="!isOpen" />
      <Sprite symbol="icon-close" key="close" class="icon" v-else />
    </a>
    <transition name="fade">
      <div v-if="isOpen" class="expandable-menu">
        <g-link to="/showcase/">Showcase</g-link>
        <g-link to="/profile/naiyer/">About</g-link>
      </div>
    </transition>
  </nav>
</template>

<script>
import Sprite from '~/components/Sprite'
import ThemeSwitcher from '~/components/ThemeSwitcher'

export default {
  components: {
    Sprite,
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
