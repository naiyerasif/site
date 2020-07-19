<template>
  <a role="switch" @click.prevent="switchTheme" :aria-label="'Switch to ' + nextTheme + ' theme'" aria-checked="true" class="theme-switcher">
    <svg viewBox="0 0 24 24" class="icon-rg">
      <transition name="slide-up" mode="out-in">
        <use :xlink:href="uri('dark')" :href="uri('dark')" key="dark" v-if="theme === 'dark'"></use>
        <use :xlink:href="uri('light')" :href="uri('light')" key="light" v-else></use>
      </transition>
    </svg>
  </a>
</template>

<script>
import * as appConfig from '@/app.config'

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
      return `${appConfig.prefs.spriteDir}/icons.svg#icon-${symbol}`
    }
  },
  async mounted() {
    if (typeof window.__theme !== 'undefined') this.theme = window.__theme
  }
}
</script>
