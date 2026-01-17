-- Migration: Add OneDrive files tracking and blocked days functionality

-- Agent files table (tracks files uploaded to agent's OneDrive folder)
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

-- Blocked days table (admin can block specific days from leave approvals)
CREATE TABLE IF NOT EXISTS blocked_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocked_date TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_files_employee ON agent_files(employee_id);
CREATE INDEX IF NOT EXISTS idx_blocked_days_date ON blocked_days(blocked_date);
