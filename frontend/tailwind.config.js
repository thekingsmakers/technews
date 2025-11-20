/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
},
typography: (theme) => ({
  DEFAULT: {
    css: {
      maxWidth: '65ch',
      color: theme('colors.secondary.700'),
      a: {
        color: theme('colors.primary.600'),
        textDecoration: 'none',
        '&:hover': {
          color: theme('colors.primary.700'),
        },
      },
      h1: {
        color: theme('colors.secondary.900'),
        fontFamily: theme('fontFamily.display'),
      },
      h2: {
        color: theme('colors.secondary.900'),
        fontFamily: theme('fontFamily.display'),
      },
      h3: {
        color: theme('colors.secondary.900'),
        fontFamily: theme('fontFamily.display'),
      },
      strong: {
        color: theme('colors.secondary.900'),
      },
      code: {
        color: theme('colors.primary.600'),
        backgroundColor: theme('colors.primary.50'),
        padding: '0.25rem',
        borderRadius: '0.25rem',
        fontWeight: '600',
      },
      'code::before': {
        content: '""',
      },
      'code::after': {
        content: '""',
      },
    },
  },
  dark: {
    css: {
      color: theme('colors.secondary.300'),
      a: {
        color: theme('colors.primary.400'),
        '&:hover': {
          color: theme('colors.primary.300'),
        },
      },
      h1: {
        color: theme('colors.white'),
      },
      h2: {
        color: theme('colors.white'),
      },
      h3: {
        color: theme('colors.white'),
      },
      strong: {
        color: theme('colors.white'),
      },
      code: {
        color: theme('colors.primary.300'),
        backgroundColor: theme('colors.secondary.800'),
      },
    },
  },
}),
    },
  },
plugins: [
  require('@tailwindcss/typography'),
],
}
