<template>
  <div class="search-container">
    <SearchFocal @keyup="focusSearch" />
    <div class="search-box" :class="{ 'remove-bottom-border' : searchResultsVisible && query.length > 0 }">
      <input type="text" placeholder="Search (Press  &quot;/&quot; to focus)" class="search" v-model="query" @input="softReset" @keyup="performSearch" @keyup.esc="searchResultsVisible = false" @keydown.up.prevent="highlightPrev" @keydown.down.prevent="highlightNext" @keyup.enter="gotoLink" @blur="searchResultsVisible = false" @focus="searchResultsVisible = true" ref="search" aria-label="Search">

      <transition name="slide-up" mode="out-in">
        <IconSearch class="icon icon-search" v-if="query.length < 1" />
        <IconClear v-if="query.length > 0" @click="reset" class="icon icon-clear" />
      </transition>
    </div>
    <transition name="fade">
      <div v-if="query.length > 0 && searchResultsVisible" class="results-container" :class="{ 'remove-top-border' : searchResultsVisible }">
        <div class="search-results" ref="results">
          <section class="results-label">
            {{ results.length > 0 ? results.length === 1 ? `${results.length} result` : `${results.length} results` : `No results for "${this.query}"` }}
          </section>
          <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" :class="{ 'search-result-highlighted' : index === highlightedIndex }" class="search-result">
            <span class="search-result-title">{{ post.item.title }}</span>
            <span class="search-result-excerpt">{{ post.item.excerpt | clip }} &hellip;</span>
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import SearchFocal from './SearchFocal'
import IconSearch from '@/images/icon-search.svg'
import IconClear from '@/images/icon-clear.svg'
import * as appConfig from '../../app.config'

const searchConfig = appConfig.searchConfig

export default {
  components: {
    SearchFocal,
    IconSearch,
    IconClear
  },
  created() {
    axios(`/${searchConfig.file.name}`).then(response => {
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
      options: searchConfig.options
    }
  },
  methods: {
    reset() {
      this.query = ''
      this.highlightedIndex = 0
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
    gotoLink() {
      if (this.results[this.highlightedIndex]) {
        window.location = this.results[this.highlightedIndex].item.path
      }
    },
    focusSearch(e) {
      if (e.key === '/') {
        this.$refs.search.focus()
      }
    }
  }
}
</script>
