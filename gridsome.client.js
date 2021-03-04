const pkg = require('./package.json')

export default function (Vue, options, { head }) {
  head.meta.push(
    { name: 'color-scheme', content: 'dark light' },
    { name: 'author', content: pkg.author },
    { name: 'description', content: pkg.description },
    { name: 'theme-color', content: '#101015' }
  )

  head.link.push(
    { rel: 'icon', href: '/favicon.svg' },
    { rel: 'mask-icon', href: '/mask-icon.svg', color: '#db0b2f' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'preload', href: '/assets/images/icons.svg', type: 'image/svg+xml', as: 'image' }
  )

  if (process.env.NODE_ENV !== 'production') {
    // Only send hits on production builds
    return;
  }

  head.script.push(
    { src: '/assets/js/count.js', async: true, 'data-goatcounter': 'https://mflash.goatcounter.com/count' }
  )
}
