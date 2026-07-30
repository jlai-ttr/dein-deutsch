// app/robots.ts — Robots.txt for SEO.
// Allows all crawlers on public routes, blocks /admin/ and /api/.

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login'],
      },
    ],
    sitemap: 'https://dein-deutsch.vercel.app/sitemap.xml',
    host: 'https://dein-deutsch.vercel.app',
  };
}
