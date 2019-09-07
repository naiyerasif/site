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
        primary: 'var(--bg-background-primary)',
        secondary: 'var(--bg-background-secondary)',
        tertiary: 'var(--bg-background-tertiary)',
        quaternary: 'var(--bg-background-quaternary)'
      },

      copy: {
        primary: 'var(--text-copy-primary)',
        secondary: 'var(--text-copy-hover)',
        tertiary: 'var(--text-copy-tertiary)',
        quaternary: 'var(--text-copy-quaternary)'
      },

      transparent: 'transparent',

      black: '#000',
      white: '#fff',

      green: {
        100: '#73c1ae',
        200: '#5fb8a3',
        300: '#4baf97',
        400: '#37a68c',
        500: '#249e81',
        600: '#219076',
        700: '#1e826a',
        800: '#1b735e',
        900: '#176553',
      },

      gray: {
        100: '#8e8d99',
        200: '#7e7d8b',
        300: '#6e6d7c',
        400: '#5e5d6e',
        500: '#4e4d60',
        600: '#474658',
        700: '#40404f',
        800: '#393946',
        900: '#32323e',
      },
    },
    fontFamily: {
      sans: ['"Inter var"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"',],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: ['"Roboto Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace',],
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
