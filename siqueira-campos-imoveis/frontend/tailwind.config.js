/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',
          dark: '#000000',
          light: '#333333'
        },
        secondary: {
          DEFAULT: '#ffffff',
          dark: '#e6e6e6',
          light: '#ffffff'
        },
        accent: {
          DEFAULT: '#4a90e2',
          dark: '#357abd',
          light: '#6aa9e9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
