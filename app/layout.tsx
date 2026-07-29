import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dein Deutsch',
  description: 'Dein Deutsch — Master German for business and life',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

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
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
