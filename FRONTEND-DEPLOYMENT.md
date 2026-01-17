# Frontend Deployment Guide - Cloudflare Pages

Deploy your React frontend to Cloudflare Pages so you can see the full HR Dashboard with all functionality.

## Quick Options

### Option 1: Deploy to Cloudflare Pages (Recommended - Free!)

Since you're already using Cloudflare, this is the easiest option.

### Option 2: Test Locally First

You can run the frontend locally to see it in action immediately.

## Option 1: Deploy to Cloudflare Pages

### Step 1: Build the Frontend Locally (Test First)

1. **Navigate to frontend directory:**
```powershell
cd frontend
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Build the frontend:**
```powershell
npm run build
```

This creates a `dist/` folder with the built files.

4. **Test locally (optional):**
```powershell
npm run preview
```

Visit `http://localhost:4173` to see your site!

### Step 2: Push Code to GitHub

Make sure your code is on GitHub:

1. **Commit your changes:**
```powershell
# From project root
git add .
git commit -m "Update frontend API base URL"
git push
```

### Step 3: Deploy to Cloudflare Pages

**Method A: Via Dashboard (Easiest)**

1. Go to **https://dash.cloudflare.com**
2. Click **"Workers & Pages"** in left sidebar
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. **Authorize Cloudflare** to access your GitHub if needed
5. **Select your repository:** `hr-dashboard`
6. **Configure build:**
   - **Project name:** `hr-dashboard` (or any name you like)
   - **Production branch:** `main` (or your main branch)
   - **Build command:** `npm run build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** `frontend` ← **Important!**
7. Click **"Save and Deploy"**

**Method B: Via Wrangler CLI**

```powershell
# Install Pages CLI
npm install -g wrangler

# From frontend directory
cd frontend
wrangler pages deploy dist --project-name=hr-dashboard
```

### Step 4: Configure Environment Variables

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Pages**
2. Click your **hr-dashboard** project
3. Go to **Settings** → **Environment variables**
4. Add environment variable:
   - **Variable name:** `VITE_API_BASE`
   - **Value:** `https://hr-dashboard-api.massimo-d6f.workers.dev`
   - **Environment:** Production
5. Click **"Save"**
6. **Trigger a new deployment** (or just wait - it may auto-redeploy)

### Step 5: Protect Frontend with Cloudflare Access (Optional)

Since your Worker is protected, you may want to protect the frontend too:

1. Go to **Zero Trust** → **Access** → **Applications**
2. Click **"Add an application"** → **"Self-hosted"**
3. **Application Name:** `HR Dashboard Frontend`
4. **Application Domain:** Your Pages URL (e.g., `hr-dashboard.pages.dev`)
5. Add the same policy (allow `massimo@ticktockloans.com`)
6. Click **"Add application"**

### Step 6: Access Your Site!

1. Cloudflare will give you a URL like:
   - `https://hr-dashboard-xxxxx.pages.dev`
   - Or your custom domain if you set one up
2. **Visit the URL** in your browser
3. If Access is enabled, you'll login first
4. You should see the HR Dashboard with navigation:
   - **My Dashboard**
   - **Request Leave**
   - **Manager Approvals**
   - **HR Admin**

## Option 2: Run Locally (Quick Test)

If you want to see it immediately without deploying:

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

### Step 2: Set Dev Email (For Authentication)

Since the Worker needs authentication, you need to set a dev email:

1. **Run the dev server:**
```powershell
npm run dev
```

2. **Open browser to:** `http://localhost:5173`
3. **Open browser console** (F12)
4. **Run this command:**
```javascript
localStorage.setItem('dev_email', 'massimo@ticktockloans.com');
```
5. **Refresh the page**

The frontend will now add `?as=massimo@ticktockloans.com` to all API requests.

### Step 3: Update API Base URL

The frontend is already configured to use your Worker URL, but if you want to verify or change it:

1. Open `frontend/src/lib/api.ts`
2. Verify line 1 has your Worker URL:
```typescript
const RAW_BASE = import.meta.env.VITE_API_BASE || "https://hr-dashboard-api.massimo-d6f.workers.dev";
```

### Step 4: Test All Features

Once running locally:

- **My Dashboard** - View your leave requests
- **Request Leave** - Submit new leave requests
- **Manager Approvals** - Approve/decline requests (if you're a manager)
- **HR Admin** - Manage employees and entitlements (if you're an admin)

## Troubleshooting

### Issue: "Unauthorized" errors

**Solution:**
- Make sure `dev_email` is set in localStorage (if running locally)
- For production: Make sure Cloudflare Access is set up for the frontend
- Check browser console for error messages

### Issue: CORS errors

**Solution:**
- CORS is already configured in your Worker
- Make sure you're using the correct Worker URL
- Check that the Worker is accessible (test `/api/health`)

### Issue: Frontend can't reach Worker

**Solution:**
- Verify `VITE_API_BASE` environment variable is set in Cloudflare Pages
- Check that the Worker URL is correct: `https://hr-dashboard-api.massimo-d6f.workers.dev`
- Test the Worker directly: Visit `https://hr-dashboard-api.massimo-d6f.workers.dev/api/health`

### Issue: Build fails on Cloudflare Pages

**Solution:**
- Make sure **Root directory** is set to `frontend`
- Verify **Build output directory** is `frontend/dist`
- Check build logs in Cloudflare Pages dashboard

## What You'll See

Once deployed, the HR Dashboard includes:

### My Dashboard (`/`)
- View your leave balance
- See your leave request history
- Quick stats about your requests

### Request Leave (`/request-leave`)
- Submit new leave requests
- Select start/end dates
- Add reason (optional)

### Manager Approvals (`/manager`)
- View pending leave requests from your team
- Approve or decline requests
- Add manager notes

### HR Admin (`/admin`)
- View all employees
- Add/edit employees
- Set leave entitlements
- View all leave requests
- (Only visible if you're an HR admin)

## Next Steps After Deployment

1. ✅ **Add your first employee** (HR Admin page)
   - Go to HR Admin tab
   - Add employee with email: `massimo@ticktockloans.com`
   - Set leave entitlements

2. ✅ **Submit a test leave request** (Request Leave page)
   - Select dates
   - Submit request
   - Check My Dashboard to see it

3. ✅ **Set up more employees** (HR Admin page)
   - Add employees who report to you as manager
   - Then you can approve their requests in Manager Approvals

## Custom Domain (Optional)

To use your own domain:

1. Go to **Cloudflare Pages** → Your Project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `hr.ticktockloans.com`)
4. Cloudflare will configure DNS automatically
5. Update Access application to include the custom domain

## Quick Reference

**Frontend Local Dev:**
```powershell
cd frontend
npm install
npm run dev  # http://localhost:5173
```

**Frontend Build:**
```powershell
cd frontend
npm run build  # Creates dist/ folder
```

**Frontend Preview (Test Build):**
```powershell
cd frontend
npm run preview  # http://localhost:4173
```

**Your Worker URL:**
```
https://hr-dashboard-api.massimo-d6f.workers.dev
```

**Environment Variable:**
```
VITE_API_BASE=https://hr-dashboard-api.massimo-d6f.workers.dev
```
