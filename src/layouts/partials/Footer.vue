<template>
  <footer class="container footer">
    <section class="grid-sm">
      <section class="grid-sm-cell">
        <div class="is-lead">Resources</div>
        <nav>
          <div><Sprite symbol="icon-rss" class="icon-sm is-separated" /> <a href="/feed.xml">RSS feed</a></div>
          <div><Sprite symbol="icon-map" class="icon-sm is-separated" /> <a href="/sitemap.xml">Sitemap</a></div>
          <div><Sprite symbol="icon-code" class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">Source code</a></div>
        </nav>
      </section>
      <section class="grid-sm-cell">
        <div class="is-lead">Support</div>
        <div><Sprite symbol="icon-feedback" class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new">Report an issue</a></div>
        <div><Sprite symbol="icon-license" class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">Site license (MIT)</a></div>
        <div><Sprite symbol="icon-license" class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">Content license (CC by SA)</a></div>
      </section>
      <section class="grid-sm-cell">
        <div class="is-lead">Connect</div>
        <section>
          <a class="is-separated" href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-github" class="icon" />
          </a>
          <a class="is-separated" href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-gitlab" class="icon" />
          </a>
          <a class="is-separated" href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-twitter" class="icon" />
          </a>
          <a class="is-separated" href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-linkedin" class="icon" />
          </a>
        </section>
      </section>
    </section>
    <section class="copyright" style="  ">
      <Favicon alt="logo" width="40" style="margin-top: 1rem" />
      <div>Copyright &copy; {{ year }}, Made with code, <span title="tea">☕</span> &amp; <span class="is-warning" title="love">❤️</span> by <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash">Naiyer Asif</a></div>
    </section>
  </footer>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import Sprite from '~/components/Sprite'
import Favicon from '@/images/favicon.svg'

export default {
  components: {
    Sprite,
    Favicon
  },
  computed: {
    year() {
      return new Date().getFullYear()
    },
    name() {
      return this.$static.metadata.siteName.toLowerCase()
    }
  }
}
</script>
