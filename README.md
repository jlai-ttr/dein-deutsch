# Dein Deutsch

> Dein Deutsch, dein Tempo, dein Haus.

A German learning platform for polyglot professionals who want B2 fluency in 24 months — built around the "Master House" UX with 5 core modules.

## Status

**Phase 1.0 MVP** — Daily lessons + SM-2 Vocabulary + Progress tracking

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Mobile:** PWA (installable to home screen) — React Native later
- **Storage:** LocalStorage (Phase 1) → Supabase (Phase 5)
- **Backend:** Next.js API routes
- **Hosting:** Local dev now → Vercel for production

## Modules

| Module | Status | Description |
|---|---|---|
| Heute (Daily) | ✅ Done | Loads `german_dayN.txt` from `workspace-dialga/scripts/` |
| Wörter (Vocab) | ✅ Done | 50 seed cards + SM-2 spaced repetition + custom add |
| Üben (Practice) | ⏳ Phase 1.3 | Quiz modes, fill-in-blank, multiple choice |
| Hören (Listen) | ⏳ Phase 1.4 | Podcast player, dictation |
| Sprechen (Speak) | ⏳ Phase 2 | AI conversation partner |
| Fortschritt (Progress) | ✅ Done | Streak, level, milestones |

## Brand

- **Black + Gold + Cream** — premium, minimal, professional
- **Display font:** Playfair Display (serif)
- **Body font:** Inter (sans-serif)
- **No crown emojis, no Duolingo-owl** — this is for adults building careers

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Structure

```
dein-deutsch/
├── app/
│   ├── page.tsx              # Home (Master House dashboard)
│   ├── heute/page.tsx        # Daily lesson
│   ├── woerter/page.tsx      # Vocab (Anki-style)
│   ├── ueben/page.tsx        # Practice (WIP)
│   ├── hoeren/page.tsx       # Listen (WIP)
│   ├── sprechen/page.tsx     # Speak (WIP)
│   ├── fortschritt/page.tsx  # Progress
│   ├── api/lesson/[day]/route.ts  # Lesson content API
│   ├── layout.tsx
│   └── globals.css
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Daily Lesson Files

Lessons are loaded from `C:\Users\user\.openclaw\workspace-dialga\scripts\german_dayN.txt`.
Currently Days 1–7 exist. Will be expanded to 90 (A1) → 180 (A2) → 90 (B1) → ... across the 730-day plan.

## Roadmap

- **Phase 1.0** (current): Daily lessons + Vocab + Progress — single user, web-only
- **Phase 1.1**: Add Üben module (quiz variations)
- **Phase 1.2**: Add Hören module (audio lessons + dictation)
- **Phase 2 (8 weeks)**: Conversation Studio (AI role-play)
- **Phase 3 (12 weeks)**: Pronunciation Lab
- **Phase 4 (16 weeks)**: React Native mobile app
- **Phase 5 (20 weeks)**: User accounts + Stripe subscriptions
- **Phase 6 (24 weeks)**: Soft launch with 10 beta users

## Spec

See `dein_deutsch_spec.md` in `workspace-dialga/scripts/` for full architecture doc.

---

Built by Dialga 🐉 for Jasper Lai.
