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

function parseJsonOutput(rawOutput) {
  const trimmed = rawOutput.trim();
  if (!trimmed) return null;

  const jsonStart = Math.min(
    ...['{', '[']
      .map((token) => trimmed.indexOf(token))
      .filter((index) => index >= 0)
  );

  if (!Number.isFinite(jsonStart)) {
    return null;
  }

  return JSON.parse(trimmed.slice(jsonStart));
}

function runWrangler(args, { capture = false } = {}) {
  const finalArgs = ['d1', 'execute', 'hr_dashboard_db', `--${mode}`, ...args];
  if (capture) {
    finalArgs.push('--json');
  }

  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['wrangler', ...finalArgs], {
    cwd: backendDir,
    encoding: 'utf8',
    shell: false,
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    if (capture) {
      process.stderr.write(result.stderr || '');
      process.stdout.write(result.stdout || '');
    }
    process.exit(result.status ?? 1);
  }

  if (!capture) {
    return null;
  }

  return parseJsonOutput(result.stdout || '');
}

function flattenResults(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.flatMap(flattenResults);
  }
  if (Array.isArray(payload.results)) {
    return payload.results;
  }
  if (payload.result && Array.isArray(payload.result)) {
    return payload.result;
  }
  if (payload.result?.results && Array.isArray(payload.result.results)) {
    return payload.result.results;
  }
  return [];
}

function escapeSqlString(value) {
  return value.replaceAll("'", "''");
}

function queryRows(sql) {
  const payload = runWrangler(['--command', sql], { capture: true });
  return flattenResults(payload);
}

function executeSql(sql) {
  runWrangler(['--command', sql]);
}

function ensureMigrationsTable() {
  executeSql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

function getAppliedMigrations() {
  const rows = queryRows('SELECT name FROM schema_migrations ORDER BY name');
  return new Set(rows.map((row) => row.name));
}

function getTableNames() {
  const rows = queryRows("SELECT name FROM sqlite_master WHERE type = 'table'");
  return new Set(rows.map((row) => row.name));
}

function getTableSql(tableName) {
  const rows = queryRows(
    `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '${escapeSqlString(tableName)}'`
  );
  return rows[0]?.sql || '';
}

function getColumnNames(tableName) {
  const rows = queryRows(`PRAGMA table_info(${tableName})`);
  return new Set(rows.map((row) => row.name));
}

function markMigrationApplied(fileName) {
  executeSql(`
    INSERT OR IGNORE INTO schema_migrations (name)
    VALUES ('${escapeSqlString(fileName)}')
  `);
}

function bootstrapExistingSchema(appliedMigrations) {
  const tableNames = getTableNames();
  const employeeColumns = getColumnNames('employees');
  const leaveRequestColumns = getColumnNames('leave_requests');
  const leaveRequestsSql = getTableSql('leave_requests');

  const bootstrapChecks = [
    {
      file: '0001_init.sql',
      applied:
        tableNames.has('employees') &&
        tableNames.has('leave_entitlements') &&
        tableNames.has('leave_requests') &&
        tableNames.has('holidays_calendar'),
    },
    {
      file: '0002_onedrive_and_blocked_days.sql',
      applied: tableNames.has('agent_files') && tableNames.has('blocked_days'),
    },
    {
      file: '0003_add_cancelled_status.sql',
      applied: leaveRequestsSql.includes("'cancelled'"),
    },
    {
      file: '0004_half_day_leave.sql',
      applied:
        leaveRequestColumns.has('start_half_day') &&
        leaveRequestColumns.has('end_half_day'),
    },
    {
      file: '0005_leave_type.sql',
      applied: leaveRequestColumns.has('leave_type'),
    },
    {
      file: '0006_employee_onedrive_workflow.sql',
      applied:
        employeeColumns.has('onedrive_shared_with_employee') &&
        employeeColumns.has('onedrive_extra_access_links'),
    },
    {
      file: '0007_appraisals.sql',
      applied:
        tableNames.has('appraisal_settings') &&
        tableNames.has('appraisal_areas') &&
        tableNames.has('appraisals') &&
        tableNames.has('appraisal_area_responses'),
    },
    {
      file: '0008_leave_soft_delete.sql',
      applied:
        leaveRequestColumns.has('deleted_at') &&
        leaveRequestColumns.has('deleted_by_email'),
    },
  ];

  for (const check of bootstrapChecks) {
    if (check.applied && !appliedMigrations.has(check.file)) {
      console.log(`Recording previously applied migration ${check.file}`);
      markMigrationApplied(check.file);
      appliedMigrations.add(check.file);
    }
  }
}

ensureMigrationsTable();

const appliedMigrations = getAppliedMigrations();
bootstrapExistingSchema(appliedMigrations);

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

for (const file of migrationFiles) {
  if (appliedMigrations.has(file)) {
    console.log(`Skipping ${file} (${mode})`);
    continue;
  }

  console.log(`Applying ${file} (${mode})`);
  runWrangler(['--file', join('migrations', file)]);
  markMigrationApplied(file);
}
