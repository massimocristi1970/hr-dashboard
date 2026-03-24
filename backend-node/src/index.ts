import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/hr_dashboard.db');
if (!existsSync(path.dirname(dbPath))) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

const optionalEmail = z.string().email().optional().or(z.literal(''));
const optionalUrl = z.string().url().optional().or(z.literal(''));

const EmployeeSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  manager_email: optionalEmail,
  onedrive_folder_url: optionalUrl,
});

const LeaveRequestSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
  leave_type: z.enum(['annual', 'unpaid', 'sick']),
  start_half_day: z.enum(['full', 'am', 'pm']).optional(),
  end_half_day: z.enum(['full', 'am', 'pm']).optional(),
});

const LeaveStatusSchema = z.enum(['pending', 'approved', 'declined', 'cancelled']);

const AdminLeaveRequestSchema = LeaveRequestSchema.extend({
  employee_id: z.number().int().positive(),
  status: LeaveStatusSchema,
  manager_notes: z.string().optional(),
});

const LeaveEntitlementSchema = z.object({
  employee_id: z.number().int().positive(),
  year: z.number().int(),
  annual_allowance_days: z.number().positive(),
  carryover_days: z.number().nonnegative(),
});

const AgentFileSchema = z.object({
  filename: z.string().min(1),
  file_description: z.string().optional(),
  onedrive_file_url: z.string().url(),
  file_size_bytes: z.number().optional(),
  file_type: z.string().optional(),
});

const BlockedDaySchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1),
});

const BankHolidaySchema = z.object({
  holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
});

const ApprovalSchema = z.object({
  notes: z.string().optional(),
  admin_override: z.boolean().optional(),
});

function ensureBaseSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      manager_email TEXT,
      onedrive_folder_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_entitlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      annual_allowance_days REAL NOT NULL DEFAULT 28.0,
      carryover_days REAL NOT NULL DEFAULT 0.0,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, year)
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_requested REAL NOT NULL,
      reason TEXT,
      leave_type TEXT NOT NULL DEFAULT 'annual',
      status TEXT NOT NULL DEFAULT 'pending',
      manager_notes TEXT,
      start_half_day TEXT DEFAULT 'full',
      end_half_day TEXT DEFAULT 'full',
      deleted_at TEXT,
      deleted_by_email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
    );

    CREATE TABLE IF NOT EXISTS holidays_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      holiday_date TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_description TEXT,
      onedrive_file_url TEXT NOT NULL,
      file_size_bytes INTEGER,
      file_type TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS blocked_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blocked_date TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      created_by_email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
    CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_email);
    CREATE INDEX IF NOT EXISTS idx_agent_files_employee ON agent_files(employee_id);
    CREATE INDEX IF NOT EXISTS idx_blocked_days_date ON blocked_days(blocked_date);
  `);
}

function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  const hasColumn = columns.some((entry) => entry.name === column);
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function ensureLeaveRequestsTableSupportsCancelled() {
  const table = db
    .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'leave_requests'`)
    .get() as { sql?: string } | undefined;

  if (!table?.sql || table.sql.includes("'cancelled'")) {
    return;
  }

  db.exec(`
    CREATE TABLE leave_requests_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_requested REAL NOT NULL,
      reason TEXT,
      leave_type TEXT NOT NULL DEFAULT 'annual',
      status TEXT NOT NULL DEFAULT 'pending',
      manager_notes TEXT,
      start_half_day TEXT DEFAULT 'full',
      end_half_day TEXT DEFAULT 'full',
      deleted_at TEXT,
      deleted_by_email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
    );

    INSERT INTO leave_requests_new (
      id, employee_id, start_date, end_date, days_requested, reason, leave_type,
      status, manager_notes, start_half_day, end_half_day, deleted_at, deleted_by_email, created_at, updated_at
    )
    SELECT
      id,
      employee_id,
      start_date,
      end_date,
      days_requested,
      reason,
      COALESCE(leave_type, 'annual'),
      status,
      manager_notes,
      COALESCE(start_half_day, 'full'),
      COALESCE(end_half_day, 'full'),
      NULL,
      NULL,
      created_at,
      updated_at
    FROM leave_requests;

    DROP TABLE leave_requests;
    ALTER TABLE leave_requests_new RENAME TO leave_requests;
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
  `);
}

