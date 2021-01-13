module.exports = {
  corePlugins: {
    preflight: false,
    boxShadow: false,
    container: false,
    fontFamily: false,
    inset: false,
  },
  purge: [
    'content/**/*md',
    'src/**/*.scss',
    'src/**/*.vue',
    'src/**/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'lg': { 'min': '900px' },
      'md': { 'max': '600px' },
      'sm': { 'max': '599px' }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: 'var(--brand-primary)',
      secondary: 'var(--brand-secondary)',
      tertiary: 'var(--brand-tertiary)',
      neutral: 'var(--semantic-neutral)',
      deter: 'var(--semantic-deter)',
      positive: 'var(--semantic-positive)',
      warn: 'var(--semantic-warn)',
      inform: 'var(--semantic-inform)',
      urge: 'var(--semantic-urge)',
      quartz: 'var(--decorative-quartz)',
      spinel: 'var(--decorative-spinel)',
      jade: 'var(--decorative-jade)',
      ruby: 'var(--decorative-ruby)',
      opal: 'var(--decorative-opal)',
      gold: 'var(--decorative-gold)',
    },
    spacing: {
      'far-sm': 'var(--far-sm)',
      'far-base': 'var(--far-base)',
      'far-md': 'var(--far-md)',
      'far-lg': 'var(--far-lg)',
      'close-sm': 'var(--close-sm)',
      'close-base': 'var(--close-base)',
      'xs': 'var(--gap-xs)',
      'sm': 'var(--gap-sm)',
      'base': 'var(--gap-base)',
      'md': 'var(--gap-md)',
      'lg': 'var(--gap-lg)',
      'ch-xs': '0.25ch',
      'ch-sm': '0.5ch',
      'ch-base': '1ch',
    },
    fontSize: {
      'xs': 'var(--text-xs)',
      'sm': 'var(--text-sm)',
      'base': 'var(--text-base)',
      'md': 'var(--text-md)',
      'lg': 'calc(1.25rem + 3vw)'
    },
    fontWeight: {
      normal: 'var(--weight-normal)',
      bold: 'var(--weight-bold)',
    },
    letterSpacing: {
      wide: '0.1em',
      wider: '0.2em',
      widest: '0.3em',
    },
    extend: {
      borderWidth: {
        '1': '1px',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
