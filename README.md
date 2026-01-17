# HR Dashboard

A modern HR dashboard built with Cloudflare Pages, Workers, and D1 database.

## Features

- Employee leave request management
- Manager approval workflow
- HR admin panel
- OneDrive folder integration
- Cloudflare Access authentication

## Project Structure

```
hr-dashboard/
├── backend/          # Cloudflare Worker API (fixed)
│   ├── src/
│   │   └── index.ts
│   ├── migrations/
│   │   └── 0001_init.sql
│   ├── wrangler.toml
│   └── package.json
├── backend-node/     # Alternative Node.js/Express backend
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── README.md
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Important: Database Binding Fix

**The Cloudflare Worker has been fixed!** The code was using `env.DB` but `wrangler.toml` defined the binding as `hr_dashboard_db`. This has been corrected. If you're still experiencing deployment issues with Cloudflare, consider using the alternative Node.js backend in `backend-node/` which can be deployed to Railway, Render, Fly.io, or any Node.js platform.

## Setup Instructions

### Prerequisites

- Node.js (LTS version)
- Git
- Cloudflare account

### Backend Setup

#### Option 1: Cloudflare Worker (Fixed)

1. Navigate to backend directory:
   ```powershell
   cd backend
   npm install
   ```

2. Login to Cloudflare:
   ```powershell
   npx wrangler login
   ```

3. Create D1 database:
   ```powershell
   npx wrangler d1 create hr_dashboard_db
   ```

4. Copy the database_id from output and update `wrangler.toml` (ensure `binding = "hr_dashboard_db"` matches the code)

5. Run migrations:
   ```powershell
   npm run d1:migrate:local    # For local dev
   npm run d1:migrate:remote   # For production
   ```

6. Start dev server:
   ```powershell
   npm run dev
   ```

**Note:** The database binding has been fixed (`env.DB` → `env.hr_dashboard_db`). If you still encounter deployment issues with Wrangler on Windows, try Option 2.

#### Option 2: Node.js/Express Backend (Recommended for reliability)

See `backend-node/README.md` for full instructions. Quick start:

1. Navigate to backend-node:
   ```powershell
   cd backend-node
   npm install
   ```

2. Copy environment template:
   ```powershell
   copy env.example .env
   # Edit .env with your settings
   ```

3. Start dev server:
   ```powershell
   npm run dev
   ```

This backend can be deployed to Railway, Render, Fly.io, or any Node.js platform without Cloudflare-specific tooling issues.

### Frontend Setup

1. Navigate to frontend directory:
   ```powershell
   cd frontend
   npm install
   ```

2. Start dev server:
   ```powershell
   npm run dev
   ```

3. Open http://localhost:5173

### Local Development Authentication

For local development, the API supports impersonation via query parameter:
- Add `?as=your-email@example.com` to API requests
- The frontend automatically handles this via `localStorage`
- Set your dev email in browser console: `localStorage.setItem('dev_email', 'your-email@example.com')`

### Deployment

#### Backend: Cloudflare Worker (Free & Recommended)

**The database binding has been fixed!** Deploy the Cloudflare Worker:

See **[CLOUDFLARE-DEPLOYMENT.md](CLOUDFLARE-DEPLOYMENT.md)** for complete step-by-step instructions.

**Quick Steps:**
```powershell
cd backend
npm install
npx wrangler login
npx wrangler d1 create hr_dashboard_db
# Copy database_id and update wrangler.toml
npm run d1:migrate:remote
npm run deploy
```

Then:
1. Get your Worker URL from deployment output
2. Update frontend `VITE_API_BASE` to the Worker URL
3. Set up Cloudflare Access for production authentication

**Cloudflare Free Tier Includes:**
- 100,000 requests/day
- D1 database (5M reads, 100K writes/day)
- No credit card required!

#### Alternative Backend Options

**Node.js Backend** (if you prefer):
- See `RAILWAY-DEPLOYMENT.md` for Railway deployment
- See `backend-node/README.md` for other platforms

#### Frontend (Cloudflare Pages or any static host)
1. Connect your GitHub repository to Cloudflare Pages (or Vercel, Netlify, etc.)
2. Set build settings:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE`: Your backend API URL (Worker or Node.js backend)

#### Authentication

**Cloudflare Access** (for Cloudflare Worker):
- Set up Cloudflare Access to protect both frontend and backend
- Configure email header: `Cf-Access-Authenticated-User-Email`

**Custom Headers** (for Node.js backend):
- Set `X-User-Email` header in your reverse proxy/load balancer
- Or integrate with your existing auth system

## Configuration

### Backend
Edit `backend/wrangler.toml`:
- Update `HR_ADMIN_EMAILS` with comma-separated admin emails
- Update `database_id` with your D1 database ID

### Frontend
Edit `frontend/.env`:
- Update `VITE_API_BASE` with your Worker URL

## Usage

1. **HR Admin**: Add employees and set leave entitlements
2. **Employees**: Request leave and view history
3. **Managers**: Approve/decline leave requests for their team

## License

MIT