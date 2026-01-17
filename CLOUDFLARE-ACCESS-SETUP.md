# Cloudflare Access Setup Guide - Step by Step

This guide walks you through setting up Cloudflare Access to secure your HR Dashboard Worker. Access will handle authentication and pass the user's email to your Worker automatically.

## Prerequisites

- ✅ Worker already deployed: `hr-dashboard-api.massimo-d6f.workers.dev`
- ✅ Cloudflare account (free tier works)
- ✅ Access to your Cloudflare Dashboard

## Step 1: Enable Cloudflare Zero Trust

1. Go to **https://one.dash.cloudflare.com**
2. If you don't see "Zero Trust" in the left sidebar:
   - Click **"Zero Trust"** (or go to https://one.dash.cloudflare.com/teams)
   - You'll see a welcome screen
   - Click **"Get Started"** or **"Continue"**
   - This is free and enables Access features

## Step 2: Create an Access Application

1. In the Cloudflare Dashboard, go to **Zero Trust** → **Access** → **Applications**
2. Click **"Add an application"**
3. Select **"Self-hosted"**
4. You'll see a form. Fill it out:

   **Application Name:**
   ```
   HR Dashboard API
   ```

   **Session Duration:**
   - Leave default (24 hours) or adjust as needed

   **Application Domain:**
   - This is your Worker URL. Enter:
   ```
   hr-dashboard-api.massimo-d6f.workers.dev
   ```
   - ⚠️ **Important:** Click the dropdown and make sure you select your actual Worker domain (not create a new subdomain)

5. Click **"Next"** (or "Add application")

## Step 3: Configure Access Policies

After creating the application, you'll see a screen asking "Who can access this application?"

### Option A: Allow Specific Email Addresses (Recommended for Testing)

1. Click **"Add a policy"**
2. **Policy Name:**
   ```
   Allow HR Admin
   ```

3. **Action:** Select **"Allow"**

4. **Include:** Click **"Add a rule"** → Select **"Emails"**
   - Enter your email: `massimo@ticktockloans.com`
   - Click **"Add"**

5. Click **"Add policy"**

### Option B: Allow Entire Email Domain (For Multiple Users)

1. Click **"Add a policy"**
2. **Policy Name:**
   ```
   Allow TickTock Loans Employees
   ```

3. **Action:** Select **"Allow"**

4. **Include:** Click **"Add a rule"** → Select **"Email domains"**
   - Enter: `@ticktockloans.com`
   - Click **"Add"**

5. Click **"Add policy"**

### Option C: Allow Specific Users with Custom Rules

You can also combine rules:
- **Include:** `massimo@ticktockloans.com` (Emails)
- **Include:** `@ticktockloans.com` (Email domains) - for other employees

**Important:** At least one policy must have **Action: Allow** for users to access the application.

## Step 4: Skip "Setup" (For Worker)

1. After adding policies, you'll see a "Setup" step
2. This usually asks about CNAME records or DNS settings
3. **For Workers, you can skip this** - Access works with Workers automatically
4. Click **"Done"** or **"Next"** to complete

## Step 5: Verify Application is Active

1. Go to **Zero Trust** → **Access** → **Applications**
2. You should see your "HR Dashboard API" application listed
3. Status should show as **"Active"**

## Step 6: Test Access Authentication

### Test 1: Visit Your Worker URL

1. Open a new incognito/private browser window
2. Go to: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/health`
3. You should be redirected to Cloudflare Access login
4. Sign in with your allowed email address (`massimo@ticktockloans.com`)
5. After authentication, you'll see the health check response:
   ```json
   {"status":"ok"}
   ```

### Test 2: Test Authenticated Endpoint

1. Visit: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/me`
2. After Cloudflare Access authentication, you should see your user info:
   ```json
   {
     "email": "massimo@ticktockloans.com",
     "isAdmin": true,
     "employee": {...}
   }
   ```

### Test 3: Check Headers

The Worker automatically receives the `Cf-Access-Authenticated-User-Email` header. Your Worker code already handles this - no changes needed!

## Step 7: Configure Frontend (Optional)

If your frontend is also on Cloudflare Pages, you can protect it too:

1. Go to **Zero Trust** → **Access** → **Applications**
2. Click **"Add an application"** → **"Self-hosted"**
3. **Application Name:** `HR Dashboard Frontend`
4. **Application Domain:** Your Cloudflare Pages URL (e.g., `hr-dashboard.pages.dev`)
5. Add the same policies
6. Click **"Add application"**

## Step 8: Update Frontend API Base URL

Make sure your frontend is configured to use the Worker URL:

1. In your Cloudflare Pages project settings, add environment variable:
   - **Variable:** `VITE_API_BASE`
   - **Value:** `https://hr-dashboard-api.massimo-d6f.workers.dev`

2. Or edit `frontend/src/lib/api.ts` directly:
   ```typescript
   const RAW_BASE = import.meta.env.VITE_API_BASE || "https://hr-dashboard-api.massimo-d6f.workers.dev";
   ```

## Troubleshooting

### Issue: "Application not found" when visiting Worker URL

**Solution:**
- Make sure you entered the correct Worker URL in the application domain
- Check Zero Trust → Access → Applications to verify the URL is correct
- Wait a few minutes for changes to propagate

### Issue: Access login page doesn't appear

**Solution:**
- Make sure you're accessing the Worker URL directly (not from a cached redirect)
- Clear browser cache and cookies
- Try incognito/private window
- Check that the Access application is **Active** in the dashboard

### Issue: "Access Denied" after login

**Solution:**
- Check your email matches a policy (case-insensitive)
- Verify the policy Action is set to **"Allow"**
- Check the policy is enabled (toggle should be ON)

### Issue: API calls from frontend get 401

**Solution:**
- If frontend is on a different domain, you need to configure CORS
- Make sure the Worker has CORS enabled (it does in the code)
- For testing, you can still use `?as=email@example.com` parameter

### Issue: Want to disable Access temporarily

**Solution:**
- Go to Zero Trust → Access → Applications
- Find your application and toggle it **OFF**
- Users can access the Worker directly (you'll still need `?as=` for testing)

## How It Works

1. **User visits Worker URL** → Cloudflare intercepts the request
2. **Cloudflare checks if user is authenticated** → If not, shows login page
3. **User logs in** → Cloudflare validates against your policies
4. **Cloudflare adds headers** → `Cf-Access-Authenticated-User-Email` header is added
5. **Worker receives request** → Your code reads the header via `getUserEmail()`
6. **Worker responds** → With user-specific data

## Security Notes

- ✅ Only users in your Access policies can reach the Worker
- ✅ The `Cf-Access-Authenticated-User-Email` header is automatically added by Cloudflare
- ✅ You can't fake this header - it's cryptographically signed
- ⚠️ For production, remove the `?as=` parameter bypass or restrict it to localhost only

## Next Steps

1. ✅ Access is now protecting your Worker
2. ✅ Test all API endpoints through the browser (they'll use Access auth)
3. ✅ Frontend should work seamlessly if on same Cloudflare account
4. ✅ Add more email addresses/domains to policies as needed

## Quick Reference

**Access Dashboard:**
- https://one.dash.cloudflare.com → Zero Trust → Access → Applications

**Your Worker URL:**
- `https://hr-dashboard-api.massimo-d6f.workers.dev`

**Test Endpoints:**
- Health: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/health`
- User Info: `https://hr-dashboard-api.massimo-d6f.workers.dev/api/me`

## Need Help?

- Cloudflare Access Docs: https://developers.cloudflare.com/cloudflare-one/policies/access/
- Check application logs in Zero Trust → Access → Applications → [Your App] → Logs
- Verify policies are correct in Zero Trust → Access → Policies
