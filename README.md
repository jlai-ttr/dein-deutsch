# Dein Deutsch

> Dein Deutsch, dein Tempo, dein Haus.

A German learning platform for polyglot professionals targeting B2 fluency in 24 months — built around the **Master House** UX with 5 core modules.

## Status

**Phase 1.5 (live)** — Daily lessons + SM-2 Vocabulary + Sheet-backed editor + Progress

| Layer | Status | What |
|-------|--------|------|
| Layer 14 | ✅ Live | Google Sheets read API (`/api/vocab`, `/api/wort-des-tages`) + client hook |
| Layer 15 | ✅ Live | `/admin/vocab` editor — table view, filters, edit/save/delete, bulk paste |
| Layer 16.1 | ⏸ Deferred | Vercel Cron (requires Pro plan — Hobby free tier blocks cron config) |
| Layer 16.2 | ✅ Live | Cache invalidation on every admin write (`revalidatePath`) |
| Layer 17.A | 🚧 This release | Meta + polish — error/404/loading pages, sitemap, robots, OG tags, README refresh |

## Stack

- **Frontend:** Next.js 14.2.5 (App Router) + React 18.3 + Tailwind CSS 3.4
- **Mobile:** PWA (installable to home screen) — React Native later
- **Storage:** localStorage (UI state) + Google Sheets (vocab content, 204 rows live)
- **Backend:** Next.js API routes + Google Sheets API v4 (service account auth)
- **Hosting:** Vercel (free/Hobby tier)
- **Auth:** Custom session cookies + Bearer secret (`CRON_SECRET`) for admin endpoints

## Routes (live)

**17 pages**
- `/` Home (Master House dashboard)
- `/heute` Daily lesson + Wort des Tages
- `/woerter` Vocab editor + SM-2 SRS (204 cards from Sheet)
- `/ueben` Practice modes
- `/hoeren` Listen
- `/sprechen` Speak
- `/lesen` Read
- `/schreiben` Write
- `/grammatik` Grammar
- `/kultur` Culture
- `/translate` Translator
- `/fortschritt` Progress + charts (recharts)
- `/profile` Profile
- `/settings` Settings
- `/login` Login (cookie session)
- `/admin/vocab` Vocab editor (Bearer or cookie-gated)

**14 API routes**
- Public: `/api/vocab`, `/api/wort-des-tages`, `/api/debug/sheet-tabs`, `/api/debug/sheet-samples`
- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Admin (Bearer `CRON_SECRET` or cookie): `/api/admin/vocab/{list,save,bulk,[id]}`, `/api/admin/wort-des-tages/bulk-seed`, `/api/admin/sheet-migrate`

## Modules

| Module | Status | Description |
|---|---|---|
| Heute (Daily) | ✅ Live | Loads `german_dayN.txt` from `/app/lessons/` — Days 1–30 available |
| Wörter (Vocab) | ✅ Live | 204 Sheet cards + SM-2 spaced repetition + custom add/edit/delete |
| Üben (Practice) | 🚧 Phase 1.3 | Quiz modes, fill-in-blank, multiple choice |
| Hören (Listen) | 🚧 WIP | Podcast/dictation placeholder |
| Sprechen (Speak) | 🚧 Phase 2 | AI conversation partner |
| Schreiben (Write) | 🚧 WIP | Guided writing prompts |
| Fortschritt (Progress) | ✅ Live | Streak, level, milestones, charts |

## Brand

- **Forest + Parchment + Ink** — premium, minimal, professional ("Old book in a cabin")
- **Light + Dark mode** — toggle in app shell, persisted to localStorage
- **No crown emojis, no Duolingo-owl** — built for adults building careers

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

For production / Sheet access, set these env vars in Vercel:
```
GOOGLE_SHEET_ID=1EPUGRPSsvRHvMlREA-UgykfvwCHNMyemBiOplju5u1I
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded service account JSON>
CRON_SECRET=dd-2026-migrate-9x8y7z
```

## Daily Lesson Files

Lessons live in `app/lessons/german_dayN.txt`. Currently Days 1–30 exist. Roadmap: 90 A1 + 180 A2 + 270 B1 + ... across a 730-day plan.

## Roadmap

- **Phase 1.5** (current): Sheet-backed vocab + admin editor
- **Phase 1.6**: Mobile responsive pass + empty/loading states
- **Phase 1.7**: External cron via cron-job.org (free, no Vercel Pro needed)
- **Phase 2 (8 weeks)**: Conversation Studio (AI role-play)
- **Phase 3 (12 weeks)**: Pronunciation Lab
- **Phase 4 (16 weeks)**: React Native mobile app
- **Phase 5 (20 weeks)**: User accounts + Stripe subscriptions
- **Phase 6 (24 weeks)**: Soft launch with 10 beta users

## Spec

Architecture notes in `dein_deutsch_spec.md` (workspace-dialga). Sheet setup in `SHEET_SETUP.md`. Deployment in `DEPLOY.md`.

---

Built by **Alakazam** (Alakazam dY) for **Jasper Lai** — Group Finance Director @ TTRacing.
