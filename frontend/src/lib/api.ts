// API Base URL - HARDCODED to Worker URL (no environment variable, no fallback)
const API_BASE = "https://hr-dashboard-api.massimo-d6f.workers.dev";

// Debug logging to verify correct URL is used
console.log('[API Config] API Base URL:', API_BASE);
console.log('[API Config] Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server');


async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = new URL(path, API_BASE);
  
  // Add impersonation parameter if dev_email is set (works for local and production testing)
  const devEmail = localStorage.getItem('dev_email');
  if (devEmail) {
    url.searchParams.set('as', devEmail);
  }

  const response = await fetch(url.toString(), {
    ...options,
    credentials: 'omit', // Don't send cookies/credentials to avoid CORS issues
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

async function fetchOptional<T>(path: string, fallback: T, options: RequestInit = {}) {
  try {
    return await fetchAPI(path, options);
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.message === 'Not found') {
      return fallback;
    }
    throw error;
  }
}

export const api = {
  getMe: () => fetchAPI('/api/me'),
  
  getMyRequests: () => fetchAPI('/api/leave/my-requests'),
  
  submitLeaveRequest: (data: { 
    start_date: string; 
    end_date: string; 
    reason?: string;
    leave_type: 'annual' | 'unpaid' | 'sick';
    start_half_day?: 'full' | 'am' | 'pm';
    end_half_day?: 'full' | 'am' | 'pm';
  }) =>
    fetchAPI('/api/leave/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getPendingRequests: () => fetchAPI('/api/leave/pending'),

  getLeaveCalendar: () => fetchAPI('/api/leave/calendar'),
  
  approveRequest: (id: number, notes: string, adminOverride?: boolean) =>
    fetchAPI(`/api/leave/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notes, admin_override: adminOverride }),
    }),
  
  declineRequest: (id: number, notes: string) =>
    fetchAPI(`/api/leave/${id}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  cancelRequest: (id: number) =>
    fetchAPI(`/api/leave/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  getLeaveConflicts: (id: number) => fetchAPI(`/api/leave/${id}/conflicts`),
  
  // Agent files endpoints
  getMyFiles: () => fetchAPI('/api/files/my-files'),
  
  uploadFileMetadata: (data: {
    filename: string;
    file_description?: string;
    onedrive_file_url: string;
    file_size_bytes?: number;
    file_type?: string;
  }) =>
    fetchAPI('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteFile: (id: number) =>
    fetchAPI(`/api/files/${id}`, {
      method: 'DELETE',
    }),
  
  // Admin endpoints
  getAllEmployees: () => fetchAPI('/api/admin/employees'),
  
  addEmployee: (data: {
    email: string;
    full_name: string;
    manager_email?: string;
    onedrive_folder_url?: string;
    onedrive_shared_with_employee?: boolean;
    onedrive_extra_access_links?: Array<{
      label: string;
      url: string;
    }>;
  }) =>
    fetchAPI('/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  setEntitlement: (data: {
    employee_id: number;
    year: number;
    annual_allowance_days: number;
    carryover_days: number;
  }) =>
    fetchAPI('/api/admin/entitlements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAllRequests: () => fetchAPI('/api/admin/all-requests'),

  createAdminLeave: (data: {
    employee_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
    leave_type: 'annual' | 'unpaid' | 'sick';
    start_half_day?: 'full' | 'am' | 'pm';
    end_half_day?: 'full' | 'am' | 'pm';
    status: 'pending' | 'approved' | 'declined' | 'cancelled';
    manager_notes?: string;
  }) =>
    fetchAPI('/api/admin/leave', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdminLeave: (id: number, data: {
    employee_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
    leave_type: 'annual' | 'unpaid' | 'sick';
    start_half_day?: 'full' | 'am' | 'pm';
    end_half_day?: 'full' | 'am' | 'pm';
    status: 'pending' | 'approved' | 'declined' | 'cancelled';
    manager_notes?: string;
  }) =>
    fetchAPI(`/api/admin/leave/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdminLeave: (id: number) =>
    fetchAPI(`/api/admin/leave/${id}`, {
      method: 'DELETE',
    }),

  // Admin blocked days endpoints
  getBlockedDays: () => fetchAPI('/api/admin/blocked-days'),
  
  addBlockedDay: (data: { blocked_date: string; reason: string }) =>
    fetchAPI('/api/admin/blocked-days', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteBlockedDay: (id: number) =>
    fetchAPI(`/api/admin/blocked-days/${id}`, {
      method: 'DELETE',
    }),

  getMyAppraisals: () => fetchOptional('/api/appraisals/my', []),

  submitSelfReview: (id: number, data: {
    responses: Array<{
      area_id: number;
      strengths?: string;
      evidence?: string;
      focus?: string;
      support_needed?: string;
    }>;
    submit?: boolean;
  }) =>
    fetchAPI(`/api/appraisals/${id}/self-review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getManagerAppraisals: () => fetchOptional('/api/appraisals/manager', []),

  submitManagerReview: (id: number, data: {
    responses: Array<{
      area_id: number;
      observations?: string;
      evidence?: string;
      focus?: string;
      support_commitment?: string;
      trajectory?: 'growing' | 'steady' | 'ready_for_more' | 'needs_support';
    }>;
    submit?: boolean;
  }) =>
    fetchAPI(`/api/appraisals/${id}/manager-review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetAppraisalSelfReview: (id: number) =>
    fetchAPI(`/api/admin/appraisals/${id}/reset-self-review`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  getAppraisalAdminData: () => fetchOptional('/api/admin/appraisals/settings', {
    settings: {
      cadence: 'quarterly',
      self_review_deadline_days: 7,
      manager_review_deadline_days: 7,
    },
    areas: [],
    appraisals: [],
  }),

  saveAppraisalSettings: (data: {
    cadence: 'monthly' | 'quarterly' | 'biannual' | 'annual';
    self_review_deadline_days: number;
    manager_review_deadline_days: number;
  }) =>
    fetchAPI('/api/admin/appraisals/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addAppraisalArea: (data: {
    title: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  }) =>
    fetchAPI('/api/admin/appraisals/areas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  archiveAppraisalArea: (id: number) =>
    fetchAPI(`/api/admin/appraisals/areas/${id}`, {
      method: 'DELETE',
    }),

  launchAppraisalCycle: (data: {
    cycle_label: string;
    cycle_start_date: string;
    cycle_end_date: string;
  }) =>
    fetchAPI('/api/admin/appraisals/launch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
