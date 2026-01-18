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
});

const LeaveEntitlementSchema = z.object({
  employee_id: z.number().int().positive(),
  year: z.number().int(),
  annual_allowance_days: z.number().positive(),
  carryover_days: z.number().nonnegative(),
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

// Helper: Calculate business days between two dates (simple version)
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays;
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

      const days = calculateDays(validated.start_date, validated.end_date);

      await env.hr_dashboard_db.prepare(
        'INSERT INTO leave_requests (employee_id, start_date, end_date, days_requested, reason, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        employee.id,
        validated.start_date,
        validated.end_date,
        days,
        validated.reason || '',
        'pending'
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get pending requests for manager
    if (path === '/api/leave/pending' && method === 'GET') {
      const requests = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email 
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE e.manager_email = ? AND lr.status = 'pending'
        ORDER BY lr.created_at ASC
      `).bind(userEmail).all();

      return new Response(JSON.stringify(requests.results), {
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
      const notes = body.notes || '';

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

      const newStatus = action === 'approve' ? 'approved' : 'declined';

      await env.hr_dashboard_db.prepare(
        'UPDATE leave_requests SET status = ?, manager_notes = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(newStatus, notes, requestId).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // HR Admin: Get all employees
    if (path === '/api/admin/employees' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const employees = await env.hr_dashboard_db.prepare('SELECT * FROM employees ORDER BY full_name').all();
      return new Response(JSON.stringify(employees.results), {
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