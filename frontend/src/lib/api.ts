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

export const api = {
  getMe: () => fetchAPI('/api/me'),
  
  getMyRequests: () => fetchAPI('/api/leave/my-requests'),
  
  submitLeaveRequest: (data: { start_date: string; end_date: string; reason?: string }) =>
    fetchAPI('/api/leave/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getPendingRequests: () => fetchAPI('/api/leave/pending'),
  
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
};