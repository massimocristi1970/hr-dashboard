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

interface AppraisalResponse {
  area_id?: number;
  id?: number;
  title: string;
  description?: string | null;
  employee_strengths?: string | null;
  employee_evidence?: string | null;
  employee_focus?: string | null;
  employee_support_needed?: string | null;
  manager_observations?: string | null;
  manager_evidence?: string | null;
  manager_focus?: string | null;
  manager_support_commitment?: string | null;
  manager_trajectory?: 'growing' | 'steady' | 'ready_for_more' | 'needs_support' | null;
}

interface ManagerAppraisal {
  id: number;
  full_name: string;
  email: string;
  cycle_label: string;
  cycle_start_date: string;
  cycle_end_date: string;
  self_review_due_date: string;
  manager_review_due_date: string;
  status: 'self_review_pending' | 'manager_review_pending' | 'completed';
  responses: AppraisalResponse[];
}

export default function ManagerApprovals() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [appraisals, setAppraisals] = useState<ManagerAppraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submittingAppraisalId, setSubmittingAppraisalId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const meData = await api.getMe();
      setUserInfo(meData);

      if (!meData.isAdmin) {
        setRequests([]);
        setAppraisals([]);
        return;
      }

      const [requestsData, appraisalsData] = await Promise.all([
        api.getPendingRequests(),
        api.getManagerAppraisals(),
      ]);
      setRequests(requestsData);
      setAppraisals(appraisalsData);
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
      const conflictNames = req.conflicts.map((c) => c.full_name).join(', ');
      message = `WARNING: Other employees have approved leave during this period: ${conflictNames}\n\n${message}`;
    }

    if (hasBlockedDays) {
      const blockedDates = req.blocked_days.map((b) => `${b.blocked_date} (${b.reason})`).join(', ');
      message = `WARNING: The following days are blocked: ${blockedDates}\n\n${message}`;
    }

    const notes = prompt(message) || '';

    if (hasConflicts && !notes.trim()) {
      alert('A manager note is required when approving leave that overlaps with someone already off.');
      return;
    }

    let adminOverride = false;
    if (hasBlockedDays && userInfo?.isAdmin) {
      adminOverride = confirm(
        'This request includes blocked days. As an admin, do you want to override and approve anyway?'
      );
      if (!adminOverride) {
        return;
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

  async function handleCompleteAppraisal(appraisal: ManagerAppraisal) {
    const responses = appraisal.responses.map((response) => ({
      area_id: response.area_id || response.id || 0,
      observations: prompt(`Manager observations for ${response.title}:`, response.manager_observations || '') || '',
      evidence: prompt(`Evidence for ${response.title}:`, response.manager_evidence || response.employee_evidence || '') || '',
      focus: prompt(`Manager focus for ${response.title}:`, response.manager_focus || response.employee_focus || '') || '',
      support_commitment: prompt(`Support commitment for ${response.title}:`, response.manager_support_commitment || '') || '',
      trajectory: (prompt(
        `Trajectory for ${response.title} (growing, steady, ready_for_more, needs_support):`,
        response.manager_trajectory || 'steady'
      ) || 'steady') as 'growing' | 'steady' | 'ready_for_more' | 'needs_support',
    }));

    try {
      setSubmittingAppraisalId(appraisal.id);
      await api.submitManagerReview(appraisal.id, { responses });
      alert('Appraisal completed.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmittingAppraisalId(null);
    }
  }

  if (loading) return <div className="loading-state">Loading approval queue...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!userInfo?.isAdmin) return <div className="error-state">Access denied: Manager approvals are available to admins only.</div>;

  function formatLeaveType(type: PendingRequest['leave_type']) {
    if (type === 'annual') return 'Annual Leave';
    if (type === 'unpaid') return 'Unpaid Leave';
    return 'Sick Leave';
  }

  const pendingManagerAppraisals = appraisals.filter((appraisal) => appraisal.status === 'manager_review_pending');

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Review Workflow</p>
            <h1>Manager Approvals</h1>
            <p>
              Review leave requests and complete appraisal write-ups after employees
              submit their self-reflection.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Pending Requests</span>
              <span className="metric-value">{requests.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Appraisals Ready</span>
              <span className="metric-value">{pendingManagerAppraisals.length}</span>
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
            <h2>Pending Appraisals</h2>
            <p>Managers can review employee self-reflection and complete the final write-up here.</p>
          </div>
        </div>
        {appraisals.length === 0 ? (
          <div className="empty-state">No appraisal items assigned to you.</div>
        ) : (
          <div className="stack">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="surface-panel stack" style={{ padding: '16px' }}>
                <div className="section-header">
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>{appraisal.full_name}</h3>
                    <p style={{ margin: 0 }}>
                      {appraisal.cycle_label} | {appraisal.cycle_start_date} to {appraisal.cycle_end_date}
                    </p>
                  </div>
                  <span className={`status-badge ${
                    appraisal.status === 'completed'
                      ? 'status-approved'
                      : appraisal.status === 'manager_review_pending'
                        ? 'status-pending'
                        : 'status-neutral'
                  }`}>
                    {appraisal.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="inline-actions">
                  <span className="status-badge status-neutral">Self review due {appraisal.self_review_due_date}</span>
                  <span className="status-badge status-neutral">Manager due {appraisal.manager_review_due_date}</span>
                </div>
                <div className="stack">
                  {appraisal.responses.map((response, index) => (
                    <div key={`${appraisal.id}-${response.area_id || response.id || index}`} className="surface-panel stack" style={{ padding: '12px' }}>
                      <div>
                        <strong>{response.title}</strong>
                        {response.description ? (
                          <p className="muted-text" style={{ marginBottom: 0 }}>{response.description}</p>
                        ) : null}
                      </div>
                      <div className="form-grid form-grid--two">
                        <div>
                          <strong>Employee Strengths</strong>
                          <p>{response.employee_strengths || '-'}</p>
                        </div>
                        <div>
                          <strong>Employee Evidence</strong>
                          <p>{response.employee_evidence || '-'}</p>
                        </div>
                        <div>
                          <strong>Employee Focus</strong>
                          <p>{response.employee_focus || '-'}</p>
                        </div>
                        <div>
                          <strong>Support Needed</strong>
                          <p>{response.employee_support_needed || '-'}</p>
                        </div>
                      </div>
                      {appraisal.status === 'completed' && (
                        <div className="form-grid form-grid--two">
                          <div>
                            <strong>Manager Observations</strong>
                            <p>{response.manager_observations || '-'}</p>
                          </div>
                          <div>
                            <strong>Trajectory</strong>
                            <p>{response.manager_trajectory ? response.manager_trajectory.replace(/_/g, ' ') : '-'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {appraisal.status === 'manager_review_pending' && (
                  <div className="inline-actions">
                    <button
                      className="btn btn-success"
                      disabled={submittingAppraisalId === appraisal.id}
                      onClick={() => handleCompleteAppraisal(appraisal)}
                    >
                      {submittingAppraisalId === appraisal.id ? 'Submitting...' : 'Complete Appraisal'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

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
                              {req.conflicts.map((c) => (
                                <div key={c.id}>
                                  {c.full_name}: {c.start_date} to {c.end_date}
                                </div>
                              ))}
                            </div>
                          )}
                          {hasBlockedDays && (
                            <div className="alert alert-danger" style={{ marginBottom: 0 }}>
                              <strong>Blocked Days:</strong>
                              {req.blocked_days.map((b) => (
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
