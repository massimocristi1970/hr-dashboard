# Railway Deployment Guide

This guide will help you deploy the HR Dashboard backend to Railway, which is more reliable than Cloudflare Workers and works well on all platforms.

## Prerequisites

- GitHub account (for repository connection)
- Railway account (sign up at https://railway.app - free tier available)
- Node.js 18+ installed locally (for testing)

## Quick Deployment Steps

### 1. Prepare Your Repository

The `backend-node/` directory is already configured for Railway. No changes needed!

### 2. Deploy to Railway

**Option A: Via Railway Dashboard (Recommended)**

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub if needed
5. Select your `hr-dashboard` repository
6. Railway will auto-detect the project - **IMPORTANT**: Click on the detected service and configure:
   - **Root Directory**: Set to `backend-node` (this is critical!)
   - Railway should auto-detect it's a Node.js project
7. Add Environment Variables (click "Variables" tab):
   - `HR_ADMIN_EMAILS` = `massimo@ticktockloans.com`
   - `PORT` = Leave empty (Railway sets this automatically)
8. Click **"Deploy"** or push to your repo to trigger auto-deploy

**Option B: Via Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in backend-node directory
cd backend-node
railway init

# Add environment variables
railway variables set HR_ADMIN_EMAILS=massimo@ticktockloans.com

# Deploy
railway up
```

### 3. Get Your API URL

After deployment:
1. Railway will assign a public URL (e.g., `hr-dashboard-api-production.up.railway.app`)
2. Go to your service → Settings → Generate Domain
3. Copy the URL (it will look like `https://your-app.up.railway.app`)

### 4. Update Frontend Configuration

Update your frontend to use the Railway backend URL:

**Option A: Environment Variable (Recommended for production)**

In your frontend deployment (Cloudflare Pages, Vercel, etc.), set:
- `VITE_API_BASE` = `https://your-app.up.railway.app`

**Option B: Direct Edit**

Edit `frontend/src/lib/api.ts`:
```typescript
const RAW_BASE = import.meta.env.VITE_API_BASE || "https://your-app.up.railway.app";
```

### 5. Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Test with auth (local dev)
curl "https://your-app.up.railway.app/api/me?as=test@example.com"
```

## Environment Variables

Set these in Railway Dashboard → Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `HR_ADMIN_EMAILS` | `massimo@ticktockloans.com` | Yes |
| `PORT` | (auto-set by Railway) | No |
| `DATABASE_PATH` | (defaults to `./data/hr_dashboard.db`) | No |

## Database Persistence

Railway provides ephemeral storage by default. For production persistence:

**Option 1: Railway Volume (Recommended)**
1. Add a Volume service to your project
2. Mount it to `/app/data`
3. Set `DATABASE_PATH=/app/data/hr_dashboard.db`

**Option 2: External Database (For production)**
- Use Railway PostgreSQL plugin (requires schema migration)
- Or use Railway's SQLite volume plugin

For now, the database will persist until the service restarts. This is fine for development/testing.

## Authentication Setup

### Local Development
- Use query parameter: `?as=email@example.com`

### Production
You have several options:

**Option 1: Railway Proxy Headers**
If using Railway's custom domain, you can set headers in your reverse proxy/load balancer.

**Option 2: Custom Middleware**
Add authentication middleware to `backend-node/src/index.ts`:
```typescript
// Add your auth logic here
const authToken = req.headers.authorization;
// Validate token and extract email
```

**Option 3: Cloudflare Access (In Front)**
- Deploy frontend to Cloudflare Pages
- Set up Cloudflare Access
- Pass `Cf-Access-Authenticated-User-Email` header through to Railway backend

## Monitoring & Logs

- View logs: Railway Dashboard → Your Service → Deployments → Click deployment → Logs
- Monitor: Railway Dashboard shows real-time metrics
- Alerts: Set up notifications in Railway Dashboard → Settings

## Troubleshooting

### Build Fails
- Check that Root Directory is set to `backend-node` in Railway
- Verify `package.json` exists in `backend-node/`
- Check build logs in Railway dashboard

### Database Issues
- Ensure data directory is writable
- For persistence, use a Railway Volume
- Check `DATABASE_PATH` environment variable

### API Not Responding
- Verify `PORT` environment variable is set (Railway auto-sets this)
- Check Railway logs for errors
- Ensure service is deployed (not just queued)

### CORS Issues
- CORS is enabled for all origins by default in `backend-node/src/index.ts`
- For production, you may want to restrict to your frontend domain

## Cost

Railway Free Tier includes:
- $5/month credit
- Sufficient for small-to-medium traffic
- Auto-pauses after inactivity on free tier

For production with higher traffic, consider Railway Pro ($20/month).

## Next Steps

1. ✅ Deploy backend to Railway (this guide)
2. ✅ Update frontend `VITE_API_BASE` to Railway URL
3. ✅ Deploy frontend (Cloudflare Pages, Vercel, or Netlify)
4. ✅ Test end-to-end
5. ✅ Set up authentication for production

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Check your GitHub repo
