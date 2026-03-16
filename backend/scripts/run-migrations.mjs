import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = dirname(__dirname);
const migrationsDir = join(backendDir, 'migrations');

const mode = process.argv[2];

if (!['local', 'remote'].includes(mode)) {
  console.error('Usage: node scripts/run-migrations.mjs <local|remote>');
  process.exit(1);
}

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

for (const file of migrationFiles) {
  const filePath = join('migrations', file);
  console.log(`Applying ${file} (${mode})`);

  const result = spawnSync(
    'wrangler',
    ['d1', 'execute', 'hr_dashboard_db', `--${mode}`, '--file', filePath],
    {
      cwd: backendDir,
      stdio: 'inherit',
      shell: true,
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
