# GitHub, Deployment, and Dutchie Setup

## Put This Project on GitHub

This machine does not currently have the GitHub CLI installed, and the connected GitHub app is not authorized for any accounts yet. Use one of these paths:

### Option A: GitHub Desktop

1. Open GitHub Desktop.
2. Choose `File > Add local repository`.
3. Select this folder:

   ```text
   C:\Users\mrjoe\Documents\Codex\2026-05-12\i-have-api-keys-for-dutchie
   ```

4. Publish it as a private repository.
5. Recommended repo name: `embr-intellegence-dashboard`.

### Option B: GitHub CLI

Install GitHub CLI, then run:

```powershell
gh auth login
git init
git add .
git commit -m "Initial EMBR Intellegence dashboard"
gh repo create embr-intellegence-dashboard --private --source . --remote origin --push
```

### Option C: Existing GitHub Repo

If you already have a repo, add it as the remote:

```powershell
git init
git add .
git commit -m "Initial EMBR Intellegence dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/embr-intellegence-dashboard.git
git push -u origin main
```

Do not commit `.env.local`. It is ignored by git.

## Connect Dutchie APIs

Dutchie POS uses HTTP Basic Auth. Each API key is the username, and the password is empty. The app already keeps that server-side in `src/lib/dutchie.ts`.

### 1. Create `.env.local`

```powershell
Copy-Item .env.example .env.local
```

### 2. Add the six stores

In `.env.local`, keep `DUTCHIE_STORES` as JSON and put each real key in its own env var:

```env
DUTCHIE_STORES=[{"id":"downtown","name":"EMBR Downtown","apiKeyEnv":"DUTCHIE_API_KEY_DOWNTOWN"},{"id":"north","name":"EMBR North","apiKeyEnv":"DUTCHIE_API_KEY_NORTH"},{"id":"eastside","name":"EMBR Eastside","apiKeyEnv":"DUTCHIE_API_KEY_EASTSIDE"},{"id":"airport","name":"EMBR Airport","apiKeyEnv":"DUTCHIE_API_KEY_AIRPORT"},{"id":"west-medical","name":"EMBR West Medical","apiKeyEnv":"DUTCHIE_API_KEY_WEST_MEDICAL"},{"id":"south","name":"EMBR South","apiKeyEnv":"DUTCHIE_API_KEY_SOUTH"}]

DUTCHIE_API_KEY_DOWNTOWN=your_key_here
DUTCHIE_API_KEY_NORTH=your_key_here
DUTCHIE_API_KEY_EASTSIDE=your_key_here
DUTCHIE_API_KEY_AIRPORT=your_key_here
DUTCHIE_API_KEY_WEST_MEDICAL=your_key_here
DUTCHIE_API_KEY_SOUTH=your_key_here
```

### 3. Test the keys

```powershell
npm.cmd run test:dutchie
```

This calls `/whoami` for each store and prints only whether the key works. It does not print the keys.

### 4. Run the sync endpoint

Set `CRON_SECRET` in `.env.local`, start the app, then call:

```powershell
Invoke-RestMethod -Method POST `
  -Uri http://localhost:3100/api/sync/dutchie `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" }
```

The sync route currently verifies stores and fetches products, inventory reporting, and register transactions. The next production step is to save those payloads into Postgres and calculate the weekly/monthly aggregates from the stored rows.

## Deploy

Recommended production setup:

- GitHub private repo
- Vercel project connected to that repo
- Vercel Postgres, Supabase, or Neon for the database
- Vercel environment variables for the six Dutchie keys
- Vercel Cron for weekly/monthly sync and email reports

Add the same `.env.local` values in Vercel Project Settings under Environment Variables. Never expose Dutchie keys to the browser.
