<template>
  <div class="search flex items-center">
    <a class="tappable bg-quartz no-underline focus:bg-ruby hover:bg-ruby focus:no-underline hover:no-underline" role="button" :aria-label="'Show posts for ' + query" @click="launch">{{ query }}</a>
    <transition name="dissolve" mode="out-in">
      <div v-if="launched" class="search-modal tracking-normal text-base font-normal normal-case fixed inset-0 z-50">
        <search-escape @keyup.esc="escapeSearch" />
        <div class="search-panel fixed inset-0 overflow-hidden flex flex-col shadow border-1 border-solid border-spinel rounded-2xl bg-tertiary my-far-md mx-auto px-far-sm py-far-sm max-w-4xl max-h-4xl">
          <div class="search-box flex items-center justify-between">
            <Icon symbol="icon-tag" class="icon text-primary" />
            <div class="flex-1 mx-base">
              <strong class="text-sm uppercase tracking-wide">{{ query }}</strong>
            </div>
            <a role="button" aria-label="Reset search" @click="reset" class="search-reset leading-none text-sm tracking-wide font-bold focus:no-underline hover:no-underline">
              <kbd class="tappable focus:bg-ruby hover:bg-ruby">esc</kbd>
            </a>
          </div>
          <hr class="my-lg" />
          <div v-if="searchResultsVisible" class="search-results overflow-auto pr-md mr-close-sm basis-100" ref="results">
            <strong class="text-neutral" v-if="results.length > 0">
              {{ results.length === 1 ? `${results.length} related post` : `${results.length} related posts` }}
            </strong>
            <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" class="search-result block mt-sm rounded-lg px-base py-base bg-quartz focus:bg-ruby hover:bg-ruby">
              <span class="result-title">{{ post.item.title }}</span>
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import Icon from './Icon'
import SearchEscape from './SearchEscape'

export default {
  props: {
    keyword: {
      type: String,
      required: true
    }
  },
  components: {
    Icon,
    SearchEscape
  },
  created() {
    this.query = this.keyword
    axios('/search.json').then(response => {
      this.posts = response.data
      this.$search(this.query, this.posts, this.keys).then(results => {
        this.results = results
        this.highlightedIndex = 0
        this.searchResultsVisible = true
      })
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
      launched: false,
      keys: [
        'tags'
      ]
    }
  },
  methods: {
    reset() {
      this.highlightedIndex = 0
      this.launched = !this.launched
    },
    scrollIntoView() {
      this.$refs.results.children[this.highlightedIndex].scrollIntoView({ block: 'nearest' })
    },
    launch(e) {
      this.launched = !this.launched
    },
    escapeSearch(e) {
      this.launched = !this.launched
    }
  }
}
</script>
