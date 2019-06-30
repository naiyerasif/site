<template>
  <div class="content-wrapper bg-background-primary font-sans text-copy-primary leading-normal flex flex-col min-h-screen" :class="theme">
    <header class="border-t-20 border-green-500 bg-background-quaternary">
      <nav class="container-inner mx-auto flex flex-wrap justify-between items-center py-8">
        <div>
          <g-link to="/"><g-image src="../../static/logo.svg" class="w-40" alt="logo" /></g-link>
        </div>
        <div class="block lg:hidden">
          <button @click="toggle" class="flex items-center px-3 py-2 border rounded border-gray-500 hover:text-gray-600 hover:border-gray-600">
            <svg class="current-color h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" fill="gray" /></svg>
          </button>
        </div>
        <ul
          class="uppercase tracking-wide font-bold w-full block flex-grow lg:flex lg:flex-initial lg:w-auto items-center mt-8 lg:mt-0"
          :class="isOpen ? 'block': 'hidden'"
        >
          <li class="mr-8 mb-6 lg:mb-0">
            <search-input />
          </li>
          <li class="mr-8 mb-6 lg:mb-0">
            <theme-switcher :theme="theme" @themeChanged="updateTheme" />
          </li>
          <li>
            <g-link to="/about" class="text-copy-primary hover:text-gray-600">About</g-link>
          </li>
        </ul>
      </nav>
    </header>

    <div class="flex-grow">
      <slot/>
    </div>
    <footer class="bg-green-500 text-white z-10">
      <div class="container-inner mx-auto flex flex-col lg:flex-row items-center justify-between py-8">
        <div class="mb-8 lg:mb-0 text-sm">
          <div>Copyright &copy; 2019 &middot; Source licensed <a class="text-white hover:text-gray-400" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE">MIT</a>, content <a class="text-white hover:text-gray-400" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a> &middot; <a href="sitemap.xml" title="Sitemap" class="text-white hover:text-gray-400 font-normal">Sitemap</a></div>
        </div>
        <ul class="flex items-center">
          <li class="mr-8">
            <a href="rss.xml" title="RSS" class="text-white hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
            </a>
          </li>

          <li class="mr-8">
            <a href="https://github.com/Microflash" title="GitHub" target="_blank" class="text-white hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </li>

          <li class="mr-8">
            <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" class="text-white hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </li>
        </ul>
      </div>
    </footer>

    <div style="display:none">
      <svg id="dots-triangle" width="170" height="170" xmlns="http://www.w3.org/2000/svg"><path d="M168.152 170a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm-18.478-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm-18.478 0a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.479a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm-18.479 0a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zM94.24 133.043a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm-18.478 36.956a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm-18.478 55.434a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.479a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm-18.479 73.913a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.479a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm-18.478 92.391a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0 18.479a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.479a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zM1.848 133.044a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.695zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0 18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-55.435a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.479a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.695 1.848 1.848 0 0 1 0 3.695zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696zm0-18.478a1.848 1.848 0 1 1 0-3.696 1.848 1.848 0 0 1 0 3.696z" fill="#2C8056" fill-rule="evenodd" opacity=".503"/></svg>
    </div>
  </div>
</template>

<static-query>
query {
  metaData {
    siteName
  }
}
</static-query>

<script>
import SearchInput from '../components/SearchInput'
import ThemeSwitcher from '../components/ThemeSwitcher'

export default {
  components: {
    SearchInput,
    ThemeSwitcher
  },
  mounted() {
    this.theme = localStorage.getItem('theme') || 'theme-light'
  },
  data() {
    return {
      isOpen: false,
      theme: '',
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    },
    updateTheme(theme) {
      this.theme = theme
    }
  }
}
</script>

<style src="../main.css" />
