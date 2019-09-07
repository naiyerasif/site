<template>
  <div class="content-wrapper bg-background-body text-content-body font-sans leading-normal flex flex-col min-h-screen" :class="theme">
    <header class="bg-background-header">
      <nav class="container mx-auto flex flex-wrap justify-between items-center md:py-16 py-4">
        <div>
          <g-link to="/"><g-image src="../../static/logo.svg" class="w-56" alt="logo" /></g-link>
        </div>
        <div class="block lg:hidden">
          <button @click="toggle" class="flex items-center px-3 py-2 hover:text-gray-600">
            <svg class="current-color h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" fill="gray" /></svg>
          </button>
        </div>
        <ul class="uppercase tracking-wide font-bold w-full block sm:text-right flex-grow lg:flex lg:flex-initial lg:w-auto items-center mt-8 lg:mt-0" :class="isOpen ? 'block': 'hidden'">
          <li class="mr-8 mb-6 lg:mb-0">
            <search-input />
          </li>
          <li class="mr-8 mb-6 lg:mb-0">
            <theme-switcher :theme="theme" @themeChanged="updateTheme" />
          </li>
          <li class="nav dropdown">
            <ul class="menu">
              <li class="menu-item has-children">
                <a class="text-content-header hover:text-content-hheader" href>
                  <span class="mt-1">Menu</span>
                  <span class="dropdown-icon"></span>
                </a>
                <ul class="sub-menu md:bg-background-header md:rounded-lg md:shadow-xl">
                  <li class="menu-item"><g-link to="/tag/guide" class="text-content-header hover:text-content-hheader">Guides</g-link></li>
                  <li class="menu-item"><g-link to="/references" class="text-content-header hover:text-content-hheader">References</g-link></li>
                  <li class="menu-item border-b border-gray-500 opacity-25 pt-1 mb-1"></li>
                  <li class="menu-item">
                    <g-link to="/about/naiyer" class="text-content-header hover:text-content-hheader">About</g-link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>

    <div class="flex-grow">
      <slot />
    </div>
    <footer class="bg-background-footer text-content-footer z-10 md:py-6 decorated-links">
      <div class="container mx-auto flex flex-col lg:flex-row items-center justify-between py-8">
        <div class="mb-8 lg:mb-0">
          <div>Copyright &copy; {{ year }} &middot; Source licensed
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE">MIT</a>, content
            <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">CC by SA</a> &middot;
            <a href="sitemap.xml" title="Sitemap">Sitemap</a> &middot;
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new">Report an issue</a>
          </div>
        </div>
        <ul class="flex items-center">
          <li class="mr-6">
            <a href="feed.xml" title="RSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>
            </a>
          </li>

          <li class="mr-6">
            <a href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
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
  metaData {
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
    this.theme = localStorage.getItem("theme") || "theme-light";
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

<style scoped>
.menu .menu-item.has-children,
.menu .menu-item.has-children .menu-item {
  position: relative;
}
.menu .menu-item a {
  padding: 0.5em 0.75em;
  border: 0 !important;
  display: flex;
  justify-content: space-between;
}
.menu .sub-menu {
  opacity: 0;
  height: 0;
  width: 0;
  transition: visibility 0.25s, opacity 0.25s ease-in-out;
}
.menu .sub-menu,
.menu .sub-menu .menu-item {
  visibility: hidden;
}
.menu .menu-item:active > .sub-menu,
.menu .menu-item:focus > .sub-menu,
.menu .menu-item:hover > .sub-menu {
  opacity: 1;
  height: auto;
  width: auto;
}
.menu .menu-item:active > .sub-menu,
.menu .menu-item:active > .sub-menu .menu-item,
.menu .menu-item:focus > .sub-menu,
.menu .menu-item:focus > .sub-menu .menu-item,
.menu .menu-item:hover > .sub-menu,
.menu .menu-item:hover > .sub-menu .menu-item {
  visibility: visible;
}
.menu .menu-item > a:active .dropdown-icon:after,
.menu .menu-item > a:focus .dropdown-icon:after,
.menu .menu-item > a:hover .dropdown-icon:after {
  transform: rotate(45deg);
}
.menu .dropdown-icon {
  padding: 1em 1.25em;
  margin: -1em -1em -1em 0.5em;
}
.menu .dropdown-icon:after {
  content: "+";
  font-size: 1.5rem;
  display: block;
  transition: transform 0.25s ease-in-out;
}
.dropdown {
  direction: rtl;
  unicode-bidi: bidi-override;
}
.dropdown .menu .dropdown-icon {
  margin: -1.25em 0.5em -1em -2em;
}
@media only screen and (min-width: 1024px) {
  .nav .menu {
    display: flex;
    flex-flow: row wrap;
  }
  .nav .menu > .menu-item > a .dropdown-icon {
    padding-left: 0;
  }
  .nav .menu .menu-item:active > .sub-menu,
  .nav .menu .menu-item:focus > .sub-menu,
  .nav .menu .menu-item:hover > .sub-menu {
    padding: 0.5em;
    width: 175px;
  }
  .nav .menu .sub-menu {
    position: absolute;
    z-index: 3000;
    top: 100%;
    left: 0;
  }
  .nav .menu .sub-menu .sub-menu {
    top: 0;
    left: 100%;
  }
  .nav .menu .dropdown-icon {
    padding: 1em;
  }
  .dropdown .menu > .menu-item > a .dropdown-icon {
    padding-left: 1em;
    padding-right: 0;
  }
  .dropdown .menu .sub-menu {
    top: 100%;
    left: auto;
    right: 0;
  }
  .dropdown .menu .sub-menu .sub-menu {
    left: auto;
    right: 100%;
  }
}
</style>
