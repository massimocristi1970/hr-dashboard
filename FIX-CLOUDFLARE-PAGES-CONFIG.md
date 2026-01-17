# Fix Cloudflare Pages Build Configuration

## The Error

```
Error: Output directory "frontend/frontend/dist" not found.
```

## The Problem

Cloudflare Pages is configured with:
- **Root directory:** `frontend`
- **Build output directory:** `frontend/dist`

But since root is already `frontend`, it's looking for `frontend/frontend/dist` (doubling up).

## The Fix

Change the build output directory to just `dist` (relative to the root directory).

## Step-by-Step Fix

### Step 1: Go to Cloudflare Pages Settings

1. Go to **https://dash.cloudflare.com**
2. Click **"Workers & Pages"** → **"Pages"**
3. Click your **hr-dashboard** project
4. Go to **"Settings"** tab
5. Click **"Builds & deployments"** in the left sidebar

### Step 2: Update Build Configuration

Find the **"Build configuration"** section and update:

**Current (Wrong):**
- Build command: `npm run build`
- Build output directory: `frontend/dist` ❌
- Root directory: `frontend`

**Should be:**
- Build command: `npm run build`
- Build output directory: `dist` ✅
- Root directory: `frontend`

### Step 3: Save and Redeploy

1. Click **"Save"** or **"Save configuration"**
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Retry deployment"**

Or push a new commit to trigger a new build automatically.

## Verify Configuration

After saving, your build settings should show:
- ✅ **Root directory:** `frontend`
- ✅ **Build command:** `npm run build`
- ✅ **Build output directory:** `dist`

## Expected Build Output

After fixing, you should see in the build logs:
```
✓ built in 921ms
dist/index.html
dist/assets/index-XXX.css
dist/assets/index-XXX.js
```

And the deployment should succeed!