ensureBaseSchema();
ensureColumn('leave_requests', 'leave_type', `TEXT DEFAULT 'annual'`);
ensureColumn('leave_requests', 'start_half_day', `TEXT DEFAULT 'full'`);
ensureColumn('leave_requests', 'end_half_day', `TEXT DEFAULT 'full'`);
ensureColumn('leave_requests', 'deleted_at', `TEXT`);
ensureColumn('leave_requests', 'deleted_by_email', `TEXT`);
ensureLeaveRequestsTableSupportsCancelled();

function getUserEmail(req: Request): string | null {
  const headerEmail =
    (req.headers['cf-access-authenticated-user-email'] as string) ||
    (req.headers['x-user-email'] as string);

  if (headerEmail) return headerEmail;

  const impersonate = req.query.as as string;
  if (impersonate) return impersonate;

  return null;
}

function isHrAdmin(email: string): boolean {
  const adminEmails = (process.env.HR_ADMIN_EMAILS || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDateString(d));
  }

  return dates;
}

function isWeekendDate(dateString: string): boolean {
  const day = parseDateString(dateString).getUTCDay();
  return day === 0 || day === 6;
}

function getHolidayDateSet(startDate: string, endDate: string): Set<string> {
  const holidays = db.prepare(`
    SELECT holiday_date
    FROM holidays_calendar
    WHERE holiday_date >= ?
      AND holiday_date <= ?
  `).all(startDate, endDate) as Array<{ holiday_date: string }>;

  return new Set(holidays.map((holiday) => holiday.holiday_date));
}

function calculateDays(
  startDate: string,
  endDate: string,
  startHalfDay: 'full' | 'am' | 'pm' = 'full',
  endHalfDay: 'full' | 'am' | 'pm' = 'full'
): number {
  const holidayDates = getHolidayDateSet(startDate, endDate);
  const workingDates = getDatesInRange(startDate, endDate).filter(
    (date) => !isWeekendDate(date) && !holidayDates.has(date)
  );

  if (workingDates.length === 0) {
    return 0;
  }

  if (startDate === endDate) {
    if (startHalfDay === 'full') return 1;
    return 0.5;
  }

  let total = workingDates.length;
  if (workingDates.includes(startDate) && startHalfDay !== 'full') total -= 0.5;
  if (workingDates.includes(endDate) && endHalfDay !== 'full') total -= 0.5;

  return Math.max(0, total);
}

function normalizeText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getLeaveRequestById(requestId: number) {
  const request = db.prepare(`
    SELECT lr.*, e.full_name, e.email, e.manager_email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.id = ?
      AND lr.deleted_at IS NULL
  `).get(requestId) as any;

  if (!request) {
    return null;
  }

  return applyCalculatedDays(request);
}

function applyCalculatedDays<T extends {
  id?: number;
  start_date: string;
  end_date: string;
  start_half_day?: 'full' | 'am' | 'pm';
  end_half_day?: 'full' | 'am' | 'pm';
  days_requested?: number;
}>(request: T): T {
  const days = calculateDays(
    request.start_date,
    request.end_date,
    request.start_half_day || 'full',
    request.end_half_day || 'full'
  );

  if (typeof request.id === 'number' && request.days_requested !== days) {
    db.prepare(`
      UPDATE leave_requests
      SET days_requested = ?, updated_at = datetime('now')
      WHERE id = ?
        AND deleted_at IS NULL
    `).run(days, request.id);
  }

  return {
    ...request,
    days_requested: days,
  };
}

function applyCalculatedDaysToRequests<T extends {
  id?: number;
  start_date: string;
  end_date: string;
  start_half_day?: 'full' | 'am' | 'pm';
  end_half_day?: 'full' | 'am' | 'pm';
  days_requested?: number;
}>(requests: T[]): T[] {
  return requests.map((request) => applyCalculatedDays(request));
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  (req as any).userEmail = userEmail;
  (req as any).isAdmin = isHrAdmin(userEmail);
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/me', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;

  const employee = db.prepare('SELECT * FROM employees WHERE email = ?').get(userEmail);
  res.json({ email: userEmail, isAdmin, employee });
});

app.get('/api/leave/my-requests', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const requests = db
    .prepare('SELECT * FROM leave_requests WHERE employee_id = ? AND deleted_at IS NULL ORDER BY created_at DESC')
    .all(employee.id);
  res.json(applyCalculatedDaysToRequests(requests as any[]));
});

