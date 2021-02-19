import VueFuse from 'vue-fuse'

import '~/assets/styles/main.scss'
import DefaultLayout from '~/layouts/Default.vue'

export default function (Vue, { head }) {
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueFuse)
}
