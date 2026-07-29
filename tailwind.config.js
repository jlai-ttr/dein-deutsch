/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Forest + Parchment + Ink — "Old book in a cabin"
        // Light mode
        parchment:   '#F4ECD8',
        'parchment-edge': '#D9CFB8',
        'cream-paper': '#FBF7E9',
        'ink-black':  '#2A2520',
        'faded-ink':  '#5C5347',
        forest:      '#2D5016',
        'deep-moss': '#1F3A0E',
        sage:        '#C8D5B9',
        'leaf-green': '#4A7C2E',
        terracotta:  '#C2410C',
        wine:        '#7F1D1D',
        // Dark mode
        'midnight-forest': '#1A1814',
        'deep-bark':       '#25221D',
        'dark-bark':       '#3A332A',
        moss:             '#6B8E4E',
        fern:             '#7FA85B',
        'dusty-gold':     '#B8AC92',
        'autumn-leaf':    '#D97757',
        berry:            '#B85450',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif:   ['"Source Serif Pro"', 'Georgia', 'serif'],
        body:    ['"Source Serif Pro"', 'Georgia', 'serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
        reading: ['"Crimson Text"', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'page': '0 1px 3px rgba(42, 37, 32, 0.08), 0 1px 2px rgba(42, 37, 32, 0.04)',
        'card': '0 2px 8px rgba(42, 37, 32, 0.06), 0 1px 2px rgba(42, 37, 32, 0.04)',
        'raised': '0 4px 16px rgba(42, 37, 32, 0.10), 0 2px 4px rgba(42, 37, 32, 0.06)',
      },
    },
  },
  plugins: [],
};
