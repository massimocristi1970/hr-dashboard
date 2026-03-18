CREATE TABLE IF NOT EXISTS appraisal_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  cadence TEXT NOT NULL DEFAULT 'quarterly',
  self_review_deadline_days INTEGER NOT NULL DEFAULT 7,
  manager_review_deadline_days INTEGER NOT NULL DEFAULT 7,
  updated_by_email TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (cadence IN ('monthly', 'quarterly', 'biannual', 'annual'))
);

INSERT OR IGNORE INTO appraisal_settings (
  id,
  cadence,
  self_review_deadline_days,
  manager_review_deadline_days
) VALUES (1, 'quarterly', 7, 7);

CREATE TABLE IF NOT EXISTS appraisal_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appraisals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  manager_email TEXT,
  cycle_label TEXT NOT NULL,
  cadence TEXT NOT NULL,
  cycle_start_date TEXT NOT NULL,
  cycle_end_date TEXT NOT NULL,
  self_review_due_date TEXT NOT NULL,
  manager_review_due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'self_review_pending',
  employee_submitted_at TEXT,
  manager_completed_at TEXT,
  created_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  CHECK (cadence IN ('monthly', 'quarterly', 'biannual', 'annual')),
  CHECK (status IN ('self_review_pending', 'manager_review_pending', 'completed')),
  UNIQUE(employee_id, cycle_start_date, cycle_end_date)
);

CREATE TABLE IF NOT EXISTS appraisal_area_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appraisal_id INTEGER NOT NULL,
  area_id INTEGER NOT NULL,
  employee_strengths TEXT,
  employee_evidence TEXT,
  employee_focus TEXT,
  employee_support_needed TEXT,
  manager_observations TEXT,
  manager_evidence TEXT,
  manager_focus TEXT,
  manager_support_commitment TEXT,
  manager_trajectory TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (appraisal_id) REFERENCES appraisals(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES appraisal_areas(id),
  CHECK (manager_trajectory IN ('growing', 'steady', 'ready_for_more', 'needs_support') OR manager_trajectory IS NULL),
  UNIQUE(appraisal_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_appraisals_employee ON appraisals(employee_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_manager_email ON appraisals(manager_email);
CREATE INDEX IF NOT EXISTS idx_appraisals_status ON appraisals(status);
CREATE INDEX IF NOT EXISTS idx_appraisal_area_responses_appraisal ON appraisal_area_responses(appraisal_id);
