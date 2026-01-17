# HR Dashboard API - Node.js Backend

This is an alternative backend implementation using Node.js/Express that can be deployed to any platform supporting Node.js (Railway, Render, Fly.io, Heroku, etc.).

## Features

- Identical API to Cloudflare Worker version
- SQLite database (same schema as D1)
- Easy deployment to multiple platforms
- No Cloudflare-specific dependencies

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run the server:
```bash
npm run dev
```

4. Test with impersonation:
```bash
curl "http://localhost:3000/api/health?as=test@example.com"
```

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Railway (Recommended - Easiest)

See **[RAILWAY-DEPLOYMENT.md](../RAILWAY-DEPLOYMENT.md)** for complete step-by-step instructions.

**Quick Steps:**
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repository
3. **Important**: Set Root Directory to `backend-node`
4. Add environment variable: `HR_ADMIN_EMAILS=massimo@ticktockloans.com`
5. Railway auto-deploys on every push!

The backend will be available at `https://your-app.up.railway.app`

### Render

1. Create a new Web Service in Render
2. Connect your repository
3. Settings:
   - Root Directory: `backend-node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables:
   - `HR_ADMIN_EMAILS`: `massimo@ticktockloans.com`

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create app: `fly launch` in `backend-node` directory
3. Set secrets:
```bash
fly secrets set HR_ADMIN_EMAILS=massimo@ticktockloans.com
```
4. Deploy: `fly deploy`

### Docker (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

- `HR_ADMIN_EMAILS`: Comma-separated list of HR admin email addresses
- `DATABASE_PATH`: Path to SQLite database file (default: `./data/hr_dashboard.db`)
- `PORT`: Server port (default: `3000`)

## Authentication

### Local Development
Use query parameter: `?as=email@example.com`

### Production
Set one of these headers:
- `X-User-Email`: Custom header with user email
- `Cf-Access-Authenticated-User-Email`: Cloudflare Access header

## Database

The database is automatically initialized on first run. To run migrations manually:

```bash
npm run migrate
```

The schema matches the Cloudflare D1 database exactly, so data can be migrated between platforms.

## API Endpoints

All endpoints match the Cloudflare Worker version:
- `GET /api/health` - Health check
- `GET /api/me` - Get current user
- `GET /api/leave/my-requests` - Get user's leave requests
- `POST /api/leave/request` - Submit leave request
- `GET /api/leave/pending` - Get pending requests (manager)
- `PUT /api/leave/:id/approve` - Approve request
- `PUT /api/leave/:id/decline` - Decline request
- `GET /api/admin/employees` - List all employees (admin)
- `POST /api/admin/employees` - Add/update employee (admin)
- `POST /api/admin/entitlements` - Set leave entitlement (admin)
- `GET /api/admin/all-requests` - List all requests (admin)
