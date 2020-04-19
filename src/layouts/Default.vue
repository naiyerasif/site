<template>
  <div class="layout">
    <Logo />
    <SearchBox />
    <Menu />
    <slot></slot>
    <Footer />
  </div>
</template>

<script>
import Logo from './partials/header/Logo'
import SearchBox from './partials/header/SearchBox'
import Menu from './partials/header/Menu'
import Footer from './partials/Footer'

export default {
  components: {
    Logo,
    SearchBox,
    Menu,
    Footer
  }
}
</script>
