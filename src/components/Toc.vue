<template>
  <section class="toc" id="table-of-contents">
    <a role="button" @click.prevent="toggleOpen()" aria-label="Toggle Table of contents" class="toc-header">
      <span>Table of contents</span>
      <div class="toc-minimizer">
        <transition name="slide-up" mode="out-in">
          <div key="close" v-if="!tocOpen" class="close">&#8595;</div>
          <div key="open" v-else class="open">&#8593;</div>
        </transition>
      </div>
    </a>
    <transition name="dissolve">
      <ul v-if="tocOpen" class="toc-body">
        <li v-for="header in allHeadings" :key="header.id">
          <a :class="'toc-item-' + header.depth" :href="header.anchor">{{ header.value }}</a>
        </li>
      </ul>
    </transition>
  </section>
</template>

<script>
import * as appConfig from '@/app.config'

export default {
  props: ['headers', 'depth'],
  data() {
    return {
      tocOpen: false
    }
  },
  computed: {
    allHeadings() {
      const maxDepth = this.depth ? this.depth : appConfig.prefs.maxTocDepth
      return this.headers.filter(h => h.depth <= maxDepth)
    }
  },
  methods: {
    toggleOpen() {
      this.tocOpen = !this.tocOpen
    }
  }
}
</script>
