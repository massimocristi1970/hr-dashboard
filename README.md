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
├── backend/          # Cloudflare Worker API
│   ├── src/
│   │   └── index.ts
│   ├── migrations/
│   │   └── 0001_init.sql
│   ├── wrangler.toml
│   └── package.json
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (LTS version)
- Git
- Cloudflare account

### Backend Setup

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

4. Copy the database_id from output and update `wrangler.toml`

5. Run migrations:
   ```powershell
   npm run d1:migrate:local    # For local dev
   npm run d1:migrate:remote   # For production
   ```

6. Start dev server:
   ```powershell
   npm run dev
   ```

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

#### Backend (Worker)
```powershell
cd backend
npm run deploy
```

#### Frontend (Cloudflare Pages)
1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE`: Your Worker URL

#### Cloudflare Access
Set up Cloudflare Access to protect both frontend and backend:
- Create Access Application
- Configure email header: `Cf-Access-Authenticated-User-Email`

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