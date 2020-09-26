<template>
  <footer class="footer">
    <div class="footer-grid">
      <nav class="footer-menu">
        <div class="footer-title">Resources</div>
        <a href="/feed.xml"><Sprite symbol="icon-rss" class="icon-sm gap-ch" />RSS feed</a>
        <a href="/sitemap.xml"><Sprite symbol="icon-sitemap" class="icon-sm gap-ch" />Sitemap</a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site"><Sprite symbol="icon-file-source" class="icon-sm gap-ch" />Source code</a>
      </nav>
      <nav class="footer-menu">
        <div class="footer-title">Support</div>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site/issues/new"><Sprite symbol="icon-feedback" class="icon-sm gap-ch" />Report an issue</a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site/blob/release/LICENSE.md"><Sprite symbol="icon-license" class="icon-sm gap-ch" />Site license (MIT)</a>
        <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/"><Sprite symbol="icon-license" class="icon-sm gap-ch" />Content license (CC by SA)</a>
      </nav>
      <nav class="footer-menu">
        <div class="footer-title">Connect</div>
        <div class="network">
          <a href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-github" class="icon-rg" />
          </a>
          <a href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-gitlab" class="icon-rg" />
          </a>
          <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-twitter" class="icon-rg" />
          </a>
          <a href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer">
            <Sprite symbol="icon-linkedin" class="icon-rg" />
          </a>
        </div>
      </nav>
    </div>
    <div class="copyright">
      <Favicon alt="logo" class="brand gap-ch" />
      <span>&copy; {{ year }} &mdash; <g-link to="/profile/naiyer/">Naiyer Asif</g-link></span>
    </div>
  </footer>
</template>

<script>
import Sprite from '~/components/Sprite'
import Favicon from '@/static/favicon.svg'
import dayjs from 'dayjs'

export default {
  components: {
    Sprite,
    Favicon
  },
  computed: {
    year() {
      return dayjs().year()
    }
  }
}
</script>
