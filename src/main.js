import '~/assets/scss/main.scss'
import DefaultLayout from '~/layouts/Default.vue'
import VueFuse from 'vue-fuse'
import VueScrollTo from 'vue-scrollto'
import site from '../data/site.json'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueScrollTo, {
    duration: 500,
    easing: 'ease',
  })

  Vue.use(VueFuse)

  head.meta.push({
    name: 'description',
    content: site.description
  })

  head.meta.push({
    name: 'author',
    content: site.maintainer
  })
}
