// Forest + Parchment + Ink — theme tokens for Dein Deutsch
// Mirrors the Loft pattern: light + dark, with semantic naming.

export const THEMES = {
  light: {
    name: 'parchment',
    bg: '#F4ECD8',
    cardBg: '#FBF7E9',
    elevatedBg: '#FFFFFF',
    inputBg: '#FFFCF2',
    hoverBg: '#EFE6CD',
    text: '#2A2520',
    textMuted: '#5C5347',
    textFaint: '#8B8170',
    onAccent: '#FBF7E9',
    accent: '#2D5016',
    accentHover: '#1F3A0E',
    accentLight: '#C8D5B9',
    accentSoft: '#E5ECD9',
    border: '#D9CFB8',
    borderStrong: '#B5A88A',
    success: '#4A7C2E',
    warning: '#C2410C',
    error: '#7F1D1D',
    tabBg: '#FBF7E9',
    tabColor: '#5C5347',
    tabActive: '#2D5016',
    tabActiveColor: '#FBF7E9',
    shadow: '0 2px 8px rgba(42, 37, 32, 0.06)',
    shadowStrong: '0 4px 16px rgba(42, 37, 32, 0.10)',
  },
  dark: {
    name: 'midnight-forest',
    bg: '#1A1814',
    cardBg: '#25221D',
    elevatedBg: '#2D2A24',
    inputBg: '#1F1D18',
    hoverBg: '#2A2620',
    text: '#F4ECD8',
    textMuted: '#B8AC92',
    textFaint: '#7A6F5C',
    onAccent: '#F4ECD8',
    accent: '#6B8E4E',
    accentHover: '#7FA85B',
    accentLight: '#2D3A1F',
    accentSoft: '#3A4530',
    border: '#3A332A',
    borderStrong: '#4F4639',
    success: '#7FA85B',
    warning: '#D97757',
    error: '#B85450',
    tabBg: '#25221D',
    tabColor: '#B8AC92',
    tabActive: '#6B8E4E',
    tabActiveColor: '#1A1814',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    shadowStrong: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
};

export const FONTS = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Source Serif Pro', Georgia, serif",
  reading: "'Crimson Text', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

// CEFR levels for the progress tracker
export const CEFR_LEVELS = [
  { code: 'A1', name: 'Beginner',     color: '#C8D5B9', wordsTarget: 700,   days: 90  },
  { code: 'A2', name: 'Elementary',   color: '#A8C088', wordsTarget: 1200,  days: 180 },
  { code: 'B1', name: 'Intermediate', color: '#7FA85B', wordsTarget: 2500,  days: 270 },
  { code: 'B2', name: 'Upper-Int.',   color: '#6B8E4E', wordsTarget: 4000,  days: 360 },
  { code: 'C1', name: 'Advanced',     color: '#4A7C2E', wordsTarget: 5500,  days: 450 },
  { code: 'C2', name: 'Mastery',      color: '#1F3A0E', wordsTarget: 6000,  days: 540 },
];

// Module definitions — used in nav + dashboard
export const MODULES = [
  { id: 'heute',       label: 'Heute',       en: 'Today',    icon: '📖', phase: 1, done: true  },
  { id: 'woerter',     label: 'Wörter',      en: 'Words',    icon: '🪶', phase: 1, done: true  },
  { id: 'ueben',       label: 'Üben',        en: 'Practice', icon: '⚒️', phase: 1, done: false },
  { id: 'hoeren',      label: 'Hören',       en: 'Listen',   icon: '🎧', phase: 1, done: false },
  { id: 'lesen',       label: 'Lesen',       en: 'Read',     icon: '📜', phase: 2, done: false },
  { id: 'schreiben',   label: 'Schreiben',   en: 'Write',    icon: '✒️', phase: 2, done: false },
  { id: 'sprechen',    label: 'Sprechen',    en: 'Speak',    icon: '💬', phase: 2, done: false },
  { id: 'grammatik',   label: 'Grammatik',   en: 'Grammar',  icon: '📐', phase: 3, done: false },
  { id: 'kultur',      label: 'Kultur',      en: 'Culture',  icon: '🏰', phase: 3, done: false },
  { id: 'fortschritt', label: 'Fortschritt', en: 'Progress', icon: '🗺️', phase: 1, done: true  },
];

export function getTheme(theme) {
  return THEMES[theme] || THEMES.light;
}
