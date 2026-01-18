-- Migration: Add cancelled status to leave_requests
-- SQLite doesn't allow altering CHECK constraints, so we need to recreate the table

-- Step 1: Create new table with updated constraint
CREATE TABLE IF NOT EXISTS leave_requests_new (
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
  CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
);

-- Step 2: Copy data from old table
INSERT INTO leave_requests_new (id, employee_id, start_date, end_date, days_requested, reason, status, manager_notes, created_at, updated_at)
SELECT id, employee_id, start_date, end_date, days_requested, reason, status, manager_notes, created_at, updated_at
FROM leave_requests;

-- Step 3: Drop old table
DROP TABLE leave_requests;

-- Step 4: Rename new table
ALTER TABLE leave_requests_new RENAME TO leave_requests;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
