// API Base URL - use environment variable or fallback to Worker URL
const RAW_BASE = import.meta.env.VITE_API_BASE || "https://hr-dashboard-api.massimo-d6f.workers.dev";

// Ensure API_BASE is always an absolute URL
const API_BASE =
  RAW_BASE && RAW_BASE.startsWith("/")
    ? `${window.location.origin}${RAW_BASE}`
    : RAW_BASE || "https://hr-dashboard-api.massimo-d6f.workers.dev";


async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = new URL(path, API_BASE);
  
  // Add impersonation parameter if dev_email is set (works for local and production testing)
  const devEmail = localStorage.getItem('dev_email');
  if (devEmail) {
    url.searchParams.set('as', devEmail);
  }

  const response = await fetch(url.toString(), {
    ...options,
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
  
  approveRequest: (id: number, notes: string) =>
    fetchAPI(`/api/leave/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),
  
  declineRequest: (id: number, notes: string) =>
    fetchAPI(`/api/leave/${id}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
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
};