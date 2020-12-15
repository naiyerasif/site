import VueFuse from 'vue-fuse'

import '~/assets/styles/main.scss'
import DefaultLayout from '~/layouts/Default.vue'
import * as appConfig from '@/app.config'

const { meta, link } = appConfig.head

export default function (Vue, { head }) {
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueFuse)

  head.meta.push(...meta)
  head.link.push(...link)
}
