/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue': {
          50: '#e6f0ff',
          100: '#bdd6ff',
          200: '#94bcff',
          300: '#6ba2ff',
          400: '#4288ff',
          500: '#196eff',
          600: '#0057e7',
          700: '#0043b3',
          800: '#002f80',
          900: '#001a4d',
        },
      },
    },
  },
  plugins: [],
}