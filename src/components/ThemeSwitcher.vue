<template>
  <a role="button" @click.prevent="switchTheme()" :aria-label="'Switch to ' + nextTheme + ' mode'" :title="'Switch to ' + nextTheme + ' mode'" class="switch-theme">
    <transition name="slide-up" mode="out-in">
      <IconDark key="dark" v-if="theme === 'dark'" class="icon" />
      <IconLight key="light" v-else class="icon" />
    </transition>
  </a>
</template>

<script>
import IconDark from '~/assets/images/icon-dark.svg'
import IconLight from '~/assets/images/icon-light.svg'

const themes = ['light', 'dark']

export default {
  components: {
    IconDark,
    IconLight
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
