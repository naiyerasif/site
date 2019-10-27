<template>
  <div class="content-wrapper text-content-body bg-background-body leading-normal flex flex-col min-h-screen" :class="theme">
    <header>
      <nav class="container mx-auto flex flex-wrap justify-between items-center py-4 md:py-16">
        <div>
          <g-link to="/"><g-image src="../../static/logo.svg" class="w-40 md:w-56" alt="logo" /></g-link>
        </div>
        <div class="block lg:hidden">
          <button @click="toggle" class="flex items-center px-3 py-2" title="Menu">
            <svg :class="{ hidden: isOpen }" class="current-color h-5 w-5" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M6.961,12l14.039,0"/><path d="M3,6l18,0"/><path d="M10.955,18l10.045,0"/></svg>
            <svg :class="{ hidden: !isOpen }" class="current-color h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <ul class="uppercase tracking-wide font-bold w-full block sm:text-right flex-grow lg:flex lg:flex-initial lg:w-auto items-center mt-8 lg:mt-0" :class="isOpen ? 'block': 'hidden'">
          <li class="mr-0 md:mr-8 mb-6 lg:mb-0">
            <search-input />
          </li>
          <li class="mr-8 mb-6 lg:mb-0">
            <theme-switcher :theme="theme" @themeChanged="updateTheme" />
          </li>
          <li class="mr-8 mb-6 lg:mb-0">
            <g-link to="/references/" class="text-content-header hover:text-content-headerh">References</g-link>
          </li>
          <li class="mr-8 mb-6 lg:mb-0">
            <g-link to="/about/naiyer/" class="text-content-header hover:text-content-headerh">About</g-link>
          </li>
        </ul>
      </nav>
    </header>

    <div class="flex-grow">
      <slot />
    </div>
    
    <footer class="bg-background-footer text-content-footer z-10 decorated-links">
      <div class="container mx-auto flex flex-col lg:flex-row md:items-center justify-between py-8">
        <div class="mb-8 lg:mb-0">
          <div>
            <p>Copyright &copy; {{ year }} Naiyer Asif</p>
            <p>Source licensed
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev/blob/release/LICENSE">MIT</a>, content
            <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a></p>
            <p><a href="/sitemap.xml" title="Sitemap">Sitemap</a> &middot;
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/mflash.dev/issues/new">Report an issue</a></p>
          </div>
        </div>
        <ul class="flex items-center">
          <li class="mr-6">
            <a href="/feed.xml" title="RSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>
            </a>
          </li>

          <li class="mr-6">
            <a href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
            </a>
          </li>

          <li class="mr-6">
            <a href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path></svg>
            </a>
          </li>

          <li>
            <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import SearchInput from "~/components/SearchInput"
import ThemeSwitcher from "~/components/ThemeSwitcher"

export default {
  components: {
    SearchInput,
    ThemeSwitcher
  },
  mounted() {
    this.theme = localStorage.getItem("theme") || "theme-dark";
  },
  data() {
    return {
      isOpen: false,
      theme: ""
    };
  },
  computed: {
    year() {
      return new Date().getFullYear()
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    updateTheme(theme) {
      this.theme = theme;
    }
  }
};
</script>

<style src="../main.css" />
