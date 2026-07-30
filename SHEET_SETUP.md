# Dein Deutsch — Google Sheet Architecture (Level B)

## The shape
- **Google Sheet = AUTHORING** (you edit rows here)
- **Vercel API = SERVING** (reads sheet, returns JSON)
- **Browser localStorage = SRS state** (review intervals never leave your device)

```
You (edit cells)
    ↓
Google Sheet (3 tabs)
    ↓ cron / daily refresh
/app/api/vocab → /app/api/wort-des-tages → cached JSON at edge
    ↓ browser fetch on app open
Browser /woerter / /home Wort des Tages
    ↓ localStorage write
SRS review state stays on device
```

## Step 1 — Create your Sheet
1. Go to https://sheets.google.com → New spreadsheet
2. Name it `dein-deutsch-content`
3. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
4. Save it — we'll need it for the API env var

## Step 2 — Create these 3 tabs

### Tab 1: `vocab_master`
This is your master vocab list. Every card ever lives here.

**Row 1 = header row (paste this exactly):**

```
id	level	topic	is_active	de	pos	en	pronunciation	ipa	gender	plural	genitive	separable	prefix	verb_aux	verb_praeteritum	verb_partizip_ii	conjugation_ich	conjugation_du	conjugation_er	conjugation_wir	conjugation_ihr	conjugation_sie	comparative	superlative	example_de	example_en	notes	updated_at
```

**Example row (paste in row 2):**

```
a1-001	A1	starter	TRUE	der Mann	noun	man	man	/man/	m	die Männer	des Mannes						Ist das Ihr Mann?	Is that your husband?		Hallo, ich bin dein Mann.	Hello, I am your man.	2026-07-30
```

### Tab 2: `wort_des_tages`
The 30 daily rotating words (and any future ones).

**Row 1 = header row (paste this exactly):**

```
word	category	gender	plural	genitive	pronunciation	ipa	meaning	meaning_en	example	example_en	separable	prefix	verb_aux	verb_praeteritum	verb_partizip_ii	conjugation_ich	conjugation_du	conjugation_er	conjugation_wir	conjugation_ihr	conjugation_sie	comparative	superlative	sort_index	is_active	updated_at
```

**Example row (paste in row 2 — replaces the Wanderlust entry):**

```
Sehnsucht	noun	f	die Sehnsüchte	der Sehnsucht	ZEːn-zuxt	/ˈzeːnˌzʊxt/	tiefes Verlangen nach etwas	deep longing	Die Sehnsucht nach seiner Heimat wurde stärker.	The longing for his homeland grew stronger.													0	TRUE	2026-07-30
```

### Tab 3: `satz_des_tages` (optional — defer)
Add later when you want sentence-of-the-day. Same column shape as wort_des_tages but with full sentence fields.

## Step 3 — Backfill the existing 1235 cards
- I will port the SEED_VOCAB array (50 A1 starter + 135 Business + 902 freq-list) into `vocab_master` as the initial dataset
- Existing freq-list cards will have empty `en`, `gender`, `plural`, etc. — fill in over time
- Cards without `en` will still show in the app (fallback to German)

## Step 4 — Auth setup (for me to implement)
I need two values in your Vercel env vars (don't worry, I'll set up the code to use these):

```
GOOGLE_SHEET_ID=1AbCdEf...your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"dein-deutsch",...}
```

How to get these:
1. **GOOGLE_SHEET_ID**: copy from your sheet URL (between `/d/` and `/edit`)
2. **GOOGLE_SERVICE_ACCOUNT_KEY**: 
   - Go to https://console.cloud.google.com
   - Create a new project "dein-deutsch"
   - Enable the Google Sheets API
   - Create a service account
   - Download the JSON key file
   - In your sheet → Share → add the service account email as **Editor**
   - Paste the entire JSON file content as the env var value

## Step 5 — Start authoring right now
You don't need to wait for the API. Start typing rows. When the API goes live, your sheet rows appear in the app.

**Suggested first batch** (Travel topic):
- topic=travel, level=A2
- 50 rows
- Copy the header row, fill in columns

**Quick test**: Type one row in `wort_des_tages` (any word). When the API ships, it'll appear at `dein-deutsch.vercel.app/api/wort-des-tages`.

## Conventions

- **id format**: `{topic}-{nnn}` e.g. `a1-001`, `biz-002`, `travel-050`, `freq-247`
- **is_active**: TRUE to show, FALSE to hide (soft delete, keeps history)
- **de for nouns**: include the article, e.g. `der Mann`, `die Frau`, `das Kind`
- **de for verbs**: infinitive form, e.g. `gehen`, `machen`, `aufstehen`
- **pronunciation**: simple phonetic, e.g. `man`, `ZEːn-zuxt`, `VAHN-der-loost`
- **ipa**: strict IPA if you know it, else leave blank
- **pos values**: `noun` | `verb` | `adjective` | `adverb` | `phrase` | `expression`
- **gender values**: `m` | `f` | `n` (only for nouns)
- **verb_aux values**: `haben` | `sein` (only for verbs)
- **updated_at**: ISO date `2026-07-30` — change this when you edit a row so the API knows it's fresh

## What I'll build next

When you say "go":
1. `app/lib/sheet-client.ts` — Google Sheets API helper using service account auth
2. `app/api/vocab/route.js` — fetches `vocab_master`, returns active rows as JSON
3. `app/api/wort-des-tages/route.js` — fetches `wort_des_tages`, picks today's word
4. `app/api/cron/refresh-vocab/route.js` — daily refresh trigger
5. Modify `/woerter` to fetch from API + merge with local SEED_VOCAB baseline (fallback if API fails)
6. Modify `/page.tsx` (home) Wort des Tages to fetch from API + fallback to local wort-des-tages.ts
7. Backfill the existing 1235 cards from SEED_VOCAB into the sheet so you have a baseline
8. Deploy + test

## Why this is worth it
- You become the content editor (not me)
- New topic decks = typing rows, not typing TS arrays
- Grammar data flows through automatically (gender, conjugation, etc.)
- `GOOGLETRANSLATE()` in Sheets can auto-fill EN translations
- Zero infrastructure work needed once it's built
- Works offline (cached at edge)