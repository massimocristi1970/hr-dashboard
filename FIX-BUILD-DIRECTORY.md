# Fix Build Output Directory

## The Problem

Build is succeeding but Cloudflare Pages is looking for the wrong output directory:
- **Error:** `Output directory "frontend/dist " not found.`
- **Build created:** `dist/index.html` (correct!)
- **Issue:** Pages is looking for `frontend/dist` when root is already `frontend`

## The Fix

In Cloudflare Pages settings, the **Build output directory** should be `dist` (not `frontend/dist`).

## Step-by-Step Fix

1. Go to: **https://dash.cloudflare.com**
2. Navigate: **Workers & Pages** → **Pages** → Your **hr-dashboard** project
3. Go to: **Settings** tab → **Builds & deployments**
4. Find: **"Build configuration"** section
5. Update **"Build output directory":**
   - **Current (wrong):** `frontend/dist` or `frontend/dist ` (with space)
   - **Should be:** `dist` ← Just `dist`, nothing else
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"..."** on latest deployment → **"Retry deployment"**

## Correct Configuration

- ✅ **Root directory:** `frontend`
- ✅ **Build command:** `npm run build`
- ✅ **Build output directory:** `dist` (just `dist`, not `frontend/dist`)

Since root directory is `frontend`, the output directory is relative to that, so it's just `dist`.

## Why This Happens

When you set:
- **Root directory:** `frontend`
- **Build output directory:** `dist`

Cloudflare looks for: `frontend/dist` (which is correct)

But if you set:
- **Root directory:** `frontend`
- **Build output directory:** `frontend/dist`

Cloudflare looks for: `frontend/frontend/dist` (wrong!)

Also check for any trailing spaces in the build output directory field.
