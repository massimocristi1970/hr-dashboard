# Quick Fix Guide - API URL Issue

## The Problem

Your frontend is calling APIs on its own domain (`hr-dashboard-48h.pages.dev`) instead of your Worker (`hr-dashboard-api.massimo-d6f.workers.dev`).

## The Solution (2 Steps)

### Step 1: Set Environment Variable in Cloudflare Pages

1. Go to: **https://dash.cloudflare.com**
2. Click: **Workers & Pages** → **Pages** → Your **hr-dashboard** project
3. Go to: **Settings** → **Environment variables**
4. Click: **"Add variable"**
5. Set:
   - **Name:** `VITE_API_BASE`
   - **Value:** `https://hr-dashboard-api.massimo-d6f.workers.dev`
   - **Environment:** Production
6. Click: **"Save"**

### Step 2: Trigger Rebuild

**Option A: Push a commit (Easiest)**
```powershell
git add .
git commit -m "Fix API URL configuration"
git push
```
Cloudflare will auto-rebuild.

**Option B: Manual retry**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Retry deployment"**

## What I Fixed in the Code

✅ Improved API base URL fallback logic  
✅ Removed `routes.json` that was interfering with API calls  
✅ Ensured absolute URLs are always used

## Verify It's Fixed

After rebuild completes (1-2 minutes):

1. Visit your Pages site
2. Open DevTools (F12) → **Network** tab
3. Check API requests - they should go to:
   - ✅ `https://hr-dashboard-api.massimo-d6f.workers.dev/api/...`
   - ❌ NOT `https://hr-dashboard-48h.pages.dev/api/...`

## If Still Not Working

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check build logs** in Cloudflare Pages to verify environment variable was set
4. **Verify Worker is accessible**: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/health`
