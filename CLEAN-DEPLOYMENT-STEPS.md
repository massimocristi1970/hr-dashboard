# Clean Deployment Steps - Start Fresh

## Pre-Deployment: Verify Code

Before deploying, make sure:

1. **Frontend API is hardcoded** - `frontend/src/lib/api.ts` should have:
   ```typescript
   const API_BASE = "https://hr-dashboard-api.massimo-d6f.workers.dev";
   ```

2. **Backend Worker is deployed** - Test it:
   ```bash
   curl https://hr-dashboard-api.massimo-d6f.workers.dev/api/health?as=test@example.com
   ```
   Should return: `{"status":"ok"}`

3. **No routing conflicts** - Remove any `_routes.json` or `routes.json` files from `frontend/public/`

## Step 1: Delete Cloudflare Pages Project

1. Go to **https://dash.cloudflare.com**
2. **Workers & Pages** → **Pages**
3. Find **hr-dashboard** project
4. Click **"..."** → **"Delete project"**
5. Confirm

**✅ DO NOT DELETE THE WORKER** - Keep `hr-dashboard-api` worker.

## Step 2: Deploy Pages Fresh

### Option A: Via Dashboard (Recommended)

1. Go to **Workers & Pages** → **Pages** → **"Create application"**
2. Select **"Pages"** → **"Connect to Git"**
3. **Authorize** Cloudflare to access GitHub if needed
4. **Select repository:** `hr-dashboard`
5. **Configure build:**
   - **Project name:** `hr-dashboard`
   - **Production branch:** `main` (or your main branch)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend` ← **CRITICAL**
6. Click **"Save and Deploy"**

### Option B: Via Wrangler CLI

```powershell
cd frontend
npm install -g wrangler
wrangler pages deploy dist --project-name=hr-dashboard
```

## Step 3: After Initial Deployment

Once deployed, you'll get a URL like `https://hr-dashboard-XXXXX.pages.dev`

## Step 4: Test API Routing

Visit: `https://hr-dashboard-XXXXX.pages.dev/api/health`

**Expected behavior:**
- If it returns JSON `{"status":"ok"}` → Pages is not intercepting (good)
- If it returns HTML or redirects → Pages is intercepting (we need to fix)

## Step 5: Configure Routing (If Needed)

If Pages is still intercepting `/api/*`:

### Create `frontend/public/_routes.json`:

```json
{
  "version": 1,
  "exclude": ["/api/*"]
}
```

Then:
1. Commit: `git add frontend/public/_routes.json && git commit -m "Exclude API routes" && git push`
2. Wait for rebuild
3. Test again

## Step 6: Set Dev Email (For Testing)

1. Visit your deployed Pages URL
2. Open browser console (F12)
3. Run: `localStorage.setItem('dev_email', 'massimo@ticktockloans.com')`
4. Refresh page

This allows the frontend to call the Worker with authentication.

## Troubleshooting

### Issue: Still getting 401/HTML responses

**Check:**
1. Is Worker URL correct in `frontend/src/lib/api.ts`?
2. Is `_routes.json` deployed? (check in `frontend/public/`)
3. Is Pages rebuild completed?

### Issue: API calls still go to Pages domain

**Solution:**
1. Hard refresh: Ctrl + F5
2. Check browser console for `[API Config]` logs
3. Verify JavaScript bundle contains Worker URL

### Issue: Build fails

**Check:**
- Root directory: `frontend`
- Build output directory: `dist`
- Build command: `npm run build`
