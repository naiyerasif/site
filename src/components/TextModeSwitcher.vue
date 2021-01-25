<template>
  <a role="switch" @click.prevent="switchTextMode" :aria-label="'Switch to ' + nextTextMode + ' text'" aria-checked="true" class="text-mode-switcher leading-none tappable focus:bg-ruby hover:bg-ruby">
    <svg viewBox="0 0 24 24" class="icon">
      <transition name="slide-up" mode="out-in">
        <use :href="uri('zoom-in')" key="dark" v-if="textMode === 'normal'"></use>
        <use :href="uri('zoom-out')" key="light" v-else></use>
      </transition>
    </svg>
  </a>
</template>

<script>
import * as appConfig from '@/app.config'

const { paths } = appConfig
const textModes = ['normal', 'large']

export default {
  data() {
    return {
      textMode: 'normal',
    }
  },
  computed: {
    nextTextMode() {
      const currentIndex = textModes.indexOf(this.textMode)
      const nextIndex = (currentIndex + 1) % textModes.length
      return textModes[nextIndex]
    }
  },
  methods: {
    switchTextMode() {
      const currentIndex = textModes.indexOf(this.textMode);
      const nextIndex = (currentIndex + 1) % textModes.length;
      window.__setPreferredTextMode(textModes[nextIndex])
      this.textMode = textModes[nextIndex]
    },
    uri(symbol) {
      return `${paths.sprite}/icons.svg#icon-${symbol}`
    }
  },
  async mounted() {
    if (typeof window.__textMode !== 'undefined') this.textMode = window.__textMode
  }
}
</script>
