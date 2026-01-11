-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  manager_email TEXT,
  onedrive_folder_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Leave entitlements table
CREATE TABLE IF NOT EXISTS leave_entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  annual_allowance_days REAL NOT NULL DEFAULT 28.0,
  carryover_days REAL NOT NULL DEFAULT 0.0,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  UNIQUE(employee_id, year)
);

-- Leave requests table
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

-- Bank holidays calendar table
CREATE TABLE IF NOT EXISTS holidays_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  holiday_date TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_email);