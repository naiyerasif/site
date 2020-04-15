import '~/assets/styles/main.scss'

import VueFuse from 'vue-fuse'
import { AllHtmlEntities } from 'html-entities'
import DefaultLayout from '~/layouts/Default.vue'
import * as appConfig from '../app.config'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  const entities = new AllHtmlEntities()
  Vue.filter('clip', (value, size) => {
    const clipSize = size || 240
    const terminator = '. '
    const lastTerminator = value.indexOf(terminator, clipSize)
    const finalValue = clipSize >= value.length ? value : lastTerminator > 0 ? value.substring(0, lastTerminator) : value.substring(0, value.indexOf(terminator.trim(), clipSize))
    return entities.decode(finalValue)
  })

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
