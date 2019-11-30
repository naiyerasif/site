<template>
  <div class="search">
    <SearchFocus @keyup="focusSearch" />
    <div class="search-box">
      <input type="text" placeholder="Search (Press  &quot;/&quot; to focus)" class="search-input" v-model="query" @input="softReset" @keyup="performSearch" @keyup.esc="searchResultsVisible = false" @keydown.up.prevent="highlightPrev" @keydown.down.prevent="highlightNext" @keyup.enter="gotoLink" @blur="searchResultsVisible = false" @focus="searchResultsVisible = true" ref="search" aria-label="Search">

      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-search" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>

      <div class="close" v-if="query.length > 0" @click="reset">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-close" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" opacity=".3"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
      </div>
    </div>
    <transition name="fade">
      <div v-if="query.length > 0 && searchResultsVisible" class="search-results">
        <div class="search-result" ref="results">
          <a v-for="(post, index) in results" :key="index" :href="post.item.path" @click="reset" :class="{ 'search-highlighted' : index === highlightedIndex }" class="search-item">
            {{ post.item.title }} <span class="search-item-summary">{{ post.item.summary.substr(0, post.item.summary.lastIndexOf(' ', 180)) + ' …' }}</span>
          </a>

          <div v-if="results.length === 0" class="no-item">
            <p>No results for '<strong>{{ query }}</strong>'</p>
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
      options: {
        shouldSort: true,
        includeMatches: true,
        tokenize: true,
        matchAllTokens: true,
        threshold: 0.4,
        location: 0,
        distance: 600,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['title','summary']
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

<style lang="scss" scoped>
.search {
  position: relative;

  .search-box {
    position: relative;

    .search-input {
      background-color: var(--background-search);
      border-radius: $radius;
      box-shadow: $shadow;
      padding: $gap-sm $gap;
      padding-left: $gap-lg;
      outline: none;
      width: $expanse-full;
      border: none;

      &:focus, &:hover {
        background-color: var(--background-search-hover);
      }

      @include tablet-landscape {
        width: $expanse-md;
      }
    }

    .icon-search, .icon-close {
      position: absolute;
      top: $gap-xs;
      color: $color-custom;

      &:focus, &:hover {
        color: $color-custom-visited;
      }
    }

    .icon-search {
      left: $gap-sm;
    }

    .icon-close {
      right: $gap-sm;
    }
  }
}

.search-results {
  position: absolute;
  z-index: $rise-md;
  left: $gap-0;
  right: $gap-0;
  width: $expanse-full;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: $gap-xl * 8;
  box-shadow: $shadow;
  margin-top: $gap-xs;
  border-radius: $radius;

  @include tablet-landscape {
    width: $expanse-lg;
    box-shadow: $shadow-md;
  }

  @include desktop-mdpi {
    box-shadow: $shadow-lg;
  }

  @include desktop-hdpi {
    box-shadow: $shadow-xl;
  }

  .search-result {
    display: flex;
    flex-direction: column;
    background-color: var(--background-search);

    .search-item, .no-item {
      padding: $gap;
      line-height: 1.25em;
    }

    .search-item {
      font-size: $text-md;
      font-weight: $font-bold;
      color: $color-link;
      cursor: pointer;
      border-bottom: 1px solid var(--border-muted);

      &:last-child {
        border-bottom: none;
      }

      &:focus, &:hover {
        background-color: var(--background-search-hover);
        color: $color-visited-link;

        .search-item-summary {
          color: var(--text-default);
        }
      }

      .search-item-summary {
        display: block;
        margin-top: $gap-sm;
        font-size: $text-sm;
        font-weight: $font-normal;
        line-height: 1.5em;
        color: var(--text-search-muted);
      }
    }

    .search-highlighted {
      background-color: var(--background-search-hover);
    }

    .no-item {
      width: $expanse-full;
      font-weight: $font-normal;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
