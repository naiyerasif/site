<template>
  <a role="button" @click.prevent="switchTheme()" :aria-label="'Switch to ' + nextTheme + ' mode'" class="theme-switcher">
    <transition name="slide-up" mode="out-in">
      <Sprite symbol="icon-dark" key="dark" v-if="theme === 'dark'" class="icon" />
      <Sprite symbol="icon-light" key="light" v-else class="icon" />
    </transition>
  </a>
</template>

<script>
import Sprite from './Sprite'

const themes = ['light', 'dark']

export default {
  components: {
    Sprite
  },
  data() {
    return {
      theme: 'dark',
    }
  },
  computed: {
    nextTheme() {
      const currentIndex = themes.indexOf(this.theme)
      const nextIndex = (currentIndex + 1) % themes.length
      return themes[nextIndex]
    }
  },
  methods: {
    switchTheme() {
      const currentIndex = themes.indexOf(this.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      window.__setPreferredTheme(themes[nextIndex])
      this.theme = themes[nextIndex]
    }
  },
  async mounted() {
    // set default
    if (typeof window.__theme !== 'undefined') this.theme = window.__theme
  }
}
</script>
