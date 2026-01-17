# Human Troubleshooting Guide - API URL Issue

## The Problem

Frontend is calling `https://6c587d91.hr-dashboard-48h.pages.dev/api/...` instead of `https://hr-dashboard-api.massimo-d6f.workers.dev/api/...`

## Root Cause Analysis

The code in `frontend/src/lib/api.ts` has been updated to hardcode the Worker URL, but requests are still going to the Pages domain. This suggests:

1. **Cloudflare Pages is intercepting `/api/*` routes** before they reach the JavaScript code
2. **There's a redirect or rewrite rule** in Cloudflare Pages configuration
3. **The build isn't including the updated code** (unlikely since code is committed)

## What to Check (Human Steps)

### Step 1: Check Cloudflare Pages Configuration

1. Go to: **https://dash.cloudflare.com**
2. Navigate: **Workers & Pages** → **Pages** → **hr-dashboard** → **Settings**
3. Check for:
   - **Redirects** section - any rules catching `/api/*`?
   - **Headers** section - any rewrites?
   - **Functions** - any Pages Functions that might intercept?

### Step 2: Check for _redirects File

Look in your repository for:
- `frontend/public/_redirects`
- `frontend/_redirects`
- Any file that might redirect `/api/*` routes

**If found:** This is likely the culprit. Cloudflare Pages uses `_redirects` files to handle routing, and if there's a rule like:
```
/api/*  /api/:splat  200
```
or
```
/api/*  /:splat  200
```
It will intercept API calls before JavaScript runs.

### Step 3: Verify the Actual Deployed JavaScript

1. Visit: `https://6c587d91.hr-dashboard-48h.pages.dev`
2. View page source
3. Find the JavaScript bundle: `<script src="/assets/index-XXXXX.js">`
4. Open that file directly
5. Search for: `hr-dashboard-api.massimo-d6f.workers.dev`
6. **If NOT found:** The build didn't include the fix
7. **If found:** Something else is intercepting the requests

### Step 4: Check Network Tab in Browser

1. Open DevTools → **Network** tab
2. Make a request (refresh page)
3. Look at the **actual request URL** in the Network tab
4. Check the **Request Headers** - is there a redirect happening?
5. Check the **Response** - is it HTML (the SPA) or JSON?

### Step 5: Check Cloudflare Pages Functions

1. In Cloudflare Pages dashboard → Your project
2. Check if there's a **Functions** section
3. Look for any files in `functions/` directory in your repo
4. **If found:** These might be intercepting `/api/*` routes

## Most Likely Solutions

### Solution 1: Remove _redirects File (If Exists)

If you find a `_redirects` file that catches `/api/*`, either:
- Delete it, OR
- Add an exception: `/api/*  https://hr-dashboard-api.massimo-d6f.workers.dev/api/:splat  200`

### Solution 2: Use Cloudflare Workers Route Instead

Instead of trying to fix the frontend, you could:
1. Set up a Cloudflare Worker route that proxies `/api/*` to your Worker
2. Or use Cloudflare's `_routes.json` to exclude `/api/*` from Pages handling

### Solution 3: Change Frontend to Use Full URLs

Instead of relative paths like `/api/me`, use full URLs:
```typescript
getMe: () => fetchAPI('https://hr-dashboard-api.massimo-d6f.workers.dev/api/me')
```

But this is a workaround, not a fix.

## Recommended Action Plan

1. **Check for `_redirects` file** - This is the #1 suspect
2. **Check Cloudflare Pages Settings** - Look for redirects/rewrites
3. **Verify JavaScript bundle** - Make sure fix is actually deployed
4. **Check Network tab** - See what's actually happening
5. **Consider using a Worker route** - Proxy API calls through Cloudflare

## Files to Check

- `frontend/public/_redirects`
- `frontend/_redirects`
- `frontend/public/routes.json` (we already deleted this)
- Cloudflare Pages dashboard → Settings → Redirects
- Cloudflare Pages dashboard → Settings → Headers

## Quick Test

Run this in browser console on the deployed site:
```javascript
// Check what API_BASE would be
console.log('Testing API URL construction...');
const testPath = '/api/me';
const apiBase = 'https://hr-dashboard-api.massimo-d6f.workers.dev';
const fullUrl = new URL(testPath, apiBase);
console.log('Expected URL:', fullUrl.toString());
console.log('Should be: https://hr-dashboard-api.massimo-d6f.workers.dev/api/me');
```

If this shows the correct URL but requests still go wrong, something is intercepting before the JavaScript runs.
