import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Forest green — primary identity color
        forest: {
          50:  '#EDFAF3',
          100: '#D0F0E0',
          200: '#A3E0C4',
          300: '#70C9A5',
          400: '#3DAD82',
          500: '#20916A',
          600: '#177554',
          700: '#135E42',
          800: '#114C36',
          900: '#0A2E20',
        },
        // Amber signal — active timer only
        signal: '#C8691B',
        // Warm off-white page background
        paper: '#F5F4F0',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
