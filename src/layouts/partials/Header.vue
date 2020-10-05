<template>
  <header class="header">
    <g-link class="brand is-icon" aria-label="Microflash logo" to="/">
      <Logo />
    </g-link>
    <nav class="menu">
      <g-link to="/blog/">Blog</g-link>
      <g-link to="/profile/naiyer/">About</g-link>
      <ThemeSwitcher />
    </nav>
    <Search />
  </header>
</template>

<script>
import Logo from '@/static/assets/images/logo.svg'
import Search from '~/components/Search'
import ThemeSwitcher from '~/components/ThemeSwitcher'

export default {
  components: {
    Logo,
    Search,
    ThemeSwitcher
  }
}
</script>
