<template>
  <a role="switch" @click.prevent="switchTheme" :aria-label="'Switch to ' + nextTheme + ' theme'" aria-checked="true" class="theme-switcher leading-none tappable focus:bg-ruby hover:bg-ruby">
    <svg viewBox="0 0 24 24" class="icon">
      <transition name="slide-up" mode="out-in">
        <use :href="uri('moon')" key="dark" v-if="theme === 'dark'"></use>
        <use :href="uri('sun')" key="light" v-else></use>
      </transition>
    </svg>
  </a>
</template>

<script>
import * as appConfig from '@/app.config'

const { paths } = appConfig
const themes = ['light', 'dark']

export default {
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
    },
    uri(symbol) {
      return `${paths.sprite}/icons.svg#icon-${symbol}`
    }
  },
  async mounted() {
    if (typeof window.__theme !== 'undefined') this.theme = window.__theme
  }
}
</script>
