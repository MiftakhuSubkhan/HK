/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tempo: {
          dark: '#0a492d',       // Deep emerald header in mockup
          primary: '#0d5c3a',    // Emerald green
          hover: '#09442a',
          light: '#eaf4ee',      // Soft mint background card
          subtle: '#f4f8f5',     // Light background
          border: '#d6e8dd',
          accent: '#e77a1f',     // Warning / Due orange
          accentLight: '#fef3e9',
          danger: '#dc2626',     // Red H-2 badge
          dangerLight: '#fee2e2',
          yellow: '#d97706',
          yellowLight: '#fef3c7',
          success: '#15803d',
          successLight: '#dcfce7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'phone': '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 12px #1f2937, 0 0 0 14px #374151',
      }
    },
  },
  plugins: [],
};
