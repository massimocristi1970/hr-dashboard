import { z } from 'zod';

interface Env {
  hr_dashboard_db: D1Database;
  HR_ADMIN_EMAILS: string;
}

const SELF_MANAGED_APPROVER_EMAILS = new Set([
  'massimo@tictockloans.com',
  'massimo@ticktockloans.com',
]);

// Validation schemas
// Helper to allow empty strings as optional
const optionalEmail = z.string().email().optional().or(z.literal(''));
const optionalUrl = z.string().url().optional().or(z.literal(''));

const EmployeeSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  manager_email: optionalEmail,
  onedrive_folder_url: optionalUrl,
  onedrive_shared_with_employee: z.boolean().optional(),
  onedrive_extra_access_links: z.array(
    z.object({
      label: z.string().min(1),
      url: z.string().url(),
    })
  ).optional(),
});

const LeaveRequestSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
  leave_type: z.enum(['annual', 'unpaid', 'sick']),
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

const AppraisalCadenceSchema = z.enum(['monthly', 'quarterly', 'biannual', 'annual']);
const AppraisalTrajectorySchema = z.enum(['growing', 'steady', 'ready_for_more', 'needs_support']);

const AppraisalSettingsSchema = z.object({
  cadence: AppraisalCadenceSchema,
  self_review_deadline_days: z.number().int().min(1).max(90),
  manager_review_deadline_days: z.number().int().min(1).max(90),
});

const AppraisalAreaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sort_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

const AppraisalSelfReviewSchema = z.object({
  responses: z.array(z.object({
    area_id: z.number().int().positive(),
    strengths: z.string().optional(),
    evidence: z.string().optional(),
    focus: z.string().optional(),
    support_needed: z.string().optional(),
  })).min(1),
  submit: z.boolean().optional(),
});

const AppraisalManagerReviewSchema = z.object({
  responses: z.array(z.object({
    area_id: z.number().int().positive(),
    observations: z.string().optional(),
    evidence: z.string().optional(),
    focus: z.string().optional(),
    support_commitment: z.string().optional(),
    trajectory: AppraisalTrajectorySchema.optional(),
  })).min(1),
  submit: z.boolean().optional(),
});

const AppraisalLaunchSchema = z.object({
  cycle_label: z.string().min(1),
  cycle_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cycle_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

function isSelfManagedApprover(email: string): boolean {
  return SELF_MANAGED_APPROVER_EMAILS.has(email.trim().toLowerCase());
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
    if (startHalfDay === 'full') return 1;
    return 0.5; // AM or PM = half day
  }
  
  // Multiple days - adjust for half days
  let adjustment = 0;
  
  // Start day adjustment
  if (startHalfDay === 'am') adjustment -= 0.5; // Only taking morning of first day
  if (startHalfDay === 'pm') adjustment -= 0.5; // Only taking afternoon of first day
  
  // End day adjustment  
  if (endHalfDay === 'am') adjustment -= 0.5; // Only taking morning of last day
  if (endHalfDay === 'pm') adjustment -= 0.5; // Only taking afternoon of last day
  
  return Math.max(0.5, wholeDays + adjustment);
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

function parseExtraAccessLinks(value: unknown): Array<{ label: string; url: string }> {
  if (!value || typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item: any) =>
      item &&
      typeof item.label === 'string' &&
      item.label.trim() &&
      typeof item.url === 'string' &&
      item.url.trim()
    );
  } catch {
    return [];
  }
}

function addDays(date: string, days: number): string {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split('T')[0];
}

function calculateAppraisalDueDates(
  cycleEndDate: string,
  settings: { self_review_deadline_days: number; manager_review_deadline_days: number }
) {
  const selfReviewDeadlineDays = Number(settings.self_review_deadline_days);
  const managerReviewDeadlineDays = Number(settings.manager_review_deadline_days);

  return {
    self_review_due_date: addDays(cycleEndDate, selfReviewDeadlineDays),
    manager_review_due_date: addDays(cycleEndDate, managerReviewDeadlineDays),
  };
}

