# Cloudflare Worker Deployment Guide

This guide helps you deploy the **fixed** HR Dashboard backend to Cloudflare Workers. The database binding issue has been resolved!

## What Was Fixed

✅ **Database Binding Mismatch Fixed:**
- Changed `env.DB` → `env.hr_dashboard_db` to match `wrangler.toml`
- This was causing the "Hello World" default response
- All 12 database references updated in `backend/src/index.ts`

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works great!)
- Git repository connected

## Step-by-Step Deployment

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Login to Cloudflare

```powershell
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Create D1 Database

```powershell
npx wrangler d1 create hr_dashboard_db
```

**Important:** Copy the `database_id` from the output. It looks like:
```
database_id = "afe6fdb3-ebd4-4ed2-8a24-ab43fddaba6f"
```

### 4. Update wrangler.toml

Open `backend/wrangler.toml` and verify:

```toml
name = "hr-dashboard-api"
main = "src/index.ts"
compatibility_date = "2025-12-01"

[vars]
HR_ADMIN_EMAILS = "massimo@ticktockloans.com"

[[d1_databases]]
binding = "hr_dashboard_db"  # ✅ Must match code!
database_name = "hr_dashboard_db"
database_id = "your-database-id-here"  # ← Paste your database_id
```

**Critical:** The `binding = "hr_dashboard_db"` must match what's in `src/index.ts` (it does now after the fix!)

### 5. Run Database Migrations

**For local development:**
```powershell
npm run d1:migrate:local
```

**For production:**
```powershell
npm run d1:migrate:remote
```

This creates the tables in your D1 database.

### 6. Test Locally

```powershell
npm run dev
```

Test the API:
```powershell
# In another terminal
curl "http://localhost:8787/api/health?as=test@example.com"
```

Expected response:
```json
{"status":"ok"}
```

### 7. Deploy to Cloudflare

```powershell
npm run deploy
```

You should see output like:
```
Total Upload: XXX KiB / gzip: XXX KiB
Uploaded hr-dashboard-api (X.X sec)
Published hr-dashboard-api (X.X sec)
  https://hr-dashboard-api.your-subdomain.workers.dev
```

**Save this URL!** You'll need it for your frontend.

### 8. Test Production Deployment

```powershell
# Test health endpoint
curl https://hr-dashboard-api.your-subdomain.workers.dev/api/health?as=test@example.com

# Test with authentication (local dev only)
curl "https://hr-dashboard-api.your-subdomain.workers.dev/api/me?as=test@example.com"
```

### 9. Configure Frontend

Update your frontend to use the Worker URL:

**In Cloudflare Pages (if using):**
1. Go to Pages → Your Project → Settings → Environment Variables
2. Add: `VITE_API_BASE` = `https://hr-dashboard-api.your-subdomain.workers.dev`

**Or edit `frontend/src/lib/api.ts`:**
```typescript
const RAW_BASE = import.meta.env.VITE_API_BASE || "https://hr-dashboard-api.your-subdomain.workers.dev";
```

## Troubleshooting

### Issue: Still getting "Hello World" response

**Check:**
1. Verify `wrangler.toml` has `binding = "hr_dashboard_db"` (not `DB`)
2. Verify `src/index.ts` uses `env.hr_dashboard_db` (not `env.DB`)
3. Check deployment logs: `wrangler tail`
4. Ensure you're hitting the correct Worker URL

### Issue: Database errors

**Check:**
1. Database ID matches in `wrangler.toml`
2. Migrations ran successfully (`npm run d1:migrate:remote`)
3. Database exists: `npx wrangler d1 list`

### Issue: Wrangler deployment fails on Windows

**Try:**
```powershell
# Use PowerShell (not CMD)
# Ensure Node.js is up to date: npx npm-check-updates -u
npm install  # Reinstall dependencies

# Try deployment again
npm run deploy
```

If still failing:
```powershell
# Use npx directly
npx wrangler deploy
```

### Issue: CORS errors

CORS is already configured in the Worker code. If you see CORS errors:
- Check that frontend URL matches your Worker URL
- Verify CORS headers in browser DevTools Network tab

### Issue: Authentication not working

**Local Development:**
- Use query parameter: `?as=email@example.com`
- Test in browser: `http://localhost:8787/api/me?as=test@example.com`

**Production:**
- Set up Cloudflare Access (see below)
- Or use custom authentication header

## Authentication Setup

### Local Development (Already Working)

The Worker supports impersonation for local dev:
```bash
curl "http://localhost:8787/api/me?as=test@example.com"
```

### Production: Cloudflare Access (Recommended)

1. Go to Cloudflare Dashboard → Zero Trust → Access
2. Create Application:
   - Name: "HR Dashboard API"
   - Session Duration: 24 hours
   - Domain: Select your Worker URL
3. Add Policy:
   - Include: Email domain (e.g., `@ticktockloans.com`)
   - Or specific email addresses
4. The Worker will receive `Cf-Access-Authenticated-User-Email` header automatically

### Production: Custom Header (Alternative)

If using a different auth provider:
- Set `X-User-Email` header in your API gateway/reverse proxy
- Update `getUserEmail()` in `src/index.ts` to check your custom header

## Monitoring & Logs

### View Real-time Logs

```powershell
npx wrangler tail
```

This shows all requests and errors in real-time.

### View Logs in Dashboard

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your Worker name
3. Go to "Logs" tab

## Free Tier Limits

Cloudflare Workers Free Tier includes:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request (after free tier)
- ✅ D1 database (read: 5M rows/day, write: 100K/day)
- ✅ No credit card required

This is more than enough for most HR dashboard use cases!

## Database Management

### List Databases
```powershell
npx wrangler d1 list
```

### Execute SQL Queries
```powershell
# Remote
npx wrangler d1 execute hr_dashboard_db --remote --command "SELECT * FROM employees"

# Local (for testing)
npx wrangler d1 execute hr_dashboard_db --local --command "SELECT * FROM employees"
```

### Backup Database
```powershell
npx wrangler d1 export hr_dashboard_db --remote --output ./backup.sql
```

## Next Steps

1. ✅ Deploy Worker: `npm run deploy`
2. ✅ Test endpoints: Check `/api/health` works
3. ✅ Update frontend: Set `VITE_API_BASE` to Worker URL
4. ✅ Set up Cloudflare Access for production auth
5. ✅ Monitor logs: `npx wrangler tail` to debug any issues

## Quick Reference

```powershell
# Development
cd backend
npm install
npx wrangler login
npm run d1:migrate:local
npm run dev

# Production
npm run d1:migrate:remote
npm run deploy

# Debugging
npx wrangler tail  # View logs
npx wrangler d1 list  # List databases
```

## Need Help?

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- D1 Database Docs: https://developers.cloudflare.com/d1/
- Check Worker logs: `npx wrangler tail`
- Verify binding matches in `wrangler.toml` and `src/index.ts`
