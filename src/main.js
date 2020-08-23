import VueFuse from 'vue-fuse'

import '~/assets/styles/main.scss'
import DefaultLayout from '~/layouts/Default.vue'
import * as appConfig from '@/app.config'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueFuse)

  appConfig.headConfig.meta.forEach(e => head.meta.push(e))
  appConfig.headConfig.link.forEach(e => head.link.push(e))
}