app.put('/api/leave/:id/cancel', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  const requestId = parseInt(req.params.id, 10);

  const request = db
    .prepare(`
      SELECT lr.*, e.email as employee_email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.id = ?
        AND lr.deleted_at IS NULL
    `)
    .get(requestId) as any;

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.employee_email !== userEmail && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to cancel this request' });
  }

  const today = new Date().toISOString().split('T')[0];
  const canCancel = request.status === 'pending' || request.status === 'approved';
  const hasStarted = request.start_date <= today;

  if (!canCancel) {
    return res.status(400).json({ error: 'Cannot cancel: Request has already been declined or cancelled' });
  }

  if (hasStarted) {
    return res.status(400).json({ error: 'Cannot cancel: Leave has already started or passed' });
  }

  db.prepare('UPDATE leave_requests SET status = ?, updated_at = datetime("now") WHERE id = ? AND deleted_at IS NULL').run('cancelled', requestId);
  res.json({ success: true });
});

app.post('/api/leave/request', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const validated = LeaveRequestSchema.parse(req.body);

  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const startHalfDay = validated.start_half_day || 'full';
  const endHalfDay = validated.end_half_day || 'full';
  const days = calculateDays(validated.start_date, validated.end_date, startHalfDay, endHalfDay);

  db.prepare(`
    INSERT INTO leave_requests (
      employee_id, start_date, end_date, days_requested, reason, status,
      leave_type, start_half_day, end_half_day
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    employee.id,
    validated.start_date,
    validated.end_date,
    days,
    validated.reason || '',
    'pending',
    validated.leave_type,
    startHalfDay,
    endHalfDay
  );

  res.json({ success: true, days_requested: days });
});

app.get('/api/leave/pending', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;

  const requests = db.prepare(`
    SELECT lr.*, e.full_name, e.email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE e.manager_email = ? AND lr.status = 'pending' AND lr.deleted_at IS NULL
    ORDER BY lr.created_at ASC
  `).all(userEmail) as any[];

  const withContext = requests.map((request) => {
    const normalizedRequest = applyCalculatedDays(request);
    const conflicts = db.prepare(`
      SELECT lr.*, e.full_name, e.email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'approved'
      AND lr.deleted_at IS NULL
      AND lr.id != ?
      AND lr.start_date <= ?
      AND lr.end_date >= ?
    `).all(request.id, request.end_date, request.start_date);

    const blockedDays = db.prepare(`
      SELECT * FROM blocked_days
      WHERE blocked_date >= ? AND blocked_date <= ?
    `).all(request.start_date, request.end_date);

    return {
      ...normalizedRequest,
      conflicts,
      blocked_days: blockedDays,
    };
  });

  res.json(withContext);
});

app.put('/api/leave/:id/:action', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  const requestId = parseInt(req.params.id, 10);
  const action = req.params.action;
  const validated = ApprovalSchema.parse(req.body);

  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const request = db.prepare(`
    SELECT lr.*, e.manager_email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.id = ?
      AND lr.deleted_at IS NULL
  `).get(requestId) as any;

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.manager_email !== userEmail && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (action === 'approve') {
    const blockedDays = db.prepare(`
      SELECT * FROM blocked_days
      WHERE blocked_date >= ? AND blocked_date <= ?
    `).all(request.start_date, request.end_date);

    if (blockedDays.length > 0 && (!isAdmin || !validated.admin_override)) {
      return res.status(400).json({
        error: 'Cannot approve: blocked days in range',
        blocked_days: blockedDays,
      });
    }
  }

  const newStatus = action === 'approve' ? 'approved' : 'declined';
  db.prepare('UPDATE leave_requests SET status = ?, manager_notes = ?, updated_at = datetime("now") WHERE id = ? AND deleted_at IS NULL')
    .run(newStatus, validated.notes || '', requestId);

  res.json({ success: true });
});

app.get('/api/files/my-files', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const employee = db.prepare('SELECT id, onedrive_folder_url FROM employees WHERE email = ?').get(userEmail) as any;

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const files = db.prepare('SELECT * FROM agent_files WHERE employee_id = ? ORDER BY uploaded_at DESC').all(employee.id);
  res.json({ files, onedrive_folder_url: employee.onedrive_folder_url });
});

app.post('/api/files/upload', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const validated = AgentFileSchema.parse(req.body);
  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.prepare(`
    INSERT INTO agent_files (employee_id, filename, file_description, onedrive_file_url, file_size_bytes, file_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    employee.id,
    validated.filename,
    validated.file_description || null,
    validated.onedrive_file_url,
    validated.file_size_bytes || null,
    validated.file_type || null
  );

  res.json({ success: true });
});

