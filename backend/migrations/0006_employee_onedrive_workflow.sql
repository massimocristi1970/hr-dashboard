-- Migration: Add lightweight OneDrive workflow fields for admins

ALTER TABLE employees ADD COLUMN onedrive_shared_with_employee INTEGER NOT NULL DEFAULT 0;
ALTER TABLE employees ADD COLUMN onedrive_extra_access_links TEXT;
