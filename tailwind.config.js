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
    container: {
      padding: '1rem'
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
        100: '#6fb599',
        200: '#5aab8a',
        300: '#46a07c',
        400: '#31996d',
        500: '#1d8c5f',
        600: '#1b8057',
        700: '#18734e',
        800: '#166646',
        900: '#135a3d',
      },

      gray: {
        100: '#f7fafc',
        200: '#edf2f7',
        300: '#e2e8f0',
        400: '#cbd5e0',
        500: '#a0aec0',
        600: '#718096',
        700: '#4a5568',
        800: '#2d3748',
        900: '#1a202c',
      },
    },
    fontFamily: {
      sans: [
        '"Inter"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen-Sans',
        'Ubuntu',
        'Cantarell',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: [
        '"Roboto Mono"',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
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
  ]
}
