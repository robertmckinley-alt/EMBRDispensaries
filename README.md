# EMBR - Intellegence Dashboard

A Next.js dashboard MVP for multi-dispensary Dutchie POS analytics. It ships with high-polish mock weekly/monthly data now and a secure Dutchie sync route ready for your real API keys.

## What Is Built

- Main six-store owner dashboard
- Previous-week snapshot data for all six stores
- Store detail pages with past-week and current-month reports
- Week-over-week comparison cards based on net sales only
- Gross sales, net sales, transactions, average ticket, inventory health
- Top 3 and lowest 3 budtender performance tables
- Product velocity and category mix
- Sync status panel for Dutchie API readiness
- Print-optimized PDF export from the browser
- Protected weekly and monthly email report routes
- Secure server-side Dutchie client using Basic Auth
- Protected sync endpoint at `/api/sync/dutchie`

## Local Setup

If PowerShell feels annoying, use the double-click helpers:

- `Start Dashboard.bat` starts the local dashboard at `http://localhost:3100`
- `Test Dutchie Keys.bat` verifies the six Dutchie API keys without printing them
- `Sync Dutchie Data.bat` pulls Dutchie counts into a local dashboard snapshot

Manual setup:

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Put Dutchie keys in `.env.local`. Do not commit that file.

4. Start the app:

   ```powershell
   npm.cmd run dev
   ```

5. Open `http://localhost:3000`.

## PDF Export

Use the `Export PDF` button in the dashboard or store report. It opens the browser print flow with print-specific styles, so you can save a clean PDF.

## Weekly and Monthly Email Reports

Add these values to `.env.local`:

```env
REPORT_RECIPIENTS=owner@example.com,ops@example.com
REPORT_EMAIL_FROM=EMBR Reports <reports@example.com>
RESEND_API_KEY=
```

Protected manual send:

```powershell
Invoke-RestMethod -Method POST `
  -Uri http://localhost:3000/api/reports/email `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" } `
  -Body '{"period":"weekly"}' `
  -ContentType "application/json"
```

The included `vercel.json` schedules weekly emails on Mondays at 15:00 UTC and monthly emails on the first day of the month at 15:00 UTC.

## Dutchie Sync

The sync route is intentionally server-only. The easiest local path is:

1. Double-click `Start Dashboard.bat`
2. Double-click `Sync Dutchie Data.bat`
3. Refresh `http://localhost:3100`

Manual sync:

```powershell
Invoke-RestMethod -Method POST `
  -Uri http://localhost:3100/api/sync/dutchie `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" }
```

For production, wire the same endpoint to Vercel Cron or a scheduled worker. The current route verifies each configured store, fetches products, inventory reporting, and register transactions for a date window, then saves a local sync summary in `data/`. The next step is to persist full reporting rows into Postgres tables and calculate the weekly/monthly dashboard cards from that data.

## Suggested Database Tables

- `stores`
- `sync_runs`
- `products`
- `inventory_snapshots`
- `register_transactions`
- `weekly_store_metrics`
- `monthly_store_metrics`

Keep raw Dutchie payloads in JSONB columns early on. Once reporting needs settle, promote frequently queried fields into typed columns.
