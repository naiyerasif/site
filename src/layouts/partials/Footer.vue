<template>
  <footer class="footer py-far-md text-sm">
    <div class="container px-far-base">
      <div class="sidekick">
        <slot></slot>
        <hr />
      </div>
      <div class="footer-links flex items-center justify-between flex-wrap lg:flex-nowrap mb-lg">
        <ul class="list-none flex flex-wrap lg:flex-nowrap separated">
          <li class="my-xs inline-flex items-center">
            <a class="inline-flex items-center" target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site/issues/new"><Sprite symbol="icon-user-feedback" class="icon-sm mr-ch-sm" />Report an issue</a>
          </li>
          <li class="my-xs inline-flex items-center">
            <a class="inline-flex items-center" href="/feed.xml"><Sprite symbol="icon-rss" class="icon-sm mr-ch-sm" />RSS feed</a>
          </li>
          <li class="my-xs inline-flex items-center">
            <a class="inline-flex items-center" href="/sitemap.xml"><Sprite symbol="icon-sitemap" class="icon-sm mr-ch-sm" />Sitemap</a>
          </li>
          <li class="my-xs inline-flex items-center">
            <a class="inline-flex items-center" target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site"><Sprite symbol="icon-code-file" class="icon-sm mr-ch-sm" />Source code</a>
          </li>
          <li class="my-xs inline-flex items-center">
            <a class="inline-flex items-center" href="/profile/naiyer/#privacy"><Sprite symbol="icon-privacy" class="icon-sm mr-ch-sm" />Privacy</a>
          </li>
        </ul>
        <div class="text-base my-base" style="margin-left: -1ch">
          <a href="https://github.com/naiyerasif" title="GitHub" target="_blank" rel="noopener noreferrer" class="leading-none tappable focus:bg-ruby hover:bg-ruby">
            <Sprite symbol="icon-github" class="icon" />
          </a>
          <a href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer" class="leading-none tappable focus:bg-ruby hover:bg-ruby">
            <Sprite symbol="icon-gitlab" class="icon" />
          </a>
          <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer" class="leading-none tappable focus:bg-ruby hover:bg-ruby">
            <Sprite symbol="icon-twitter" class="icon" />
          </a>
          <a href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer" class="leading-none tappable focus:bg-ruby hover:bg-ruby">
            <Sprite symbol="icon-linkedin" class="icon" />
          </a>
        </div>
      </div>
      <p class="about max-sm"><g-link class="font-bold" to="/">Microflash</g-link> is created, written, and maintained by <g-link to="/profile/naiyer/">Naiyer Asif</g-link>. It's built using <a href="/profile/naiyer/#technologies">Jamstack</a> and deployed on <a target="_blank" rel="noopener noreferrer" href="https://netlify.com/">Netlify</a> with <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site/actions">GitHub Actions</a>.</p>
      <p class="text-xs">Except as otherwise noted, the content of this page is licensed under the <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution 4.0 License</a>, and the source code of this site and the code samples are licensed under the <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/site/blob/main/LICENSE.md">MIT License</a>.</p>
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

<style scoped>
.footer-links ul {
  margin-left: 0;
  margin-bottom: 0;
}
</style>
