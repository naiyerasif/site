<template>
  <div class="search-container">
    <SearchFocal @keyup="focusSearch" />
    <div class="search-box">
      <input type="text" placeholder="Search (Press  &quot;/&quot; to focus)" class="search" v-model="query" @input="softReset" @keyup="performSearch" @keyup.esc="searchResultsVisible = false" @keydown.up.prevent="highlightPrev" @keydown.down.prevent="highlightNext" @keyup.enter="gotoLink" @blur="searchResultsVisible = false" @focus="searchResultsVisible = true" ref="search" aria-label="Search">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-search"><circle cx="11" cy="11" r="8" fill="currentColor" fill-opacity="0.2"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

      <div class="close" v-if="query.length > 0" @click="reset">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-close"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.2"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
      </div>
    </div>
    <transition name="fade">
      <div v-if="query.length > 0 && searchResultsVisible" class="results-container">
        <div class="search-results" ref="results">
          <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" :class="{ 'search-result-highlighted' : index === highlightedIndex }" class="search-result">
            {{ post.item.title }} <span class="search-result-summary">{{ post.item.blurb | clip }} &hellip;</span>
          </a>
          <div v-if="results.length === 0" class="no-result">
            <p>No results for '<strong>{{ query }}</strong>'</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import SearchFocal from './SearchFocal'
import siteConfig from '../../data/site.json'

const searchConfig = siteConfig.searchConfig

export default {
  components: {
    SearchFocal
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
