/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coach olive green color palette
        primary: {
          50: '#f4f7e9',
          100: '#e5edc9',
          200: '#d0dea3',
          300: '#b8cd79',
          400: '#9fbf4f',
          500: '#669900',  // Main Coach olive green
          600: '#527a00',
          700: '#3d5c00',
          800: '#293d00',
          900: '#141f00',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#e1e8ed',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#7f8c8d',
          600: '#486581',
          700: '#334e68',
          800: '#2c3e50',
          900: '#102a43',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Coach brand colors
        coach: {
          olive: '#669900',
          'olive-light': 'rgba(102, 153, 0, 0.1)',
          'olive-dark': '#527a00',
        }
      },
      fontFamily: {
        sans: ['Schibsted Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Schibsted Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      },
    },
  },
  plugins: [],
}
