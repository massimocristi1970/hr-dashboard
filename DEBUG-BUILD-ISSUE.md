# Debug Build Output Directory Issue

## The Problem

Build succeeds but Cloudflare can't find the output directory. The error shows:
```
Error: Output directory "frontend/dist " not found.
```

Notice the **trailing space** in the error message - this might be the issue.

## Possible Causes

1. **Trailing space in the field** - The build output directory might have `dist ` (with space) instead of `dist`
2. **Build runs from wrong directory** - The build might be creating `dist/` in the wrong location
3. **Path resolution issue** - Cloudflare might be resolving paths incorrectly

## Step 1: Verify Exact Value in Cloudflare

1. Go to **Cloudflare Pages** → Your project → **Settings** → **Builds & deployments**
2. Look at **"Build output directory"** field
3. **Click in the field** and check:
   - Is there a trailing space?
   - Is it exactly `dist` (no spaces before or after)?
   - Try deleting the value and retyping `dist`
4. **Save** and retry deployment

## Step 2: Check Build Logs

The build log shows:
```
dist/index.html
dist/assets/index-CReRTcOu.css
dist/assets/index-DfMI7shp.js
```

This means the build IS creating files in `dist/` relative to where the build runs.

## Step 3: Try Different Build Command

Since root directory is `frontend`, try changing the build command to be explicit:

**Current:** `npm run build`
**Try:** `cd frontend && npm run build` (but this might not work if root is already frontend)

Actually, if root directory is `frontend`, the build command should run from `frontend/`, so `npm run build` should be correct.

## Step 4: Alternative - Change Root Directory

If the issue persists, try:

1. **Root directory:** Leave empty or set to `/` (root of repo)
2. **Build command:** `cd frontend && npm run build`
3. **Build output directory:** `frontend/dist`

This way, the build explicitly changes into frontend, builds, and outputs to `frontend/dist` from repo root.

## Step 5: Check for Hidden Characters

The trailing space in the error suggests there might be a hidden character. Try:

1. Delete the entire "Build output directory" value
2. Type `dist` fresh
3. Save
4. Retry
