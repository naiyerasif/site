<template>
  <div class="search flex items-center">
    <a class="leading-none tappable focus:bg-ruby hover:bg-ruby" role="button" aria-label="Launch search" @click="launch">
      <Sprite symbol="icon-search" class="icon" />
    </a>
    <transition name="dissolve" mode="out-in">
      <div v-if="launched" class="search-modal fixed inset-0">
        <search-escape @keyup.esc="escapeSearch" />
        <div class="search-panel fixed inset-0 overflow-hidden flex flex-col shadow border-1 border-solid border-spinel rounded-2xl bg-tertiary my-far-md mx-auto px-far-sm py-far-sm max-w-4xl max-h-4xl z-50">
          <div class="search-box flex items-center justify-between">
            <Sprite symbol="icon-search" class="icon text-primary" />
            <input type="text" class="search-input bg-transparent border-none outline-none basis-100 mx-base" placeholder="Search blog posts..." v-model="query" @input="softReset" @keyup="performSearch" @keydown.up.prevent="highlightPrev" @keydown.down.prevent="highlightNext" @keyup.enter="performSearch" ref="search" aria-label="Search blog posts"/>
            <a role="button" aria-label="Reset search" @click="reset" class="search-reset leading-none focus:no-underline hover:no-underline">
              <kbd class="tappable focus:bg-ruby hover:bg-ruby">esc</kbd>
            </a>
          </div>
          <hr class="my-lg" />
          <div v-if="query.length > 0 && searchResultsVisible" class="search-results overflow-auto pr-md mr-close-sm basis-100">
            <strong v-if="results.length > 0">
              {{ results.length === 1 ? `${results.length} result` : `${results.length} results` }}
            </strong>
            <div v-else class="flex items-center justify-center basis-100" style="height: 100%">
              <no-results width="65%" />
            </div>
            <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" class="search-result block mt-sm rounded-lg px-base py-base bg-quartz focus:bg-ruby hover:bg-ruby">
              <span class="result-title">{{ post.item.title }}</span>
            </a>
          </div>
          <div v-else class="flex items-center justify-center basis-100 overflow-auto">
            <searching width="65%" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import Searching from '@/static/assets/images/searching.svg'
import NoResults from '@/static/assets/images/noresults.svg'
import Sprite from './Sprite'
import SearchEscape from './SearchEscape'

import * as appConfig from '@/app.config'
const { search, paths } = appConfig

export default {
  components: {
    Sprite,
    Searching,
    NoResults,
    SearchEscape
  },
  created() {
    axios(`/${paths.search.name}`).then(response => {
      this.posts = response.data
    }).catch(error => {
      console.log(error)
    })
  },
  data() {
    return {
      query: '',
      results: [],
      posts: [],
      highlightedIndex: 0,
      searchResultsVisible: false,
      options: search,
      launched: false
    }
  },
  methods: {
    reset() {
      this.query = ''
      this.highlightedIndex = 0
      this.launched = !this.launched
    },
    softReset() {
      this.highlightedIndex = 0
      this.searchResultsVisible = true
    },
    performSearch() {
      this.$search(this.query, this.posts, this.options).then(results => {
        this.results = results
      })
    },
    highlightPrev() {
      if (this.highlightedIndex > 0) {
        this.highlightedIndex = this.highlightedIndex - 1
        this.scrollIntoView()
      }
    },
    highlightNext() {
      if (this.highlightedIndex < this.results.length - 1) {
        this.highlightedIndex = this.highlightedIndex + 1
        this.scrollIntoView()
      }
    },
    scrollIntoView() {
      this.$refs.results.children[this.highlightedIndex].scrollIntoView({ block: 'nearest' })
    },
    launch(e) {
      this.launched = !this.launched

      if (this.launched) {
        this.$nextTick(() => {
          this.$refs.search.focus()
        })
      }
    },
    escapeSearch(e) {
      this.launched = !this.launched
    }
  }
}
</script>
