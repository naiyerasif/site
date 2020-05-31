<template>
  <footer class="footer">
    <section class="grid-sm">
      <div class="footer-item">
        <h5>Resources</h5>
        <a href="/feed.xml"><Sprite symbol="icon-rss" class="icon-sm gap-end" />RSS feed</a>
        <a href="/sitemap.xml"><Sprite symbol="icon-sitemap" class="icon-sm gap-end" />Sitemap</a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io"><Sprite symbol="icon-code" class="icon-sm gap-end" />Source code</a>
      </div>
      <div class="footer-item">
        <h5>Support</h5>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new"><Sprite symbol="icon-feedback" class="icon-sm gap-end" />Report an issue</a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md"><Sprite symbol="icon-license" class="icon-sm gap-end" />Site license (MIT)</a>
        <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/"><Sprite symbol="icon-license" class="icon-sm gap-end" />Content license (CC by SA)</a>
      </div>
      <div class="footer-item">
        <h5>Connect</h5>
        <section>
          <a class="gap-end" href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-github" class="icon" />
          </a>
          <a class="gap-end" href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-gitlab" class="icon" />
          </a>
          <a class="gap-end" href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-twitter" class="icon" />
          </a>
          <a class="gap-end" href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-linkedin" class="icon" />
          </a>
        </section>
      </div>
    </section>
    <section class="copyright">
      <Favicon alt="logo" />
      <aside>Copyright &copy; {{ year }}, Made with code, <span title="tea">☕</span> &amp; <span class="is-warning" title="love">❤️</span> by <g-link to="/profile/naiyer/">Naiyer Asif</g-link></aside>
    </section>
  </footer>
</template>

<script>
import Sprite from '~/components/Sprite'
import Favicon from '@/static/favicon.svg'

export default {
  components: {
    Sprite,
    Favicon
  },
  computed: {
    year() {
      return new Date().getFullYear()
    }
  }
}
</script>
