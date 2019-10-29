module.exports = {
  theme: {
    extend: {
      spacing: {
        '80': '20rem',
        '108': '27rem',
      },
      borderWidth: {
        '20': '20px',
      }
    },
    colors: {
      background: {
        main: 'var(--background-main)',
        postcard: 'var(--background-postcard)',
        hr: 'var(--background-hr)',
        footer: 'var(--background-footer)',
        body: 'var(--background-body)',
        card: 'var(--background-card)',
        code: 'var(--background-code)',
        search: 'var(--background-search)',
        tag: 'var(--background-tag)',
        tagh: 'var(--background-tag-hover)',
      },

      content: {
        header: 'var(--content-header)',
        headerh: 'var(--content-header-hover)',
        footer: 'var(--content-footer)',
        body: 'var(--content-body)',
        tag: 'var(--content-tag)',
        tagh: 'var(--content-tag-hover)',
      },

      transparent: 'transparent',

      black: 'hsl(0, 0%, 0%)',
      white: 'hsl(0, 0%, 100%)',

      primary: {
        '100': 'var(--color-primary-100)',
        '200': 'var(--color-primary-200)',
        '300': 'var(--color-primary-300)',
        '400': 'var(--color-primary-400)',
        '500': 'var(--color-primary-500)',
        '600': 'var(--color-primary-600)',
        '700': 'var(--color-primary-700)',
        '800': 'var(--color-primary-800)',
        '900': 'var(--color-primary-900)',
        'a100': 'var(--color-primary-a100)',
        'a200': 'var(--color-primary-a200)',
        'a300': 'var(--color-primary-a300)',
        'a600': 'var(--color-primary-a600)',
        'a700': 'var(--color-primary-a700)',
        'a800': 'var(--color-primary-a800)',
        'a900': 'var(--color-primary-a900)',
      },

      secondary: {
        '100': 'var(--color-secondary-100)',
        '200': 'var(--color-secondary-200)',
        '300': 'var(--color-secondary-300)',
        '400': 'var(--color-secondary-400)',
        '500': 'var(--color-secondary-500)',
        '600': 'var(--color-secondary-600)',
        '700': 'var(--color-secondary-700)',
        '800': 'var(--color-secondary-800)',
        '900': 'var(--color-secondary-900)',
        'a100': 'var(--color-secondary-a100)',
        'a200': 'var(--color-secondary-a200)',
        'a300': 'var(--color-secondary-a300)',
        'a600': 'var(--color-secondary-a600)',
        'a700': 'var(--color-secondary-a700)',
        'a800': 'var(--color-secondary-a800)',
        'a900': 'var(--color-secondary-a900)',
      },
    },
    fontFamily: {
      sans: ['"Inter var"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"',],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: ['"Iosevka SS05"', '"Roboto Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace',],
    },
    inset: {
      '0': '0',
      auto: 'auto',
      '4': '1rem'
    }
  },
  variants: {
    colors: ['hover', 'focus', 'active']
  },
  plugins: [
    // Some useful comment
  ],
  corePlugins: {
    container: false,
  }
}
