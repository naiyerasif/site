<template>
  <header class="header">
    <g-link class="brand" aria-label="Microflash logo" to="/">
      <Logo />
    </g-link>
    <g-link to="/notes/">Notes</g-link>
    <g-link to="/projects/">Projects</g-link>
    <g-link to="/profile/naiyer/">About</g-link>
    <ThemeSwitcher />
    <Search />
  </header>
</template>

<script>
import Logo from '@/static/favicon.svg'
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
