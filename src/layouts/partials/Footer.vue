<template>
  <footer class="container grid-md footer">
    <section class="grid-md-cell">
      <div class="is-lead">
        <g-image src="../../../static/assets/images/icon.svg" alt="logo" width="30" /> Copyright &copy; {{ year }}
      </div>
      <ul class="is-footer-list">
        <li>made with code, ☕ &amp; <span class="is-red">❤️</span></li>
        <li>by <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash">Naiyer Asif</a></li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Resources</div>
      <ul class="is-footer-list">
        <li>
          <a href="/feed.xml" title="Sitemap">RSS feed</a>
        </li>
        <li>
          <a href="/sitemap.xml" title="Sitemap">Sitemap</a>
        </li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">Source code</a>
        </li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Support</div>
      <ul class="is-footer-list">
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new">Report an issue</a>
        </li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">Site License (MIT)</a>
        </li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">Content License (CC by SA)</a>
        </li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Connect</div>
      <ul class="is-footer-list is-flex-list">
        <li>
          <a href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" class="icon icon-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="currentColor" fill-opacity="0.2"></path></svg>
          </a>
        </li>
        <li>
          <a href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" class="icon icon-gitlab"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" fill="currentColor" fill-opacity="0.2"></path></svg>
          </a>
        </li>
        <li>
          <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" class="icon icon-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" fill="currentColor" fill-opacity="0.2"></path></svg>
          </a>
        </li>
      </ul>
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
export default {
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
