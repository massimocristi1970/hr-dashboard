# Next Steps After Successful Deployment

## Step 1: Verify Deployment Succeeded

1. Go to: **https://dash.cloudflare.com** → **Workers & Pages** → **Pages** → Your project
2. Go to: **Deployments** tab
3. Check the latest deployment:
   - Status should be **"Success"** (green checkmark)
   - If failed, check the build logs

## Step 2: Get Your Pages URL

1. In **Deployments** tab, you'll see your Pages URL
2. It looks like: `https://hr-dashboard-XXXXX.pages.dev`
3. **Copy this URL** - you'll need it

## Step 3: Test the Site

1. **Visit your Pages URL** in a browser
2. **Open DevTools (F12)** → **Console** tab
3. **Look for these logs:**
   ```
   [API Config] API Base URL: https://hr-dashboard-api.massimo-d6f.workers.dev
   [API Config] Current origin: https://hr-dashboard-XXXXX.pages.dev
   ```

   If you see these, the fix is working! ✅

4. **Check the Network tab** (still in DevTools):
   - Click **Network** tab
   - Refresh the page (F5)
   - Look for API requests
   - **They should go to:** `https://hr-dashboard-api.massimo-d6f.workers.dev/api/...`
   - **NOT to:** `https://hr-dashboard-XXXXX.pages.dev/api/...`

## Step 4: Set Up Authentication (For Testing)

The Worker needs authentication. For testing:

1. **Open browser console** (F12 → Console)
2. **Run this command:**
   ```javascript
   localStorage.setItem('dev_email', 'massimo@ticktockloans.com');
   ```
3. **Refresh the page** (F5)

This will add `?as=massimo@ticktockloans.com` to all API requests, which allows authentication for testing.

## Step 5: Test the Dashboard

1. **My Dashboard tab** - Should load without errors
2. **Request Leave tab** - Should show the form
3. **Try submitting a leave request** - Should work!

## Step 6: Test All Features

### If You're HR Admin:
- Go to **HR Admin** tab
- Add an employee:
  - Email: `massimo@ticktockloans.com`
  - Full Name: Your name
  - Click "Add Employee"

### Test Leave Request:
- Go to **Request Leave** tab
- Fill in dates
- Submit
- Check **My Dashboard** to see your request

## Troubleshooting

### Issue: Console shows wrong API Base URL

**Check:**
- Did the deployment actually succeed?
- Did you clear browser cache?
- Try incognito window

### Issue: Still getting 401 errors

**Solution:**
- Make sure you ran: `localStorage.setItem('dev_email', 'massimo@ticktockloans.com')`
- Refresh the page after setting it

### Issue: API calls still go to Pages domain

**Check Network tab:**
- What URL are the requests actually going to?
- If they're still going to Pages domain, the JavaScript didn't update
- Try hard refresh: Ctrl + F5

### Issue: Site loads but nothing works

**Check console for errors:**
- Any red error messages?
- What do they say?

## Success Checklist

- ✅ Deployment status: Success
- ✅ Console shows: `[API Config] API Base URL: https://hr-dashboard-api.massimo-d6f.workers.dev`
- ✅ Network tab shows requests going to Worker domain
- ✅ Site loads without errors
- ✅ Can navigate between tabs
- ✅ API calls work (set dev_email first)

## What You Should See

1. **Dashboard loads** with navigation (My Dashboard, Request Leave, etc.)
2. **No errors in console** (other than maybe 401 if you haven't set dev_email)
3. **API calls in Network tab** go to `hr-dashboard-api.massimo-d6f.workers.dev`

If all this works, you're done! 🎉
