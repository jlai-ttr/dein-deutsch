/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'eagle': '#1cb0f6',
        'frog': '#58cc02',
        'flame': '#ff9600',
        'heart': '#ff4b4b',
        'gold': '#ffc800',
        'cream': '#f7f7f7',
        'duo-gray': '#4b4b4b',
        'epic': '#ce82ff',
      },
      fontFamily: {
        'sans': ['Nunito', 'system-ui', 'sans-serif'],
        'display': ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
