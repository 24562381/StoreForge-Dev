import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#fbf7ee',
          100: '#f5edd7',
          200: '#ebdaa9',
          300: '#dfc276',
          400: '#d2a746',
          500: '#b8892d',
          600: '#9b6c22',
          700: '#7c501e',
          800: '#67411f',
          900: '#56371f',
          950: '#321c0e',
        },
        primary: {
          DEFAULT: '#b8892d',
          dark: '#9b6c22',
          light: '#dfc276',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
