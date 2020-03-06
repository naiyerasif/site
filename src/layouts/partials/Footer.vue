<template>
  <footer class="container footer">
    <section class="grid-md">
      <section class="grid-md-cell">
        <div class="is-lead">Resources</div>
        <nav>
          <div><IconRss class="icon-sm is-separated" /> <a href="/feed.xml">RSS feed</a></div>
          <div><IconMap class="icon-sm is-separated" /> <a href="/sitemap.xml">Sitemap</a></div>
          <div><IconCode class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">Source code</a></div>
        </nav>
      </section>
      <section class="grid-md-cell">
        <div class="is-lead">Support</div>
        <div><IconFeedback class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new">Report an issue</a></div>
        <div><IconLicense class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">Site License (MIT)</a></div>
        <div><IconLicense class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">Content License (CC by SA)</a></div>
      </section>
      <section class="grid-md-cell">
        <div class="is-lead">Connect</div>
        <section>
          <a class="is-separated" href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer">
            <IconGithub class="icon" />
          </a>
          <a class="is-separated" href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer">
            <IconGitlab class="icon" />
          </a>
          <a class="is-separated" href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer">
            <IconTwitter class="icon" />
          </a>
          <a class="is-separated" href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer">
            <IconLinkedin class="icon" />
          </a>
        </section>
      </section>
    </section>
    <section class="copyright" style="  ">
      <Icon alt="logo" width="36" style="margin-top: 1rem" />
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
import Icon from '@/images/icon.svg'
import IconRss from '@/images/icon-rss.svg'
import IconMap from '@/images/icon-map.svg'
import IconCode from '@/images/icon-code.svg'
import IconFeedback from '@/images/icon-feedback.svg'
import IconLicense from '@/images/icon-license.svg'
import IconGithub from '@/images/icon-github.svg'
import IconGitlab from '@/images/icon-gitlab.svg'
import IconTwitter from '@/images/icon-twitter.svg'
import IconLinkedin from '@/images/icon-linkedin.svg'

export default {
  components: {
    Icon,
    IconRss,
    IconMap,
    IconCode,
    IconFeedback,
    IconLicense,
    IconGithub,
    IconGitlab,
    IconTwitter,
    IconLinkedin
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
