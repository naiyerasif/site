import DefaultLayout from '~/layouts/Default.vue'
import VueScrollTo from 'vue-scrollto'
import VueFuse from 'vue-fuse'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueScrollTo, {
    duration: 500,
    easing: 'ease',
  });

  Vue.use(VueFuse);

  head.meta.push({
    name: 'keywords',
    content: 'Java,Spring,Microservices,Docker,Jenkins,Angular,Node.js'
  });

  head.meta.push({
    name: 'description',
    content: 'Personal website of Naiyer Asif'
  });

  head.meta.push({
    name: 'author',
    content: 'Naiyer Asif'
  });

  head.link.push({
    rel: 'prefetch',
    href: 'https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap'
  });

  head.link.push({
    rel: 'prefetch',
    href: 'https://rsms.me/inter/inter.css'
  });

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap'
  });

  head.link.push({
    rel: 'stylesheet',
    href: 'https://rsms.me/inter/inter.css'
  });
}