app.delete('/api/files/:id', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const fileId = parseInt(req.params.id, 10);
  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const file = db.prepare('SELECT * FROM agent_files WHERE id = ? AND employee_id = ?').get(fileId, employee.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found or access denied' });
  }

  db.prepare('DELETE FROM agent_files WHERE id = ?').run(fileId);
  res.json({ success: true });
});

app.get('/api/admin/employees', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const currentYear = new Date().getFullYear();
  const employees = db.prepare('SELECT * FROM employees ORDER BY full_name').all() as any[];
  const entitlements = db.prepare(`
    SELECT employee_id, annual_allowance_days, carryover_days
    FROM leave_entitlements
    WHERE year = ?
  `).all(currentYear) as any[];

  const approvedLeave = db.prepare(`
    SELECT id, employee_id, start_date, end_date, days_requested, leave_type, start_half_day, end_half_day
    FROM leave_requests
    WHERE status = 'approved'
    AND deleted_at IS NULL
    AND strftime('%Y', start_date) = ?
  `).all(currentYear.toString()) as any[];

  const entitlementMap = new Map<number, { allowance: number; carryover: number }>();
  for (const entry of entitlements) {
    entitlementMap.set(entry.employee_id, {
      allowance: entry.annual_allowance_days,
      carryover: entry.carryover_days,
    });
  }

  const takenMap = new Map<number, { annual: number; unpaid: number; sick: number }>();
  for (const entry of applyCalculatedDaysToRequests(approvedLeave)) {
    const existing = takenMap.get(entry.employee_id) || { annual: 0, unpaid: 0, sick: 0 };
    if (entry.leave_type === 'annual') existing.annual += entry.days_requested || 0;
    if (entry.leave_type === 'unpaid') existing.unpaid += entry.days_requested || 0;
    if (entry.leave_type === 'sick') existing.sick += entry.days_requested || 0;
    takenMap.set(entry.employee_id, existing);
  }

  const employeesWithLeave = employees.map((employee) => {
    const entitlement = entitlementMap.get(employee.id);
    const taken = takenMap.get(employee.id) || { annual: 0, unpaid: 0, sick: 0 };
    const total = entitlement ? entitlement.allowance + entitlement.carryover : 0;

    return {
      ...employee,
      leave_summary: {
        year: currentYear,
        total_allowance: total,
        annual_allowance: entitlement?.allowance || 0,
        carryover: entitlement?.carryover || 0,
        taken: taken.annual,
        unpaid_taken: taken.unpaid,
        sick_taken: taken.sick,
        remaining: total - taken.annual,
        entitlement_set: !!entitlement,
      },
    };
  });

  res.json(employeesWithLeave);
});

app.post('/api/admin/employees', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validated = EmployeeSchema.parse(req.body);
  db.prepare(`
    INSERT INTO employees (email, full_name, manager_email, onedrive_folder_url)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      full_name = ?,
      manager_email = ?,
      onedrive_folder_url = ?
  `).run(
    validated.email,
    validated.full_name,
    validated.manager_email || null,
    validated.onedrive_folder_url || null,
    validated.full_name,
    validated.manager_email || null,
    validated.onedrive_folder_url || null
  );

  res.json({ success: true });
});

app.post('/api/admin/entitlements', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validated = LeaveEntitlementSchema.parse(req.body);
  db.prepare(`
    INSERT INTO leave_entitlements (employee_id, year, annual_allowance_days, carryover_days)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(employee_id, year) DO UPDATE SET
      annual_allowance_days = ?,
      carryover_days = ?
  `).run(
    validated.employee_id,
    validated.year,
    validated.annual_allowance_days,
    validated.carryover_days,
    validated.annual_allowance_days,
    validated.carryover_days
  );

  res.json({ success: true });
});

app.get('/api/admin/all-requests', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const requests = db.prepare(`
    SELECT lr.*, e.full_name, e.email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.deleted_at IS NULL
    ORDER BY lr.created_at DESC
  `).all();

  res.json(applyCalculatedDaysToRequests(requests as any[]));
});

