<template>
  <div class="search-container">
    <SearchFocal @keyup="focusSearch" />
    <div class="search-box">
      <input type="text" placeholder="Search (Press  &quot;/&quot; to focus)" class="search" v-model="query" @input="softReset" @keyup="performSearch" @keyup.esc="searchResultsVisible = false" @keydown.up.prevent="highlightPrev" @keydown.down.prevent="highlightNext" @keyup.enter="gotoLink" @blur="searchResultsVisible = false" @focus="searchResultsVisible = true" ref="search" aria-label="Search">

      <IconSearch class="icon icon-search" />

      <div class="close" v-if="query.length > 0" @click="reset">
        <IconClose class="icon icon-close" />
      </div>
    </div>
    <transition name="fade">
      <div v-if="query.length > 0 && searchResultsVisible" class="results-container">
        <div class="search-results" ref="results">
          <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" :class="{ 'search-result-highlighted' : index === highlightedIndex }" class="search-result">
            <span class="search-result-title">{{ post.item.title }}</span>
            <span class="search-result-summary">{{ post.item.blurb | clip }} &hellip;</span>
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
import IconSearch from '~/assets/images/icon-search.svg'
import IconClose from '~/assets/images/icon-close.svg'
import siteConfig from '../../data/site.json'

const searchConfig = siteConfig.searchConfig

export default {
  components: {
    SearchFocal,
    IconSearch,
    IconClose
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
