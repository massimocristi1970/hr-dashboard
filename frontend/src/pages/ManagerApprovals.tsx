import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ConflictingLeave {
  id: number;
  full_name: string;
  email: string;
  start_date: string;
  end_date: string;
  days_requested: number;
}

interface BlockedDay {
  id: number;
  blocked_date: string;
  reason: string;
}

interface PendingRequest {
  id: number;
  full_name: string;
  email: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: 'annual' | 'unpaid' | 'sick';
  reason: string;
  created_at: string;
  conflicts: ConflictingLeave[];
  blocked_days: BlockedDay[];
}

interface UserInfo {
  isAdmin: boolean;
}

export default function ManagerApprovals() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, meData] = await Promise.all([
        api.getPendingRequests(),
        api.getMe()
      ]);
      setRequests(requestsData);
      setUserInfo(meData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(req: PendingRequest) {
    const hasConflicts = req.conflicts && req.conflicts.length > 0;
    const hasBlockedDays = req.blocked_days && req.blocked_days.length > 0;
    
    let message = hasConflicts
      ? 'Approval notes are required because another employee is already off during this period:'
      : 'Approval notes (optional):';
    
    if (hasConflicts) {
      const conflictNames = req.conflicts.map(c => c.full_name).join(', ');
      message = `WARNING: Other employees have approved leave during this period: ${conflictNames}\n\n${message}`;
    }
    
    if (hasBlockedDays) {
      const blockedDates = req.blocked_days.map(b => `${b.blocked_date} (${b.reason})`).join(', ');
      message = `WARNING: The following days are blocked: ${blockedDates}\n\n${message}`;
    }

    const notes = prompt(message) || '';

    if (hasConflicts && !notes.trim()) {
      alert('A manager note is required when approving leave that overlaps with someone already off.');
      return;
    }
    
    // If there are blocked days, check if user is admin and wants to override
    let adminOverride = false;
    if (hasBlockedDays && userInfo?.isAdmin) {
      adminOverride = confirm(
        'This request includes blocked days. As an admin, do you want to override and approve anyway?'
      );
      if (!adminOverride) {
        return; // User cancelled the override
      }
    } else if (hasBlockedDays && !userInfo?.isAdmin) {
      alert('Cannot approve: This request includes blocked days. Only an admin can override blocked days.');
      return;
    }

    try {
      await api.approveRequest(req.id, notes, adminOverride);
      alert('Request approved!');
      loadData();
    } catch (err: any) {
      // Check if error is about blocked days
      if (err.message.includes('blocked days')) {
        alert('Error: ' + err.message + '\n\nOnly an admin can override blocked days.');
      } else {
        alert('Error: ' + err.message);
      }
    }
  }

  async function handleDecline(id: number) {
    const notes = prompt('Reason for declining:') || '';
    try {
      await api.declineRequest(id, notes);
      alert('Request declined.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <div className="loading-state">Loading approval queue...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  function formatLeaveType(type: PendingRequest['leave_type']) {
    if (type === 'annual') return 'Annual Leave';
    if (type === 'unpaid') return 'Unpaid Leave';
    return 'Sick Leave';
  }

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Review Workflow</p>
            <h1>Manager Approvals</h1>
            <p>
              Review pending requests with conflict visibility, blocked-day
              warnings, and cleaner action states.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Pending Requests</span>
              <span className="metric-value">{requests.length}</span>
            </div>
          </div>
        </div>
      </section>

      {userInfo?.isAdmin && (
        <section className="alert alert-info">
          <p style={{ margin: 0 }}>
            <strong>Admin Mode:</strong> You can override blocked days when approving leave requests.
          </p>
        </section>
      )}
      
      <section className="card table-card">
        <div className="section-header">
          <div>
            <h2>Pending Leave Requests</h2>
            <p>Approve quickly, while still surfacing overlap and blocked-day risk.</p>
          </div>
        </div>
        {requests.length === 0 ? (
          <div className="empty-state">No pending requests.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Warnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const hasConflicts = req.conflicts && req.conflicts.length > 0;
                  const hasBlockedDays = req.blocked_days && req.blocked_days.length > 0;
                  
                  return (
                    <tr key={req.id}>
                      <td>
                        {req.full_name}
                        <br />
                        <small className="muted-text">{req.email}</small>
                      </td>
                      <td>{req.start_date}</td>
                      <td>{req.end_date}</td>
                      <td>{req.days_requested}</td>
                      <td><span className="status-badge status-neutral">{formatLeaveType(req.leave_type)}</span></td>
                      <td>{req.reason || '-'}</td>
                      <td>
                        <div className="stack">
                          {hasConflicts && (
                            <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                              <strong>Conflict:</strong>
                              <div>A note is required to approve this request.</div>
                              {req.conflicts.map(c => (
                                <div key={c.id}>
                                  {c.full_name}: {c.start_date} to {c.end_date}
                                </div>
                              ))}
                            </div>
                          )}
                          {hasBlockedDays && (
                            <div className="alert alert-danger" style={{ marginBottom: 0 }}>
                              <strong>Blocked Days:</strong>
                              {req.blocked_days.map(b => (
                                <div key={b.id}>
                                  {b.blocked_date}: {b.reason}
                                </div>
                              ))}
                            </div>
                          )}
                          {!hasConflicts && !hasBlockedDays && (
                            <span className="status-badge status-approved">None</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="inline-actions">
                          <button
                            className="btn btn-success"
                            onClick={() => handleApprove(req)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDecline(req.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
