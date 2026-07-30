// app/sitemap.ts — Auto-generated sitemap for SEO.
// Lists all public routes. /admin/* and /login are excluded (auth-gated).

import type { MetadataRoute } from 'next';

const SITE = 'https://dein-deutsch.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicRoutes = [
    '',           // home
    'heute',
    'woerter',
    'ueben',
    'hoeren',
    'sprechen',
    'lesen',
    'schreiben',
    'grammatik',
    'kultur',
    'translate',
    'fortschritt',
    'profile',
    'settings',
  ];

  return publicRoutes.map((r) => ({
    url: `${SITE}/${r}`,
    lastModified: now,
    changeFrequency: r === '' || r === 'heute' || r === 'woerter' ? 'daily' : 'weekly',
    priority: r === '' ? 1.0 : r === 'heute' || r === 'woerter' ? 0.9 : 0.7,
  }));
}
