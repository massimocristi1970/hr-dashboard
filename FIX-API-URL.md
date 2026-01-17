# Fix: API URL Configuration Issue

## Problem

The frontend is trying to call APIs on its own domain (`hr-dashboard-48h.pages.dev`) instead of your Worker domain (`hr-dashboard-api.massimo-d6f.workers.dev`).

**Error:**
- `POST https://6c587d91.hr-dashboard-48h.pages.dev/api/leave/request 405 (Method Not Allowed)`
- `Error: Unexpected token '<', "<!doctype "... is not valid JSON`

## Root Cause

The `VITE_API_BASE` environment variable is not set in Cloudflare Pages, so the frontend falls back to relative paths or incorrect URLs.

## Solution: Set Environment Variable in Cloudflare Pages

### Step 1: Go to Cloudflare Pages Settings

1. Go to **https://dash.cloudflare.com**
2. Click **"Workers & Pages"** → **Pages**
3. Click your **hr-dashboard** project
4. Go to **"Settings"** tab
5. Click **"Environment variables"** in the left sidebar

### Step 2: Add Production Environment Variable

1. Click **"Add variable"**
2. Fill in:
   - **Variable name:** `VITE_API_BASE`
   - **Value:** `https://hr-dashboard-api.massimo-d6f.workers.dev`
   - **Environment:** Select **"Production"** (and optionally "Preview" too)
3. Click **"Save"**

### Step 3: Trigger a New Deployment

After setting the environment variable, you need to rebuild:

**Option A: Automatic (Recommended)**
- Push a new commit to your repository:
  ```powershell
  git add .
  git commit -m "Update API configuration"
  git push
  ```
- Cloudflare Pages will automatically rebuild with the new environment variable

**Option B: Manual Redeploy**
1. Go to **Cloudflare Pages** → Your Project → **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Retry deployment"** or **"Retry build"**

**Option C: Manual Build Trigger**
1. Go to **Cloudflare Pages** → Your Project → **"Settings"** → **"Builds & deployments"**
2. If there's a rebuild button, use it
3. Or change a file, commit, and push to trigger rebuild

### Step 4: Verify the Fix

1. Wait for deployment to complete (usually 1-2 minutes)
2. Visit your Cloudflare Pages URL
3. Open browser DevTools (F12) → Console
4. Check network requests - they should now go to:
   - `https://hr-dashboard-api.massimo-d6f.workers.dev/api/...`
   - NOT `https://hr-dashboard-48h.pages.dev/api/...`

## Alternative: Quick Test Without Redeploy

If you want to test immediately without waiting for rebuild:

1. Open your deployed site
2. Open browser DevTools (F12) → Console
3. Run this command to temporarily override the API base:
   ```javascript
   window.API_BASE = 'https://hr-dashboard-api.massimo-d6f.workers.dev';
   location.reload();
   ```
   
   Note: This won't persist, so you still need to set the environment variable properly.

## How to Verify Environment Variable is Set

After rebuilding, you can verify:

1. Go to **Cloudflare Pages** → Your Project → **"Deployments"**
2. Click on the latest deployment
3. Check the **"Build logs"** - you should see the build process
4. The environment variable will be injected at build time

## Why This Happens

Vite (the build tool) replaces `import.meta.env.VITE_API_BASE` with the actual value **at build time**. If the environment variable is not set:
- The code falls back to the default Worker URL
- BUT if the environment variable is empty string `""`, it might cause issues
- The fix ensures we always use an absolute URL

## Complete Fix Summary

✅ **Set in Cloudflare Pages:**
- Variable: `VITE_API_BASE`
- Value: `https://hr-dashboard-api.massimo-d6f.workers.dev`
- Environment: Production (and Preview if needed)

✅ **Trigger rebuild:**
- Push a commit OR retry deployment

✅ **Verify:**
- Check Network tab in DevTools
- API calls should go to Worker domain

## Still Having Issues?

If the problem persists after setting the environment variable and rebuilding:

1. **Check build logs** in Cloudflare Pages for errors
2. **Verify Worker URL** is accessible: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/health`
3. **Check CORS** - make sure Worker allows requests from your Pages domain
4. **Clear browser cache** - old JavaScript might be cached

## Quick Reference

**Cloudflare Pages Environment Variable:**
```
VITE_API_BASE=https://hr-dashboard-api.massimo-d6f.workers.dev
```

**Your Worker URL:**
```
https://hr-dashboard-api.massimo-d6f.workers.dev
```

**Your Pages URL:**
```
https://6c587d91.hr-dashboard-48h.pages.dev
```
