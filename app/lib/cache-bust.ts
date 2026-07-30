// app/lib/cache-bust.ts
// Invalidate Next.js ISR caches for the public read endpoints.
// Called by every admin write route so /woerter reflects Sheet changes immediately
// instead of waiting up to 1 hour for `revalidate = 3600` to expire.
//
// Uses revalidatePath because the read endpoints are simple GET routes (no fetch tags).
// revalidatePath('/api/vocab') purges the ISR cache for that route, so the next GET
// triggers a fresh Sheet fetch via googleapis.

import { revalidatePath } from 'next/cache';

const CACHE_PATHS = [
  '/api/vocab',
  '/api/wort-des-tages',
] as const;

/**
 * Bust the ISR cache for the Sheet-backed read endpoints.
 * Safe to call from any route — no-op if the path isn't cached.
 */
export function bustSheetCaches(): { path: string; revalidated: boolean }[] {
  const out: { path: string; revalidated: boolean }[] = [];
  for (const path of CACHE_PATHS) {
    try {
      revalidatePath(path);
      out.push({ path, revalidated: true });
    } catch {
      out.push({ path, revalidated: false });
    }
  }
  return out;
}