function normalizeText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function getAppraisalSettings(env: Env) {
  const settings = await env.hr_dashboard_db.prepare(`
    SELECT cadence, self_review_deadline_days, manager_review_deadline_days, updated_by_email, updated_at
    FROM appraisal_settings
    WHERE id = 1
  `).first();

  return settings || {
    cadence: 'quarterly',
    self_review_deadline_days: 7,
    manager_review_deadline_days: 7,
    updated_by_email: null,
    updated_at: null,
  };
}

async function getActiveAppraisalAreas(env: Env) {
  const areas = await env.hr_dashboard_db.prepare(`
    SELECT id, title, description, sort_order, is_active
    FROM appraisal_areas
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC
  `).all();

  return (areas.results as any[]).map((area) => ({
    ...area,
    is_active: Boolean(area.is_active),
  }));
}

async function getAppraisalDetail(env: Env, appraisalId: number) {
  const appraisal = await env.hr_dashboard_db.prepare(`
    SELECT
      a.*,
      e.full_name,
      e.email,
      e.manager_email AS employee_manager_email
    FROM appraisals a
    JOIN employees e ON e.id = a.employee_id
    WHERE a.id = ?
  `).bind(appraisalId).first();

  if (!appraisal) {
    return null;
  }

  const settings = await getAppraisalSettings(env) as {
    self_review_deadline_days: number;
    manager_review_deadline_days: number;
  };
  const dueDates = calculateAppraisalDueDates(appraisal.cycle_end_date as string, settings);

  const responses = await env.hr_dashboard_db.prepare(`
    SELECT
      ar.id,
      ar.title,
      ar.description,
      ar.sort_order,
      aar.employee_strengths,
      aar.employee_evidence,
      aar.employee_focus,
      aar.employee_support_needed,
      aar.manager_observations,
      aar.manager_evidence,
      aar.manager_focus,
      aar.manager_support_commitment,
      aar.manager_trajectory
    FROM appraisal_areas ar
    LEFT JOIN appraisal_area_responses aar
      ON aar.area_id = ar.id
      AND aar.appraisal_id = ?
    WHERE ar.is_active = 1
    ORDER BY ar.sort_order ASC, ar.id ASC
  `).bind(appraisalId).all();

  return {
    ...appraisal,
    ...dueDates,
    responses: responses.results,
  };
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
      `).bind(requestId).first() as { status: string; start_date: string; employee_email: string } | null;

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
      // - Status must be 'pending' or 'approved'
      // - Start date must not have passed yet
      const today = new Date().toISOString().split('T')[0];
      const canCancel = (request.status === 'pending' || request.status === 'approved');
      const hasStarted = request.start_date <= today;

      if (!canCancel) {
        return new Response(JSON.stringify({ 
          error: 'Cannot cancel: Request has already been declined or cancelled' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (hasStarted) {
        return new Response(JSON.stringify({ 
          error: 'Cannot cancel: Leave has already started or passed' 
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
        'INSERT INTO leave_requests (employee_id, start_date, end_date, days_requested, reason, status, leave_type, start_half_day, end_half_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        employee.id,
        validated.start_date,
        validated.end_date,
        days,
        validated.reason || '',
        'pending',
        validated.leave_type,
        startHalfDay,
        endHalfDay
      ).run();

      return new Response(JSON.stringify({ success: true, days_requested: days }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get pending requests for manager (with conflict info)
    if (path === '/api/leave/pending' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const allowSelfManagedApprovals = isSelfManagedApprover(userEmail) ? 1 : 0;
      const requests = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email 
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.status = 'pending'
        AND (
          e.manager_email = ?
          OR (? = 1 AND e.email = ?)
        )
        ORDER BY lr.created_at ASC
      `).bind(userEmail, allowSelfManagedApprovals, userEmail).all();

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

    // Get approved leave for the shared leave calendar
    if (path === '/api/leave/calendar' && method === 'GET') {
      const requests = await env.hr_dashboard_db.prepare(`
        SELECT lr.*, e.full_name, e.email
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.status = 'approved'
        ORDER BY lr.start_date ASC, e.full_name ASC
      `).all();

      return new Response(JSON.stringify(requests.results), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path === '/api/appraisals/my' && method === 'GET') {
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id FROM employees WHERE email = ?'
      ).bind(userEmail).first();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const appraisals = await env.hr_dashboard_db.prepare(`
        SELECT *
        FROM appraisals
        WHERE employee_id = ?
        ORDER BY cycle_end_date DESC, created_at DESC
      `).bind(employee.id).all();

      const detailed = await Promise.all(
        (appraisals.results as any[]).map((appraisal) => getAppraisalDetail(env, appraisal.id))
      );

      return new Response(JSON.stringify(detailed.filter(Boolean)), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path === '/api/appraisals/manager' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const allowSelfManagedApprovals = isSelfManagedApprover(userEmail) ? 1 : 0;
      const appraisals = await env.hr_dashboard_db.prepare(`
        SELECT a.id
        FROM appraisals a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.manager_email = ?
        OR (? = 1 AND e.email = ?)
        ORDER BY a.manager_review_due_date ASC, a.created_at DESC
      `).bind(userEmail, allowSelfManagedApprovals, userEmail).all();

      const detailed = await Promise.all(
        (appraisals.results as any[]).map((appraisal) => getAppraisalDetail(env, appraisal.id))
      );

      return new Response(JSON.stringify(detailed.filter(Boolean)), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path.match(/\/api\/appraisals\/\d+\/self-review/) && method === 'PUT') {
      const match = path.match(/\/api\/appraisals\/(\d+)\/self-review/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const appraisalId = parseInt(match[1]);
      const appraisal = await env.hr_dashboard_db.prepare(`
        SELECT a.*, e.email
        FROM appraisals a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.id = ?
      `).bind(appraisalId).first() as any;

      if (!appraisal) {
        return new Response(JSON.stringify({ error: 'Appraisal not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (appraisal.email !== userEmail && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = AppraisalSelfReviewSchema.parse(body);
      const shouldSubmit = validated.submit === true;

      for (const response of validated.responses) {
        await env.hr_dashboard_db.prepare(`
          INSERT INTO appraisal_area_responses (
            appraisal_id,
            area_id,
            employee_strengths,
            employee_evidence,
            employee_focus,
            employee_support_needed,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(appraisal_id, area_id) DO UPDATE SET
            employee_strengths = excluded.employee_strengths,
            employee_evidence = excluded.employee_evidence,
            employee_focus = excluded.employee_focus,
            employee_support_needed = excluded.employee_support_needed,
            updated_at = datetime('now')
        `).bind(
          appraisalId,
          response.area_id,
          normalizeText(response.strengths),
          normalizeText(response.evidence),
          normalizeText(response.focus),
          normalizeText(response.support_needed)
        ).run();
      }

      await env.hr_dashboard_db.prepare(`
        UPDATE appraisals
        SET status = ?,
            employee_submitted_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
            manager_completed_at = CASE WHEN ? = 1 THEN manager_completed_at ELSE NULL END,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        shouldSubmit ? 'manager_review_pending' : 'self_review_pending',
        shouldSubmit ? 1 : 0,
        shouldSubmit ? 1 : 0,
        appraisalId
      ).run();

      const updated = await getAppraisalDetail(env, appraisalId);
      return new Response(JSON.stringify(updated), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path.match(/\/api\/appraisals\/\d+\/manager-review/) && method === 'PUT') {
      const match = path.match(/\/api\/appraisals\/(\d+)\/manager-review/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const appraisalId = parseInt(match[1]);
      const appraisal = await env.hr_dashboard_db.prepare(`
        SELECT a.*, e.email
        FROM appraisals a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.id = ?
      `).bind(appraisalId).first() as any;

      if (!appraisal) {
        return new Response(JSON.stringify({ error: 'Appraisal not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const canSelfManageAppraisal = isSelfManagedApprover(userEmail) && appraisal.email === userEmail;
      if (appraisal.manager_email !== userEmail && !canSelfManageAppraisal && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = AppraisalManagerReviewSchema.parse(body);
      const shouldSubmit = validated.submit === true;

      for (const response of validated.responses) {
        await env.hr_dashboard_db.prepare(`
          INSERT INTO appraisal_area_responses (
            appraisal_id,
            area_id,
            manager_observations,
            manager_evidence,
            manager_focus,
            manager_support_commitment,
            manager_trajectory,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(appraisal_id, area_id) DO UPDATE SET
            manager_observations = excluded.manager_observations,
            manager_evidence = excluded.manager_evidence,
            manager_focus = excluded.manager_focus,
            manager_support_commitment = excluded.manager_support_commitment,
            manager_trajectory = excluded.manager_trajectory,
            updated_at = datetime('now')
        `).bind(
          appraisalId,
          response.area_id,
          normalizeText(response.observations),
          normalizeText(response.evidence),
          normalizeText(response.focus),
          normalizeText(response.support_commitment),
          response.trajectory || null
        ).run();
      }

      await env.hr_dashboard_db.prepare(`
        UPDATE appraisals
        SET status = ?,
            manager_completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        shouldSubmit ? 'completed' : 'manager_review_pending',
        shouldSubmit ? 1 : 0,
        appraisalId
      ).run();

      const updated = await getAppraisalDetail(env, appraisalId);
      return new Response(JSON.stringify(updated), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path.match(/\/api\/admin\/appraisals\/\d+\/reset-self-review/) && method === 'PUT') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const match = path.match(/\/api\/admin\/appraisals\/(\d+)\/reset-self-review/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const appraisalId = parseInt(match[1]);
      const appraisal = await getAppraisalDetail(env, appraisalId);

      if (!appraisal) {
        return new Response(JSON.stringify({ error: 'Appraisal not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      await env.hr_dashboard_db.prepare(`
        UPDATE appraisal_area_responses
        SET employee_strengths = NULL,
            employee_evidence = NULL,
            employee_focus = NULL,
            employee_support_needed = NULL,
            manager_observations = NULL,
            manager_evidence = NULL,
            manager_focus = NULL,
            manager_support_commitment = NULL,
            manager_trajectory = NULL,
            updated_at = datetime('now')
        WHERE appraisal_id = ?
      `).bind(appraisalId).run();

      await env.hr_dashboard_db.prepare(`
        UPDATE appraisals
        SET status = 'self_review_pending',
            employee_submitted_at = NULL,
            manager_completed_at = NULL,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(appraisalId).run();

      const updated = await getAppraisalDetail(env, appraisalId);
      return new Response(JSON.stringify(updated), {
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
        SELECT lr.*, e.manager_email, e.email AS employee_email
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

      const canSelfManageRequest = isSelfManagedApprover(userEmail) && request.employee_email === userEmail;
      if (request.manager_email !== userEmail && !canSelfManageRequest && !isAdmin) {
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

        const conflictingLeave = await env.hr_dashboard_db.prepare(`
          SELECT lr.id
          FROM leave_requests lr
          WHERE lr.status = 'approved'
          AND lr.id != ?
          AND lr.start_date <= ?
          AND lr.end_date >= ?
          LIMIT 1
        `).bind(requestId, request.end_date, request.start_date).first();

        if (conflictingLeave && !notes.trim()) {
          return new Response(JSON.stringify({
            error: 'Manager note required when approving overlapping leave',
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() },
          });
        }

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
        SELECT employee_id,
               SUM(CASE WHEN leave_type = 'annual' THEN days_requested ELSE 0 END) as annual_taken,
               SUM(CASE WHEN leave_type = 'unpaid' THEN days_requested ELSE 0 END) as unpaid_taken,
               SUM(CASE WHEN leave_type = 'sick' THEN days_requested ELSE 0 END) as sick_taken
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
      
      const takenMap = new Map<number, { annual: number; unpaid: number; sick: number }>();
      (approvedLeave.results as any[]).forEach((l: any) => {
        takenMap.set(l.employee_id, {
          annual: l.annual_taken || 0,
          unpaid: l.unpaid_taken || 0,
          sick: l.sick_taken || 0,
        });
      });
      
      // Combine data
      const employeesWithLeave = (employees.results as any[]).map((emp: any) => {
        const entitlement = entitlementMap.get(emp.id);
        const taken = takenMap.get(emp.id) || { annual: 0, unpaid: 0, sick: 0 };
        const total = entitlement ? entitlement.allowance + entitlement.carryover : 0;
        const remaining = total - taken.annual;
        
        return {
          ...emp,
          onedrive_shared_with_employee: Boolean(emp.onedrive_shared_with_employee),
          onedrive_extra_access_links: parseExtraAccessLinks(emp.onedrive_extra_access_links),
          leave_summary: {
            year: currentYear,
            total_allowance: total,
            annual_allowance: entitlement?.allowance || 0,
            carryover: entitlement?.carryover || 0,
            taken: taken.annual,
            unpaid_taken: taken.unpaid,
            sick_taken: taken.sick,
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
      const extraAccessLinksJson = JSON.stringify(validated.onedrive_extra_access_links || []);

      await env.hr_dashboard_db.prepare(
        'INSERT INTO employees (email, full_name, manager_email, onedrive_folder_url, onedrive_shared_with_employee, onedrive_extra_access_links) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = ?, manager_email = ?, onedrive_folder_url = ?, onedrive_shared_with_employee = ?, onedrive_extra_access_links = ?'
      ).bind(
        validated.email,
        validated.full_name,
        validated.manager_email || null,
        validated.onedrive_folder_url || null,
        validated.onedrive_shared_with_employee ? 1 : 0,
        extraAccessLinksJson,
        validated.full_name,
        validated.manager_email || null,
        validated.onedrive_folder_url || null,
        validated.onedrive_shared_with_employee ? 1 : 0,
        extraAccessLinksJson
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

    if (path === '/api/admin/appraisals/settings' && method === 'GET') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const [settings, areas, appraisals] = await Promise.all([
        getAppraisalSettings(env),
        env.hr_dashboard_db.prepare(`
          SELECT id, title, description, sort_order, is_active, created_at
          FROM appraisal_areas
          ORDER BY sort_order ASC, id ASC
        `).all(),
        env.hr_dashboard_db.prepare(`
          SELECT
            a.*,
            e.full_name,
            e.email
          FROM appraisals a
          JOIN employees e ON e.id = a.employee_id
          ORDER BY a.cycle_end_date DESC, a.created_at DESC
          LIMIT 100
        `).all(),
      ]);

      return new Response(JSON.stringify({
        settings,
        areas: (areas.results as any[]).map((area) => ({
          ...area,
          is_active: Boolean(area.is_active),
        })),
        appraisals: (appraisals.results as any[]).map((appraisal) => ({
          ...appraisal,
          ...calculateAppraisalDueDates(appraisal.cycle_end_date, settings as {
            self_review_deadline_days: number;
            manager_review_deadline_days: number;
          }),
        })),
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path === '/api/admin/appraisals/settings' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = AppraisalSettingsSchema.parse(body);

      await env.hr_dashboard_db.prepare(`
        INSERT INTO appraisal_settings (
          id,
          cadence,
          self_review_deadline_days,
          manager_review_deadline_days,
          updated_by_email,
          updated_at
        ) VALUES (1, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          cadence = excluded.cadence,
          self_review_deadline_days = excluded.self_review_deadline_days,
          manager_review_deadline_days = excluded.manager_review_deadline_days,
          updated_by_email = excluded.updated_by_email,
          updated_at = datetime('now')
      `).bind(
        validated.cadence,
        validated.self_review_deadline_days,
        validated.manager_review_deadline_days,
        userEmail
      ).run();

      const settings = await getAppraisalSettings(env);
      return new Response(JSON.stringify(settings), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path === '/api/admin/appraisals/areas' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = AppraisalAreaSchema.parse(body);

      await env.hr_dashboard_db.prepare(`
        INSERT INTO appraisal_areas (title, description, sort_order, is_active)
        VALUES (?, ?, ?, ?)
      `).bind(
        validated.title.trim(),
        normalizeText(validated.description),
        validated.sort_order ?? 0,
        validated.is_active === false ? 0 : 1
      ).run();

      const areas = await env.hr_dashboard_db.prepare(`
        SELECT id, title, description, sort_order, is_active, created_at
        FROM appraisal_areas
        ORDER BY sort_order ASC, id ASC
      `).all();

      return new Response(JSON.stringify((areas.results as any[]).map((area) => ({
        ...area,
        is_active: Boolean(area.is_active),
      }))), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path.startsWith('/api/admin/appraisals/areas/') && method === 'DELETE') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const match = path.match(/\/api\/admin\/appraisals\/areas\/(\d+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      await env.hr_dashboard_db.prepare(`
        UPDATE appraisal_areas
        SET is_active = 0
        WHERE id = ?
      `).bind(parseInt(match[1])).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (path === '/api/admin/appraisals/launch' && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const body = await req.json();
      const validated = AppraisalLaunchSchema.parse(body);
      const settings = await getAppraisalSettings(env) as any;
      const areas = await getActiveAppraisalAreas(env);

      if (areas.length === 0) {
        return new Response(JSON.stringify({ error: 'Add at least one active appraisal area first' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      const employees = await env.hr_dashboard_db.prepare(`
        SELECT id, email, manager_email
        FROM employees
        ORDER BY full_name ASC
      `).all();

      for (const employee of employees.results as any[]) {
        const dueDates = calculateAppraisalDueDates(validated.cycle_end_date, settings as {
          self_review_deadline_days: number;
          manager_review_deadline_days: number;
        });

        await env.hr_dashboard_db.prepare(`
          INSERT OR IGNORE INTO appraisals (
            employee_id,
            manager_email,
            cycle_label,
            cadence,
            cycle_start_date,
            cycle_end_date,
            self_review_due_date,
            manager_review_due_date,
            status,
            created_by_email,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'self_review_pending', ?, datetime('now'))
        `).bind(
          employee.id,
          isSelfManagedApprover(employee.email) ? employee.email : employee.manager_email || null,
          validated.cycle_label.trim(),
          settings.cadence,
          validated.cycle_start_date,
          validated.cycle_end_date,
          dueDates.self_review_due_date,
          dueDates.manager_review_due_date,
          userEmail
        ).run();
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // ============================================================
    // AGENT FILES ENDPOINTS (OneDrive Integration)
    // ============================================================

    // Get my files (agent can only see their own files)
    if (path === '/api/files/my-files' && method === 'GET') {
      const employee = await env.hr_dashboard_db.prepare(
        'SELECT id, onedrive_folder_url, onedrive_shared_with_employee FROM employees WHERE email = ?'
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
        onedrive_shared_with_employee: Boolean((employee as any).onedrive_shared_with_employee),
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
        SELECT lr.*, e.manager_email, e.email AS employee_email
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
      const canSelfManageRequest = isSelfManagedApprover(userEmail) && request.employee_email === userEmail;
      if (request.manager_email !== userEmail && !canSelfManageRequest && !isAdmin) {
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