app.post('/api/admin/leave', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validated = AdminLeaveRequestSchema.parse(req.body);
  const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(validated.employee_id) as any;
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const startHalfDay = validated.start_half_day || 'full';
  const endHalfDay = validated.end_half_day || 'full';
  const days = calculateDays(validated.start_date, validated.end_date, startHalfDay, endHalfDay);

  const result = db.prepare(`
    INSERT INTO leave_requests (
      employee_id, start_date, end_date, days_requested, reason, status,
      leave_type, start_half_day, end_half_day, manager_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    validated.employee_id,
    validated.start_date,
    validated.end_date,
    days,
    normalizeText(validated.reason) || '',
    validated.status,
    validated.leave_type,
    startHalfDay,
    endHalfDay,
    normalizeText(validated.manager_notes)
  );

  res.json(getLeaveRequestById(Number(result.lastInsertRowid)));
});

app.put('/api/admin/leave/:id', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const requestId = parseInt(req.params.id, 10);
  const existing = getLeaveRequestById(requestId);
  if (!existing) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const validated = AdminLeaveRequestSchema.parse(req.body);
  const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(validated.employee_id) as any;
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const startHalfDay = validated.start_half_day || 'full';
  const endHalfDay = validated.end_half_day || 'full';
  const days = calculateDays(validated.start_date, validated.end_date, startHalfDay, endHalfDay);

  db.prepare(`
    UPDATE leave_requests
    SET employee_id = ?,
        start_date = ?,
        end_date = ?,
        days_requested = ?,
        reason = ?,
        status = ?,
        leave_type = ?,
        start_half_day = ?,
        end_half_day = ?,
        manager_notes = ?,
        updated_at = datetime('now')
    WHERE id = ?
      AND deleted_at IS NULL
  `).run(
    validated.employee_id,
    validated.start_date,
    validated.end_date,
    days,
    normalizeText(validated.reason) || '',
    validated.status,
    validated.leave_type,
    startHalfDay,
    endHalfDay,
    normalizeText(validated.manager_notes),
    requestId
  );

  res.json(getLeaveRequestById(requestId));
});

app.delete('/api/admin/leave/:id', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const requestId = parseInt(req.params.id, 10);
  const existing = getLeaveRequestById(requestId);
  if (!existing) {
    return res.status(404).json({ error: 'Request not found' });
  }

  db.prepare(`
    UPDATE leave_requests
    SET deleted_at = datetime('now'),
        deleted_by_email = ?,
        updated_at = datetime('now')
    WHERE id = ?
      AND deleted_at IS NULL
  `).run(userEmail, requestId);

  res.json({ success: true });
});

app.get('/api/leave/:id/conflicts', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  const requestId = parseInt(req.params.id, 10);

  const request = db.prepare(`
    SELECT lr.*, e.manager_email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.id = ?
      AND lr.deleted_at IS NULL
  `).get(requestId) as any;

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.manager_email !== userEmail && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const conflictingLeave = db.prepare(`
    SELECT lr.*, e.full_name, e.email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.status = 'approved'
    AND lr.deleted_at IS NULL
    AND lr.id != ?
    AND lr.start_date <= ?
    AND lr.end_date >= ?
  `).all(requestId, request.end_date, request.start_date);

  const blockedDays = db.prepare(`
    SELECT * FROM blocked_days
    WHERE blocked_date >= ? AND blocked_date <= ?
  `).all(request.start_date, request.end_date);

  res.json({ conflicting_leave: conflictingLeave, blocked_days: blockedDays });
});

app.get('/api/admin/blocked-days', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const blockedDays = db.prepare('SELECT * FROM blocked_days ORDER BY blocked_date ASC').all();
  res.json(blockedDays);
});

app.get('/api/bank-holidays', requireAuth, (req, res) => {
  const bankHolidays = db.prepare('SELECT * FROM holidays_calendar ORDER BY holiday_date ASC').all();
  res.json(bankHolidays);
});

app.get('/api/admin/bank-holidays', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const bankHolidays = db.prepare('SELECT * FROM holidays_calendar ORDER BY holiday_date ASC').all();
  res.json(bankHolidays);
});

app.post('/api/admin/bank-holidays', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validated = BankHolidaySchema.parse(req.body);
  try {
    db.prepare('INSERT INTO holidays_calendar (holiday_date, description) VALUES (?, ?)')
      .run(validated.holiday_date, validated.description);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'This bank holiday already exists' });
    }
    throw error;
  }
});

app.delete('/api/admin/bank-holidays/:id', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM holidays_calendar WHERE id = ?').run(parseInt(req.params.id, 10));
  res.json({ success: true });
});

app.post('/api/admin/blocked-days', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  const userEmail = (req as any).userEmail;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validated = BlockedDaySchema.parse(req.body);
  try {
    db.prepare('INSERT INTO blocked_days (blocked_date, reason, created_by_email) VALUES (?, ?, ?)')
      .run(validated.blocked_date, validated.reason, userEmail);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'This date is already blocked' });
    }
    throw error;
  }
});

app.delete('/api/admin/blocked-days/:id', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM blocked_days WHERE id = ?').run(parseInt(req.params.id, 10));
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
});
