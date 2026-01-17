# Fix Cloudflare Access Blocking CORS Preflight

## The Problem

The OPTIONS preflight request is returning **403 Forbidden**. This means **Cloudflare Access is blocking the OPTIONS request** before it reaches your Worker code.

## Why This Happens

Cloudflare Access protects the Worker, but **OPTIONS requests (CORS preflight) can't include authentication**. Access blocks them before your Worker can respond with CORS headers.

## The Solution: Configure Cloudflare Access

You need to allow OPTIONS requests to bypass Access authentication.

### Step 1: Go to Cloudflare Access Settings

1. Go to: **https://one.dash.cloudflare.com**
2. Navigate: **Zero Trust** → **Access** → **Applications**
3. Find your **"HR Dashboard API"** application
4. Click on it to edit

### Step 2: Add Bypass Policy for OPTIONS

1. In the application settings, go to **"Policies"** tab
2. Click **"Add a policy"**
3. Configure:
   - **Policy name:** `Allow CORS Preflight`
   - **Action:** `Bypass` ← **Important: Use Bypass, not Allow**
   - **Include:** Select **"Service Token"** or **"Any authenticated user"**
   - **OR use a header rule:**
     - **Include:** Click **"Add a rule"** → **"Request method"**
     - **Method:** `OPTIONS`
   - Click **"Add policy"**

### Step 3: Policy Order Matters

The OPTIONS bypass policy should be **ABOVE** your main authentication policy. Reorder policies if needed:
- Drag the "Allow CORS Preflight" policy to the top
- Your main "Allow HR Admin" policy should be below it

### Step 4: Alternative - Use Access Custom Policy

If the above doesn't work, try:

1. Go to **Access** → **Applications** → Your application
2. Go to **"Policies"** tab
3. Add policy with:
   - **Action:** `Bypass`
   - **Include:** **"Request method"** → `OPTIONS`
   - This allows all OPTIONS requests to bypass Access

### Step 5: Test

After saving:

1. Test OPTIONS request:
   ```bash
   curl -X OPTIONS "https://hr-dashboard-api.massimo-d6f.workers.dev/api/leave/my-requests" -H "Origin: https://cc18c8d1.hr-dashboard-48h.pages.dev" -v
   ```
   Should return **204** with CORS headers, not 403.

2. Refresh your Pages site
3. CORS error should be gone

## Alternative: Disable Access Temporarily (For Testing)

If you just want to test the site:

1. Go to **Access** → **Applications** → Your application
2. Toggle **"Application"** to **OFF** (temporarily)
3. Test your site
4. **Turn it back ON** and configure the bypass policy

## Why CORS Preflight Needs Bypass

- OPTIONS requests are sent **automatically by the browser** before the actual request
- They **cannot include authentication** headers
- Cloudflare Access sees no auth → blocks → 403
- Your Worker code never runs → no CORS headers → CORS error

The solution is to let OPTIONS requests **bypass Access** so your Worker can handle them and return CORS headers.

## Quick Test After Fix

```bash
curl -X OPTIONS "https://hr-dashboard-api.massimo-d6f.workers.dev/api/leave/my-requests" \
  -H "Origin: https://cc18c8d1.hr-dashboard-48h.pages.dev" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**Expected:** `HTTP/1.1 204` with `Access-Control-Allow-Origin` header  
**Current (wrong):** `HTTP/1.1 403 Forbidden`
