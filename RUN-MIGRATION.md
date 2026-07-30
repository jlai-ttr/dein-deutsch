# Run this to migrate. Replace <CRON_SECRET> with your secret.

# Step 1: Set CRON_SECRET in Vercel (do this in browser first):
#   Vercel → dein-deutsch project → Settings → Environment Variables
#   Add: CRON_SECRET = any-random-string (e.g. dd-2026-migrate-9x8y7z)
#   Click Save. Wait 30s for redeploy to pick it up.

# Step 2: Run this PowerShell (replace the placeholder):
Invoke-WebRequest -Method POST -Uri "https://dein-deutsch.vercel.app/api/admin/sheet-migrate" -Headers @{"Authorization"="Bearer dd-2026-migrate-9x8y7z"} -UseBasicParsing | Select-Object -ExpandProperty Content

# OR using curl:
# curl -X POST -H "Authorization: Bearer dd-2026-migrate-9x8y7z" https://dein-deutsch.vercel.app/api/admin/sheet-migrate