<template>
  <footer class="container grid-md footer">
    <section class="grid-md-cell">
      <div class="is-lead">
        <Icon alt="logo" width="30" class="is-separated" /> Copyright &copy; {{ year }}
      </div>
      <ul class="is-footer-list">
        <li>made with code, <span title="tea">☕</span> &amp; <span class="is-red" title="love">❤️</span></li>
        <li>by <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash">Naiyer Asif</a></li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Resources</div>
      <ul class="is-footer-list">
        <li>
          <IconRss class="icon-sm is-separated" /> <a href="/feed.xml">RSS feed</a>
        </li>
        <li>
          <IconMap class="icon-sm is-separated" /> <a href="/sitemap.xml">Sitemap</a>
        </li>
        <li>
          <IconCode class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io">Source code</a>
        </li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Support</div>
      <ul class="is-footer-list">
        <li>
          <IconFeedback class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/issues/new">Report an issue</a>
        </li>
        <li>
          <IconLicense class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://github.com/Microflash/microflash.github.io/blob/release/LICENSE.md">Site License (MIT)</a>
        </li>
        <li>
          <IconLicense class="icon-sm is-separated" /> <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0/">Content License (CC by SA)</a>
        </li>
      </ul>
    </section>
    <section class="grid-md-cell">
      <div class="is-lead">Connect</div>
      <ul class="is-footer-list is-flex-list">
        <li>
          <a href="https://github.com/Microflash" title="GitHub" target="_blank" rel="noopener noreferrer" class="is-separated">
            <IconGithub class="icon" />
          </a>
        </li>
        <li>
          <a href="https://gitlab.com/Microflash" title="GitLab" target="_blank" rel="noopener noreferrer" class="is-separated">
            <IconGitlab class="icon" />
          </a>
        </li>
        <li>
          <a href="https://twitter.com/Microflash" title="Twitter" target="_blank" rel="noopener noreferrer" class="is-separated">
            <IconTwitter class="icon" />
          </a>
        </li>
        <li>
          <a href="https://in.linkedin.com/in/naiyerasif" title="LinkedIn" target="_blank" rel="noopener noreferrer" class="is-separated">
            <IconLinkedin class="icon" />
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
import Icon from '~/assets/images/icon.svg'
import IconRss from '~/assets/images/icon-rss.svg'
import IconMap from '~/assets/images/icon-map.svg'
import IconCode from '~/assets/images/icon-code.svg'
import IconFeedback from '~/assets/images/icon-feedback.svg'
import IconLicense from '~/assets/images/icon-license.svg'
import IconGithub from '~/assets/images/icon-github.svg'
import IconGitlab from '~/assets/images/icon-gitlab.svg'
import IconTwitter from '~/assets/images/icon-twitter.svg'
import IconLinkedin from '~/assets/images/icon-linkedin.svg'

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
