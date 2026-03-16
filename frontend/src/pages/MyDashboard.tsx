import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: 'annual' | 'unpaid' | 'sick';
  reason: string;
  status: string;
  manager_notes: string;
  created_at: string;
}

export default function MyDashboard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getMyRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const approvedRequests = requests.filter(r => r.status === 'approved');
  const approvedAnnualDays = approvedRequests
    .filter((r) => r.leave_type === 'annual')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const approvedUnpaidDays = approvedRequests
    .filter((r) => r.leave_type === 'unpaid')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const approvedSickDays = approvedRequests
    .filter((r) => r.leave_type === 'sick')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const declinedRequests = requests.filter(r => r.status === 'declined');
  const cancelledRequests = requests.filter(r => r.status === 'cancelled');

  // Check if a request can be cancelled
  // Can cancel if: pending or approved AND leave hasn't started yet
  function canCancel(req: LeaveRequest): boolean {
    const today = new Date().toISOString().split('T')[0];
    const canCancelStatus = req.status === 'pending' || req.status === 'approved';
    const hasStarted = req.start_date <= today;
    return canCancelStatus && !hasStarted;
  }

  async function handleCancel(id: number) {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }
    try {
      await api.cancelRequest(id);
      alert('Leave request cancelled.');
      loadRequests();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  // Calculate total approved days
  const totalApprovedDays = approvedRequests.reduce((sum, r) => sum + r.days_requested, 0);

  function formatLeaveType(type: LeaveRequest['leave_type']) {
    if (type === 'annual') return 'Annual Leave';
    if (type === 'unpaid') return 'Unpaid Leave';
    return 'Sick Leave';
  }

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Personal Leave Overview</p>
            <h1>My Dashboard</h1>
            <p>
              Track approved time off, monitor pending requests, and stay on top
              of manager feedback from one blue-led workspace.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Approved Days</span>
              <span className="metric-value">{totalApprovedDays}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Open Requests</span>
              <span className="metric-value">{pendingRequests.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Approved Leave</span>
          <div className="summary-value summary-value--success">{approvedRequests.length}</div>
          <p className="muted-text">{totalApprovedDays} total approved days</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Pending</span>
          <div className="summary-value summary-value--warning">{pendingRequests.length}</div>
          <p className="muted-text">Awaiting manager review</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Declined</span>
          <div className="summary-value summary-value--danger">{declinedRequests.length}</div>
          <p className="muted-text">Requests needing a new plan</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Cancelled</span>
          <div className="summary-value summary-value--muted">{cancelledRequests.length}</div>
          <p className="muted-text">Closed out by you</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Approved Annual</span>
          <div className="summary-value summary-value--primary">{approvedAnnualDays}</div>
          <p className="muted-text">Counts against annual entitlement</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Unpaid / Sick</span>
          <div className="summary-value summary-value--muted">{approvedUnpaidDays + approvedSickDays}</div>
          <p className="muted-text">{approvedUnpaidDays} unpaid and {approvedSickDays} sick days</p>
        </div>
      </section>

      {approvedRequests.length > 0 && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Approved Leave</h2>
              <p>Confirmed time away with any notes your manager added.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Manager Notes</th>
                </tr>
              </thead>
              <tbody>
                {approvedRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.start_date}</td>
                    <td>{req.end_date}</td>
                    <td>{req.days_requested}</td>
                    <td><span className="status-badge status-neutral">{formatLeaveType(req.leave_type)}</span></td>
                    <td>{req.reason || '-'}</td>
                    <td>{req.manager_notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card table-card">
        <div className="section-header">
          <div>
            <h2>All Leave Requests</h2>
            <p>Every request you have submitted, with live status and actions.</p>
          </div>
        </div>
        {requests.length === 0 ? (
          <div className="empty-state">No leave requests yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.start_date}</td>
                    <td>{req.end_date}</td>
                    <td>{req.days_requested}</td>
                    <td><span className="status-badge status-neutral">{formatLeaveType(req.leave_type)}</span></td>
                    <td>{req.reason || '-'}</td>
                    <td>
                      <span className={`status-badge status-${req.status}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.manager_notes || '-'}</td>
                    <td>
                      {canCancel(req) && req.status !== 'cancelled' ? (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancel(req.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="muted-text">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
