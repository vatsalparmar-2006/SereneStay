/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#e0fbfc',
          100: '#caf0f8',
          200: '#90e0ef',
          300: '#48cae4',
          400: '#00b4d8',
          500: '#0096c7',
          600: '#0077b6',
          700: '#023e8a',
          800: '#03045e',
          900: '#001a4d',
        },
      },
      fontFamily: {
        sans: ['Roboto', '"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
