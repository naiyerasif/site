import '~/assets/styles/main.scss'

import VueFuse from 'vue-fuse'
import DefaultLayout from '~/layouts/Default.vue'
import * as appConfig from '../app.config'
import * as processor from '../processor'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  Vue.filter('clip', processor.clip)

  Vue.use(VueFuse)

  head.meta.push({
    name: 'author',
    content: appConfig.maintainer
  })

  head.meta.push({
    name: 'description',
    content: appConfig.description
  })
}
