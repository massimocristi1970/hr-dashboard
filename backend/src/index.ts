import { z } from 'zod';

interface Env {
  hr_dashboard_db: D1Database;
  HR_ADMIN_EMAILS: string;
}

// Validation schemas
// Helper to allow empty strings as optional
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
  start_half_day: z.enum(['full', 'am', 'pm']).optional(), // 'full' = whole day, 'am' = morning only, 'pm' = afternoon only
  end_half_day: z.enum(['full', 'am', 'pm']).optional(),
});

const LeaveEntitlementSchema = z.object({
  employee_id: z.number().int().positive(),
  year: z.number().int(),
  annual_allowance_days: z.number().positive(),
  carryover_days: z.number().nonnegative(),
});

// Schema for agent file upload metadata
const AgentFileSchema = z.object({
  filename: z.string().min(1),
  file_description: z.string().optional(),
  onedrive_file_url: z.string().url(),
  file_size_bytes: z.number().optional(),
  file_type: z.string().optional(),
});

// Schema for blocked days
const BlockedDaySchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1),
});

// Schema for leave approval with admin override option
const ApprovalSchema = z.object({
  notes: z.string().optional(),
  admin_override: z.boolean().optional(), // Allow admin to override blocked days
});

// Helper: Get user email from Cloudflare Access header or dev impersonation
function getUserEmail(req: Request): string | null {
  const url = new URL(req.url);
  
  // Dev impersonation via query parameter (works for testing in any environment)
  const impersonate = url.searchParams.get('as');
  if (impersonate) return impersonate;
  
  // Production: Cloudflare Access header
  return req.headers.get('Cf-Access-Authenticated-User-Email');
}

// Helper: Check if user is HR admin
function isHrAdmin(email: string, env: Env): boolean {
  const adminEmails = env.HR_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// Helper: Calculate days between two dates with half day support
function calculateDays(
  startDate: string, 
  endDate: string, 
  startHalfDay: 'full' | 'am' | 'pm' = 'full',
  endHalfDay: 'full' | 'am' | 'pm' = 'full'
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const wholeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  
  // If same day
  if (startDate === endDate) {
    if (startHalfDay === 'full' && endHalfDay === 'full') return 1;
    if (startHalfDay === 'am' || startHalfDay === 'pm') return 0.5;
    if (endHalfDay === 'am' || endHalfDay === 'pm') return 0.5;
    return 1;
  }
  
  // Calculate adjustments for half days
  let adjustment = 0;
  
  // If start day is half day (pm only = start afternoon, so morning is worked)
  if (startHalfDay === 'pm') {
    adjustment -= 0.5;
  }
  
  // If end day is half day (am only = end at lunch, so afternoon is worked)
  if (endHalfDay === 'am') {
    adjustment -= 0.5;
  }
  
  return wholeDays + adjustment;
}

// Helper: Get all dates in a range (inclusive)
function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// Helper: Check if two date ranges overlap
function dateRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 <= end2 && end1 >= start2;
}

// CORS helper
function corsHeaders(origin?: string) {
  const allowedOrigin = origin || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Authenticated-User-Email',
    'Access-Control-Allow-Credentials': 'true', // Allow cookies for Cloudflare Access
    'Access-Control-Max-Age': '86400',
  };
}

