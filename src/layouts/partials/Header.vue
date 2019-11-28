<template>
  <header class="container header">
    <g-link to="/"><g-image class="brand" src="../../../static/logo.svg" alt="logo" /></g-link>
    <div class="hamburger">
      <a @click="toggle" title="Menu">
        <svg :class="{ hidden: isOpen }" class="icon icon-menu" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M7.028 12H21M3 6h18M11.022 18H21" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        <svg :class="{ hidden: !isOpen }" class="icon icon-minimize" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </a>
    </div>
    <ul :class="isOpen ? 'visible': 'hidden'">
      <li><SearchBox /></li>
      <li><ThemeSwitcher /></li>
      <li><g-link to="/stockpile/">Stockpile</g-link></li>
      <li><g-link to="/about/naiyer/">About</g-link></li>
    </ul>
  </header>
</template>

<script>
import SearchBox from '~/components/SearchBox'
import ThemeSwitcher from '~/components/ThemeSwitcher'

export default {
  components: {
    SearchBox,
    ThemeSwitcher
  },
  data() {
    return {
      isOpen: false
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding-top: $gap;
  padding-bottom: $gap;

  @include tablet-portrait {
    padding-top: $gap-xl;
    padding-bottom: $gap-xl;
  }

  .brand {
    width: $media-ws;

    @include tablet-portrait {
      width: $media-hd;
    }
  }

  .hidden {
    @include phone-only {
      @include hidden;
    }
  }

  .visible {
    @include visible;
  }

  .active {
    font-weight: $font-bold;
  }

  .hamburger {
    @include tablet-portrait {
      @include hidden;
    }

    a {
      display: flex;
      align-items: center;
      outline: none;
      padding: $gap-sm;

      .hidden {
        @include hidden;
      }
    }
  }

  ul {
    text-transform: uppercase;
    letter-spacing: $text-relaxed;
    list-style: none;
    font-weight: $font-bold;
    width: $expanse-full;
    display: block;
    flex-grow: 1;
    align-items: center;

    @include tablet-portrait {
      display: flex;
      flex: 0 1 auto;
      width: auto;
    }

    li {
      margin-left: $gap * 1.5;

      @include phone-only {
        margin-top: $gap;
        margin-left: 0;
      }

      a {
        color: $color-custom;

        &:focus, &:hover {
          color: $color-custom-visited;
        }
      }
    }
  }
}
</style>
