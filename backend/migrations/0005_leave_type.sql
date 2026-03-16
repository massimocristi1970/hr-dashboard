-- Add leave type to leave_requests so annual, unpaid, and sick leave
-- can be tracked separately without affecting entitlement in the same way.
ALTER TABLE leave_requests ADD COLUMN leave_type TEXT DEFAULT 'annual';

UPDATE leave_requests
SET leave_type = 'annual'
WHERE leave_type IS NULL OR leave_type = '';
