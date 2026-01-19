-- Add half day columns to leave_requests table
ALTER TABLE leave_requests ADD COLUMN start_half_day TEXT DEFAULT 'full';
ALTER TABLE leave_requests ADD COLUMN end_half_day TEXT DEFAULT 'full';

-- Update existing records to have 'full' as default
UPDATE leave_requests SET start_half_day = 'full' WHERE start_half_day IS NULL;
UPDATE leave_requests SET end_half_day = 'full' WHERE end_half_day IS NULL;
