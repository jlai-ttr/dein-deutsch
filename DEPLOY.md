# Dein Deutsch — Vercel Deployment Guide

## Status
- ✅ Local repo ready: `C:\Users\user\projects\dein-deutsch`
- ✅ Initial commit: `7f6529a`
- ✅ Branch: `main`
- ⏳ Need to: Push to GitHub → Connect to Vercel

## Step 1: Push to GitHub

### Option A: Create via GitHub CLI (fastest)
```bash
cd C:\Users\user\projects\dein-deutsch
gh repo create jlai-ttr/dein-deutsch --public --source=. --push
```

### Option B: Manual via GitHub website
1. Go to https://github.com/new
2. Repository name: **dein-deutsch**
3. Owner: **jlai-ttr** (your org)
4. Visibility: **Public** (or Private if you want)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"
7. Then run:
```bash
cd C:\Users\user\projects\dein-deutsch
git remote add origin https://github.com/jlai-ttr/dein-deutsch.git
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Sign in with GitHub (use jlai-ttr org)
3. Click **"Import"** next to `jlai-ttr/dein-deutsch`
4. Framework preset: **Next.js** (auto-detected)
5. Root directory: `./` (default)
6. Build settings: leave defaults
7. Click **Deploy**

## Step 3: First Deployment
- Vercel builds (~1-2 min)
- Site URL: `https://dein-deutsch.vercel.app` (auto-generated)
- OR custom: link your domain in Settings → Domains

## Step 4: Auto-Deploy on Push
Already configured by Vercel after Step 2. Every push to `main` = new deployment.

## Workflow Going Forward

```bash
# Make changes in C:\Users\user\projects\dein-deutsch
git add .
git commit -m "your message"
git push
# Vercel auto-deploys in 1-2 min
```

## ⚠️ CRITICAL: Lessons Folder

The lesson API reads from:
```
C:\Users\user\.openclaw\workspace-dialga\scripts\german_dayN.txt
```

This path is INSIDE the OpenClaw workspace — it does NOT exist on Vercel.

**Fix before deploying:** Either:
1. Copy lesson files to `dein-deutsch/app/lessons/` and update the API route
2. Use Supabase storage
3. Bundle lessons into the app

**Recommended:** Option 1 for now. Let me know when ready.

## ⚠️ Vercel Project Name

Vercel project name will be `dein-deutsch` (auto-generated from repo name). URL: `dein-deutsch.vercel.app`.

If you want a different name, set it in Vercel project settings.

## Branch Protection

After first deploy, recommend:
1. Vercel → Project Settings → Git
2. Enable "Production Branch" = `main`
3. Enable "Auto-deploy" on push to main

## Rollback

If a deployment breaks:
1. Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click → "Promote to Production"

---

Built by Dialga 🐉 for Jasper Lai.
