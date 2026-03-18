# HR Dashboard Backend

This folder contains the Cloudflare Worker API and D1 migrations for the HR dashboard.

## Common Commands

From this folder:

```powershell
npm install
npm run d1:migrate:local
npm run d1:migrate:remote
npm run deploy
```

## Safe Migration Flow

The migration runner now tracks applied migrations in a `schema_migrations` table.

That means:

- `npm run d1:migrate:remote` applies only migrations that have not already been recorded
- existing databases are bootstrapped by detecting whether older schema changes are already present
- old migrations are not blindly replayed on every run

## Recommended Deploy Process

For production changes:

```powershell
cd C:\Dev\GitHub\hr-dashboard\backend
npm run d1:migrate:remote
npm run deploy
```

For local testing:

```powershell
cd C:\Dev\GitHub\hr-dashboard\backend
npm run d1:migrate:local
npm run dev
```

## Notes

- If Wrangler is not authenticated, run `npx wrangler login`
- The D1 database binding is configured in `wrangler.toml`
- Migration files are executed in filename order from `migrations/`
- If a one-off migration ever needs to be applied manually, you can run:

```powershell
npx wrangler d1 execute hr_dashboard_db --remote --file migrations/0005_leave_type.sql
```
