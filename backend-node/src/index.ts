import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/hr_dashboard.db');
const db = new Database(dbPath);

// Ensure data directory exists
import { mkdirSync } from 'fs';
import { existsSync } from 'fs';
if (!existsSync(path.dirname(dbPath))) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Initialize database if needed
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
    status TEXT NOT NULL DEFAULT 'pending',
    manager_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    CHECK (status IN ('pending', 'approved', 'declined'))
  );
  
  CREATE TABLE IF NOT EXISTS holidays_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    holiday_date TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
  CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
  CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
  CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_email);
`);

// Validation schemas
const EmployeeSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  manager_email: z.string().email().optional(),
  onedrive_folder_url: z.string().url().optional(),
});

const LeaveRequestSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});

const LeaveEntitlementSchema = z.object({
  employee_id: z.number().int().positive(),
  year: z.number().int(),
  annual_allowance_days: z.number().positive(),
  carryover_days: z.number().nonnegative(),
});

// Helper: Get user email from header or dev impersonation
function getUserEmail(req: Request): string | null {
  // Production: Cloudflare Access header or custom header
  const headerEmail = req.headers['cf-access-authenticated-user-email'] as string ||
                      req.headers['x-user-email'] as string;
  
  if (headerEmail) return headerEmail;
  
  // Local dev impersonation
  const impersonate = req.query.as as string;
  if (impersonate) return impersonate;
  
  return null;
}

// Helper: Check if user is HR admin
function isHrAdmin(email: string): boolean {
  const adminEmails = (process.env.HR_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// Helper: Calculate business days between two dates
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays;
}

// Middleware: Auth check
function requireAuth(req: Request, res: Response, next: () => void) {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).userEmail = userEmail;
  (req as any).isAdmin = isHrAdmin(userEmail);
  next();
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get current user info
app.get('/api/me', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  
  const employee = db.prepare('SELECT * FROM employees WHERE email = ?').get(userEmail);
  
  res.json({
    email: userEmail,
    isAdmin,
    employee,
  });
});

// Get my leave requests
app.get('/api/leave/my-requests', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  
  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  const requests = db.prepare(
    'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC'
  ).all(employee.id);
  
  res.json(requests);
});

// Submit leave request
app.post('/api/leave/request', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const validated = LeaveRequestSchema.parse(req.body);
  
  const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(userEmail) as any;
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  const days = calculateDays(validated.start_date, validated.end_date);
  
  db.prepare(
    'INSERT INTO leave_requests (employee_id, start_date, end_date, days_requested, reason, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    employee.id,
    validated.start_date,
    validated.end_date,
    days,
    validated.reason || '',
    'pending'
  );
  
  res.json({ success: true });
});

// Get pending requests for manager
app.get('/api/leave/pending', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  
  const requests = db.prepare(`
    SELECT lr.*, e.full_name, e.email 
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE e.manager_email = ? AND lr.status = 'pending'
    ORDER BY lr.created_at ASC
  `).all(userEmail);
  
  res.json(requests);
});

// Approve/decline leave request
app.put('/api/leave/:id/:action', requireAuth, (req, res) => {
  const userEmail = (req as any).userEmail;
  const isAdmin = (req as any).isAdmin;
  const requestId = parseInt(req.params.id);
  const action = req.params.action;
  const notes = req.body.notes || '';
  
  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  const request = db.prepare(`
    SELECT lr.*, e.manager_email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    WHERE lr.id = ?
  `).get(requestId) as any;
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  if (request.manager_email !== userEmail && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  const newStatus = action === 'approve' ? 'approved' : 'declined';
  
  db.prepare(
    'UPDATE leave_requests SET status = ?, manager_notes = ?, updated_at = datetime("now") WHERE id = ?'
  ).run(newStatus, notes, requestId);
  
  res.json({ success: true });
});

// HR Admin: Get all employees
app.get('/api/admin/employees', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const employees = db.prepare('SELECT * FROM employees ORDER BY full_name').all();
  res.json(employees);
});

// HR Admin: Add/update employee
app.post('/api/admin/employees', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const validated = EmployeeSchema.parse(req.body);
  
  db.prepare(
    'INSERT INTO employees (email, full_name, manager_email, onedrive_folder_url) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = ?, manager_email = ?, onedrive_folder_url = ?'
  ).run(
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

// HR Admin: Set leave entitlement
app.post('/api/admin/entitlements', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const validated = LeaveEntitlementSchema.parse(req.body);
  
  db.prepare(
    'INSERT INTO leave_entitlements (employee_id, year, annual_allowance_days, carryover_days) VALUES (?, ?, ?, ?) ON CONFLICT(employee_id, year) DO UPDATE SET annual_allowance_days = ?, carryover_days = ?'
  ).run(
    validated.employee_id,
    validated.year,
    validated.annual_allowance_days,
    validated.carryover_days,
    validated.annual_allowance_days,
    validated.carryover_days
  );
  
  res.json({ success: true });
});

// HR Admin: Get all leave requests
app.get('/api/admin/all-requests', requireAuth, (req, res) => {
  const isAdmin = (req as any).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const requests = db.prepare(`
    SELECT lr.*, e.full_name, e.email
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    ORDER BY lr.created_at DESC
  `).all();
  
  res.json(requests);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
});
