<template>
  <div class="relative">
    <search-focus @keyup="focusSearch"></search-focus>

    <div class="relative w-80">
      <input
        type="text"
        placeholder="Search (Press  &quot;/&quot; to focus)"
        class="bg-background-search rounded shadow px-4 pl-10 py-2 outline-none w-80"
        v-model="query"
        @input="softReset"
        @keyup="performSearch"
        @keyup.esc="searchResultsVisible = false"
        @keydown.up.prevent="highlightPrev"
        @keydown.down.prevent="highlightNext"
        @keyup.enter="gotoLink"
        @blur="searchResultsVisible = false"
        @focus="searchResultsVisible = true"
        ref="search" aria-labelledby="Search"
      >
      <div class="absolute top-0 ml-3" style="top:8px">
        <svg fill="currentColor" class="text-content-header h-6 w-6" viewBox="0 0 24 24" width="24" height="24"><path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>
      </div>
      <div
        v-if="query.length > 0"
        class="absolute top-0 right-0 text-2xl mr-3 cursor-pointer text-content-header hover:text-content-hheader"
        @click="reset">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
      </div>
    </div>
    <transition name="fade">
      <div v-if="query.length > 0 && searchResultsVisible" class="normal-case absolute left-0 right-0 w-108 text-left mb-4 mt-2 rounded shadow sm:shadow md:shadow-md lg:shadow-lg xl:shadow-xl overflow-hidden z-10 overflow-y-auto" style="max-height: 32rem">
        <div class="flex flex-col" ref="results">
          <a
            v-for="(post, index) in results"
            :key="index"
            :href="post.item.path"
            @click="reset"
            class="bg-background-search font-semibold text-xl cursor-pointer p-4 search-hover"
            :class="{ 'search-highlighted' : index === highlightedIndex }"
          >
            {{ post.item.title }}

            <span class="block font-normal text-sm my-1">{{ post.item.summary }}</span>
          </a>

          <div v-if="results.length === 0" class="bg-background-search font-normal w-full p-4">
            <p class="my-0">No results for '<strong>{{ query }}</strong>'</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import SearchFocus from './SearchFocus'

export default {
  components: {
    SearchFocus,
  },
  created() {
    axios('/search.json').then(response => {
      this.posts = response.data
    })
    .catch(error => {
      console.log(error);
    })
  },
  data() {
    return {
      query: '',
      results: [],
      posts: [],
      highlightedIndex: 0,
      searchResultsVisible: false,
      options: {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.5,
        location: 0,
        distance: 500,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['title', 'summary']
      }
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

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>

