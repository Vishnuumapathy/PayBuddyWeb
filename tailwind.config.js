export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#38BDF8', // Neon Blue
          secondary: '#0EA5E9', // Slightly darker blue for contrast
          success: '#4ADE80',
          error: '#FB7185',
          warning: '#FBBF24',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
        'soft-gradient': 'linear-gradient(to bottom, #F8FAFC, #F1F5F9)',
      }
    },
  },
  plugins: [],
}
