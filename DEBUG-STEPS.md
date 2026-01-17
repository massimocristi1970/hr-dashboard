# Debug Steps - API URL Issue

## First: Check What's Actually Running

The updated code has debug logging. Let's see what's actually happening:

1. **Visit your site:** `https://6c587d91.hr-dashboard-48h.pages.dev`
2. **Open DevTools (F12)** → **Console** tab
3. **Look for these logs:**
   - `[API Config] Using API Base: ...`
   - `[API Config] Env VITE_API_BASE: ...`
   - `[API Config] Current origin: ...`

**What to check:**
- If you **DON'T see these logs**, the new code hasn't deployed yet
- If you **DO see them**, check what "Using API Base" says - it should be `https://hr-dashboard-api.massimo-d6f.workers.dev`

## If Console Shows Wrong URL

If the console shows the Pages domain or wrong URL, the build hasn't included the fix yet. Try:

1. **Clear browser cache:**
   - Ctrl + Shift + Delete
   - Select "Cached images and files"
   - Clear data
   - Hard refresh: Ctrl + F5

2. **Check Cloudflare Pages deployment:**
   - Go to Cloudflare Dashboard → Pages → Your project → Deployments
   - Is the latest deployment showing as "Success"?
   - Does it show the latest commit with the API fix?

3. **Force a new build:**
   - Push a small change (like a comment in code)
   - Or retry the latest deployment

## If Console Shows Correct URL But Requests Are Wrong

If console shows `Using API Base: https://hr-dashboard-api.massimo-d6f.workers.dev` but requests still go to Pages domain:

1. **Check Network tab:**
   - Open DevTools → Network tab
   - Make a request (refresh page or submit form)
   - Look at the actual request URL in the Network tab
   - Hover over the request to see full URL

2. **Check for service workers:**
   - DevTools → Application tab → Service Workers
   - If any are registered, click "Unregister"
   - Clear cache and reload

## Quick Test: Check the Actual JavaScript

1. **View source on your deployed site**
2. **Open the JavaScript bundle:**
   - Usually at `assets/index-XXXXX.js`
   - Search for `hr-dashboard-api.massimo-d6f.workers.dev`
   - If you find it, the fix is deployed
   - If you don't, it hasn't been built yet

## Next Steps

**Report back:**
1. What do the console logs show for `[API Config] Using API Base:`?
2. What does the Network tab show for the actual request URL?
3. Is the latest Cloudflare Pages deployment marked as "Success"?
