import '~/assets/styles/main.scss'

import VueFuse from 'vue-fuse'
import { AllHtmlEntities } from 'html-entities'
import DefaultLayout from '~/layouts/Default.vue'
import siteConfig from '../data/site.json'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  const entities = new AllHtmlEntities()
  Vue.filter('clip', (value) => entities.decode(value.replace(/^(.{225}[^\s]*).*/, '$1')))

  Vue.use(VueFuse)

  head.meta.push({
    name: 'author',
    content: siteConfig.maintainer
  })
}
