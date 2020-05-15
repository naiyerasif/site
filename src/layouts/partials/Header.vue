<template>
  <header class="header">
    <div class="container">
      <g-link class="brand" aria-label="Microflash logo" to="/">
        <Logo />
      </g-link>
      <g-link class="header-link" to="/collection/">Collection</g-link>
      <g-link class="header-link" to="/profile/naiyer/">About</g-link>
      <Search />
      <ThemeSwitcher />
      <hr class="break" />
    </div>
  </header>
</template>

<script>
import Logo from 'static/favicon.svg'
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
