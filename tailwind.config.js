/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ce7c',
        'primary-dark': '#00b569',
        'primary-light': '#33d895',
        secondary: '#1f2937',
        'gray-dark': '#111827',
        'gray-medium': '#6b7280',
        'gray-light': '#f9fafb',
        accent: '#059669',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}