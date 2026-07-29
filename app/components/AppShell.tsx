'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { THEMES, MODULES, FONTS, getTheme } from '../lib/theme';

// Primary nav — top-level modules only
const PRIMARY = [
  { id: 'home',        label: 'Haus',      en: 'Home',      href: '/' },
  { id: 'heute',       label: 'Heute',     en: 'Today',     href: '/heute' },
  { id: 'woerter',     label: 'Wörter',    en: 'Words',     href: '/woerter' },
  { id: 'ueben',       label: 'Üben',      en: 'Practice',  href: '/ueben' },
  { id: 'hoeren',      label: 'Hören',     en: 'Listen',    href: '/hoeren' },
  { id: 'sprechen',    label: 'Sprechen',  en: 'Speak',     href: '/sprechen' },
  { id: 'lesen',       label: 'Lesen',     en: 'Read',      href: '/lesen' },
  { id: 'schreiben',   label: 'Schreiben', en: 'Write',     href: '/schreiben' },
  { id: 'grammatik',   label: 'Grammatik', en: 'Grammar',   href: '/grammatik' },
  { id: 'kultur',      label: 'Kultur',    en: 'Culture',   href: '/kultur' },
  { id: 'fortschritt', label: 'Fortschritt', en: 'Progress', href: '/fortschritt' },
  { id: 'settings', label: 'Settings', en: 'Settings', href: '/settings' },
  { id: 'profile', label: 'Profil', en: 'Profile', href: '/profile' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('dein-deutsch-theme') : null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('dein-deutsch-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [theme]);

  const t = getTheme(theme);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: FONTS.body }}>
      {/* Sticky nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: t.cardBg,
        borderBottom: '1px solid ' + t.border,
        boxShadow: t.shadow,
        transition: 'background 0.2s ease',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 56,
        }}>
          {/* Brand */}
          <Link href="/" style={{
            fontFamily: FONTS.display,
            fontSize: '1.4rem',
            fontWeight: 700,
            color: t.accent,
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            Dein Deutsch
          </Link>

          {/* Primary nav — desktop */}
          <div className="dd-nav-desktop" style={{
            display: 'flex',
            gap: 2,
            marginLeft: 16,
            flex: 1,
            overflowX: 'auto',
          }}>
            {PRIMARY.map(p => {
              const active = pathname === p.href || (p.href !== '/' && pathname?.startsWith(p.href));
              return (
                <Link
                  key={p.id}
                  href={p.href}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? t.onAccent : t.textMuted,
                    background: active ? t.accent : 'transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="dd-menu-btn"
            style={{
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid ' + t.border,
              borderRadius: 6,
              color: t.text,
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
            aria-label="Menu"
          >
            ☰
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid ' + t.border,
              borderRadius: 6,
              color: t.text,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: FONTS.body,
            }}
            title="Toggle theme (T)"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="dd-nav-mobile" style={{
            background: t.cardBg,
            borderTop: '1px solid ' + t.border,
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            {PRIMARY.map(p => {
              const active = pathname === p.href || (p.href !== '/' && pathname?.startsWith(p.href));
              return (
                <Link
                  key={p.id}
                  href={p.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? t.onAccent : t.text,
                    background: active ? t.accent : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  {p.label} <span style={{ color: active ? t.onAccent : t.textMuted, fontSize: '0.8rem', marginLeft: 6 }}>· {p.en}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 900px) {
          .dd-menu-btn { display: none !important; }
        }
        @media (max-width: 899px) {
          .dd-nav-desktop { display: none !important; }
        }
      `}</style>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid ' + t.border,
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: t.textMuted,
        background: t.cardBg,
      }}>
        <div style={{ fontFamily: FONTS.display, fontSize: '1rem', color: t.accent, marginBottom: 4 }}>
          Dein Deutsch, dein Tempo, dein Haus.
        </div>
        <div>Built with care by Alakazam for Jasper · {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
