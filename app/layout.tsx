import './globals.css';
import type { Metadata, Viewport } from 'next';
import AppShell from './components/AppShell';

const SITE_URL = 'https://dein-deutsch.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Dein Deutsch — Dein Tempo, Dein Haus',
    template: '%s · Dein Deutsch',
  },
  description:
    'Master German from zero to C2 with the Master House method — daily lessons, SM-2 spaced vocabulary, and progress tracking. Forest + Parchment + Ink. No Duolingo owl.',
  keywords: [
    'German learning',
    'Deutsch lernen',
    'B2 German',
    'CEFR levels',
    'spaced repetition',
    'SM-2',
    'German vocabulary',
    'Master House',
  ],
  authors: [{ name: 'Jasper Lai' }],
  creator: 'Jasper Lai',
  publisher: 'Dein Deutsch',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      de: '/?lang=de',
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dein Deutsch',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'de_DE',
    url: SITE_URL,
    siteName: 'Dein Deutsch',
    title: 'Dein Deutsch — Dein Tempo, Dein Haus',
    description:
      'Master German from zero to C2. Forest + Parchment + Ink. The Master House method.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dein Deutsch — Master House',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dein Deutsch — Dein Tempo, Dein Haus',
    description: 'Master German from zero to C2 with the Master House method.',
    images: ['/og-image.png'],
    creator: '@trendyzonemy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
};

export const viewport: Viewport = {
  themeColor: '#2D5016',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// No SSR theme flash — script runs before paint
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('dein-deutsch-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=Crimson+Text:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