async function handleRequest(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  const origin = req.headers.get('Origin');

  // Handle CORS preflight FIRST - before any auth checks
  // OPTIONS requests must work without authentication for CORS to work
  if (method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders(origin || undefined) 
    });
  }

  // Health check (no auth required)
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  // Auth check for all other endpoints
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const isAdmin = isHrAdmin(userEmail, env);

  try {

    // Get current user info
    if (path === '/api/me' && method === 'GET') {
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT * FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      return new Response(JSON.stringify({
        email: userEmail,
        isAdmin,
        employee,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get my leave requests
    if (path === '/api/leave/my-requests' && method === 'GET') {
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const requests = await env.hr_dashboard_db.prepare(
        'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC'
      ).bind(employee.id).all();

      return new Response(JSON.stringify(requests.results), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Cancel leave request (user can cancel their own pending requests or past requests)
    if (path.match(/\/api\/leave\/\d+\/cancel/) && method === 'PUT') {
      const match = path.match(/\/api\/leave\/(\d+)\/cancel/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const requestId = parseInt(match[1]);

      // Get the leave request
      const request = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.email as employee_email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.id = ?
      `).bind(requestId).first() as { status: string; end_date: string; employee_email: string } | null;

      if (!request) {
        return new Response(JSON.stringify({ error: 'Request not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Check if user owns this request
      if (request.employee_email !== userEmail && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized to cancel this request' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Check if request can be cancelled:
      // 1. Request is still pending, OR
      // 2. The end date has passed (regardless of status)
      const today = new Date().toISOString().split('T')[0];
      const isPending = request.status === 'pending';
      const isPast = request.end_date < today;

      if (!isPending && !isPast) {
        return new Response(JSON.stringify({ 
          error: 'Cannot cancel: Request is already processed and dates have not passed yet' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      await env.hr_dashboard_db.prepare(
        'UPDATE leave_requests SET status = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind('cancelled', requestId).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Submit leave request
    if (path === '/api/leave/request' && method === 'POST') {
      const body = await req.json();
      const validated = LeaveRequestSchema.parse(body);

      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const startHalfDay = validated.start_half_day || 'full';
      const endHalfDay = validated.end_half_day || 'full';
      const days = calculateDays(validated.start_date, validated.end_date, startHalfDay, endHalfDay);

      await env.hr_dashboard_db.prepare(
        'INSERT INTO leave_requests (employee_id, start_date, end_date, days_requested, reason, status, start_half_day, end_half_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        employee.id,
        validated.start_date,
        validated.end_date,
        days,
        validated.reason || '',
        'pending',
        startHalfDay,
        endHalfDay
      ).run();

      return new Response(JSON.stringify({ success: true, days_requested: days }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get pending requests for manager (with conflict info)
    if (path === '/api/leave/pending' && method === 'GET') {
      const requests = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email 
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE e.manager_email = ? AND lr.status = 'pending'
        ORDER BY lr.created_at ASC
      `).bind(userEmail).all();

      // For each request, find conflicts and blocked days
      const requestsWithConflicts = await Promise.all(
        (requests.results as any[]).map(async (req) => {
          // Find conflicting approved leave
          const conflicts = await env.hr_dashboard_db.prepare(`
            SELECT lr.*, e.full_name, e.email
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            WHERE lr.status = 'approved'
            AND lr.id != ?
            AND lr.start_date <= ?
            AND lr.end_date >= ?
          `).bind(req.id, req.end_date, req.start_date).all();

          // Find blocked days in range
          const blockedDays = await env.hr_dashboard_db.prepare(`
            SELECT * FROM blocked_days
            WHERE blocked_date >= ? AND blocked_date <= ?
          `).bind(req.start_date, req.end_date).all();

          return {
            ...req,
            conflicts: conflicts.results,
            blocked_days: blockedDays.results,
          };
        })
      );

      return new Response(JSON.stringify(requestsWithConflicts), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Approve/decline leave request
    if (path.startsWith('/api/leave/') && method === 'PUT') {
      const match = path.match(/\/api\/leave\/(\d+)\/(approve|decline)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const requestId = parseInt(match[1]);
      const action = match[2];
      const body = await req.json();
      const validated = ApprovalSchema.parse(body);
      const notes = validated.notes || '';
      const adminOverride = validated.admin_override || false;

      // Check if user is manager for this request
      const request = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.manager_email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.id = ?
      `).bind(requestId).first();

      if (!request) {
        return new Response(JSON.stringify({ error: 'Request not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (request.manager_email !== userEmail && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // If approving, check for blocked days (unless admin override is set)
      if (action === 'approve') {
        const blockedDays = await env.hr_dashboard_db.prepare(`
          SELECT * FROM blocked_days
          WHERE blocked_date >= ? AND blocked_date <= ?
        `).bind(request.start_date, request.end_date).all();

        if (blockedDays.results && blockedDays.results.length > 0) {
          // If not admin or admin override not set, reject the approval
          if (!isAdmin || !adminOverride) {
            const blockedDates = blockedDays.results.map((d: any) => `${d.blocked_date} (${d.reason})`).join(', ');
            return new Response(JSON.stringify({ 
              error: 'Cannot approve: blocked days in range',
              blocked_days: blockedDays.results,
              message: `The following days are blocked: ${blockedDates}. Only an admin can override this.`
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders() },
            });
          }
        }
      }

      const newStatus = action === 'approve' ? 'approved' : 'declined';

      await env.hr_dashboard_db.prepare(
        'UPDATE leave_requests SET status = ?, manager_notes = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(newStatus, notes, requestId).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // HR Admin: Get all employees with leave summaries
    if (path === '/api/admin/employees' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const currentYear = new Date().getFullYear();
      
      // Get all employees with their entitlements and taken leave for current year
      const employees = await env.hr_dashboard_db.prepare('SELECT * FROM employees ORDER BY full_name').all();
      
      // Get entitlements for current year
      const entitlements = await env.hr_dashboard_db.prepare(`
        SELECT employee_id, annual_allowance_days, carryover_days 
        FROM leave_entitlements 
        WHERE year = ?
      `).bind(currentYear).all();
      
      // Get approved leave days for current year
      const approvedLeave = await env.hr_dashboard_db.prepare(`
        SELECT employee_id, SUM(days_requested) as total_taken
        FROM leave_requests 
        WHERE status = 'approved' 
        AND strftime('%Y', start_date) = ?
        GROUP BY employee_id
      `).bind(currentYear.toString()).all();
      
      // Build lookup maps
      const entitlementMap = new Map<number, { allowance: number; carryover: number }>();
      (entitlements.results as any[]).forEach((e: any) => {
        entitlementMap.set(e.employee_id, {
          allowance: e.annual_allowance_days,
          carryover: e.carryover_days
        });
      });
      
      const takenMap = new Map<number, number>();
      (approvedLeave.results as any[]).forEach((l: any) => {
        takenMap.set(l.employee_id, l.total_taken || 0);
      });
      
      // Combine data
      const employeesWithLeave = (employees.results as any[]).map((emp: any) => {
        const entitlement = entitlementMap.get(emp.id);
        const taken = takenMap.get(emp.id) || 0;
        const total = entitlement ? entitlement.allowance + entitlement.carryover : 0;
        const remaining = total - taken;
        
        return {
          ...emp,
          leave_summary: {
            year: currentYear,
            total_allowance: total,
            annual_allowance: entitlement?.allowance || 0,
            carryover: entitlement?.carryover || 0,
            taken: taken,
            remaining: remaining,
            entitlement_set: !!entitlement
          }
        };
      });
      
      return new Response(JSON.stringify(employeesWithLeave), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // HR Admin: Add/update employee
    if (path === '/api/admin/employees' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = EmployeeSchema.parse(body);

      await env.hr_dashboard_db.prepare(
        'INSERT INTO employees (email, full_name, manager_email, onedrive_folder_url) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = ?, manager_email = ?, onedrive_folder_url = ?'
      ).bind(
        validated.email,
        validated.full_name,
        validated.manager_email || null,
        validated.onedrive_folder_url || null,
        validated.full_name,
        validated.manager_email || null,
        validated.onedrive_folder_url || null
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // HR Admin: Set leave entitlement
    if (path === '/api/admin/entitlements' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = LeaveEntitlementSchema.parse(body);

      await env.hr_dashboard_db.prepare(
        'INSERT INTO leave_entitlements (employee_id, year, annual_allowance_days, carryover_days) VALUES (?, ?, ?, ?) ON CONFLICT(employee_id, year) DO UPDATE SET annual_allowance_days = ?, carryover_days = ?'
      ).bind(
        validated.employee_id,
        validated.year,
        validated.annual_allowance_days,
        validated.carryover_days,
        validated.annual_allowance_days,
        validated.carryover_days
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // HR Admin: Get all leave requests
    if (path === '/api/admin/all-requests' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const requests = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        ORDER BY lr.created_at DESC
      `).all();

      return new Response(JSON.stringify(requests.results), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // ============================================================
    // AGENT FILES ENDPOINTS (OneDrive Integration)
    // ============================================================

    // Get my files (agent can only see their own files)
    if (path === '/api/files/my-files' && method === 'GET') {
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id, onedrive_folder_url FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const files = await env.hr_dashboard_db.prepare(
        'SELECT * FROM agent_files WHERE employee_id = ? ORDER BY uploaded_at DESC'
      ).bind(employee.id).all();

      return new Response(JSON.stringify({
        files: files.results,
        onedrive_folder_url: employee.onedrive_folder_url,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Upload file metadata (agent uploads file to OneDrive, then registers it here)
    if (path === '/api/files/upload' && method === 'POST') {
      const body = await req.json();
      const validated = AgentFileSchema.parse(body);

      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      await env.hr_dashboard_db.prepare(
        'INSERT INTO agent_files (employee_id, filename, file_description, onedrive_file_url, file_size_bytes, file_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        employee.id,
        validated.filename,
        validated.file_description || null,
        validated.onedrive_file_url,
        validated.file_size_bytes || null,
        validated.file_type || null
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Delete file metadata (agent can only delete their own files)
    if (path.startsWith('/api/files/') && method === 'DELETE') {
      const match = path.match(/\/api\/files\/(\d+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const fileId = parseInt(match[1]);
      
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Verify the file belongs to this employee
      const file = await env.hr_dashboard_db.prepare(
        'SELECT * FROM agent_files WHERE id = ? AND employee_id = ?'
      ).bind(fileId, employee.id).first();

      if (!file) {
        return new Response(JSON.stringify({ error: 'File not found or access denied' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      await env.hr_dashboard_db.prepare(
        'DELETE FROM agent_files WHERE id = ?'
      ).bind(fileId).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // ============================================================
    // CONFLICTING LEAVE CHECK FOR MANAGER APPROVALS
    // ============================================================

    // Get conflicts for a specific leave request (check if other agents have approved leave on same days)
    if (path.startsWith('/api/leave/') && path.endsWith('/conflicts') && method === 'GET') {
      const match = path.match(/\/api\/leave\/(\d+)\/conflicts/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const requestId = parseInt(match[1]);

      // Get the leave request details
      const request = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.manager_email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.id = ?
      `).bind(requestId).first();

      if (!request) {
        return new Response(JSON.stringify({ error: 'Request not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Check if user is manager for this request or admin
      if (request.manager_email !== userEmail && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Find other approved leave requests that overlap with this date range
      const conflicts = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.status = 'approved'
        AND lr.id != ?
        AND lr.start_date <= ?
        AND lr.end_date >= ?
      `).bind(requestId, request.end_date, request.start_date).all();

      // Check for blocked days
      const blockedDays = await env.hr_dashboard_db.prepare(`
        SELECT * FROM blocked_days
        WHERE blocked_date >= ? AND blocked_date <= ?
      `).bind(request.start_date, request.end_date).all();

      return new Response(JSON.stringify({
        conflicting_leave: conflicts.results,
        blocked_days: blockedDays.results,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // ============================================================
    // BLOCKED DAYS MANAGEMENT (Admin Only)
    // ============================================================

    // Get all blocked days
    if (path === '/api/admin/blocked-days' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const blockedDays = await env.hr_dashboard_db.prepare(
        'SELECT * FROM blocked_days ORDER BY blocked_date ASC'
      ).all();

      return new Response(JSON.stringify(blockedDays.results), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Add blocked day
    if (path === '/api/admin/blocked-days' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = BlockedDaySchema.parse(body);

      try {
        await env.hr_dashboard_db.prepare(
          'INSERT INTO blocked_days (blocked_date, reason, created_by_email) VALUES (?, ?, ?)'
        ).bind(validated.blocked_date, validated.reason, userEmail).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      } catch (e: any) {
        if (e.message.includes('UNIQUE constraint')) {
          return new Response(JSON.stringify({ error: 'This date is already blocked' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() },
          });
        }
        throw e;
      }
    }

    // Delete blocked day
    if (path.startsWith('/api/admin/blocked-days/') && method === 'DELETE') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const match = path.match(/\/api\/admin\/blocked-days\/(\d+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const blockedDayId = parseInt(match[1]);

      await env.hr_dashboard_db.prepare(
        'DELETE FROM blocked_days WHERE id = ?'
      ).bind(blockedDayId).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}

export default {
  fetch: handleRequest,
};