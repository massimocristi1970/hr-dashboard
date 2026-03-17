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

interface Appraisal {
  id: number;
  cycle_label: string;
  cadence: string;
  cycle_start_date: string;
  cycle_end_date: string;
  self_review_due_date: string;
  manager_review_due_date: string;
  status: 'self_review_pending' | 'manager_review_pending' | 'completed';
  employee_submitted_at?: string | null;
  manager_completed_at?: string | null;
  responses: AppraisalResponse[];
}

export default function MyDashboard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingAppraisalId, setSubmittingAppraisalId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, appraisalsData] = await Promise.all([
        api.getMyRequests(),
        api.getMyAppraisals(),
      ]);
      setRequests(requestsData);
      setAppraisals(appraisalsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const approvedAnnualDays = approvedRequests
    .filter((r) => r.leave_type === 'annual')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const approvedUnpaidDays = approvedRequests
    .filter((r) => r.leave_type === 'unpaid')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const approvedSickDays = approvedRequests
    .filter((r) => r.leave_type === 'sick')
    .reduce((sum, r) => sum + r.days_requested, 0);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const declinedRequests = requests.filter((r) => r.status === 'declined');
  const cancelledRequests = requests.filter((r) => r.status === 'cancelled');
  const pendingSelfReviews = appraisals.filter((appraisal) => appraisal.status === 'self_review_pending');
  const awaitingManagerReview = appraisals.filter((appraisal) => appraisal.status === 'manager_review_pending');
  const completedAppraisals = appraisals.filter((appraisal) => appraisal.status === 'completed');

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
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleSubmitSelfReview(appraisal: Appraisal) {
    const responses = appraisal.responses.map((response) => ({
      area_id: response.area_id || response.id || 0,
      strengths: prompt(`Strengths shown for ${response.title}:`, response.employee_strengths || '') || '',
      evidence: prompt(`Examples or evidence for ${response.title}:`, response.employee_evidence || '') || '',
      focus: prompt(`Focus for next period for ${response.title}:`, response.employee_focus || '') || '',
      support_needed: prompt(`Support needed for ${response.title}:`, response.employee_support_needed || '') || '',
    }));

    try {
      setSubmittingAppraisalId(appraisal.id);
      await api.submitSelfReview(appraisal.id, { responses });
      alert('Self-reflection submitted.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmittingAppraisalId(null);
    }
  }

  const totalApprovedDays = approvedRequests.reduce((sum, r) => sum + r.days_requested, 0);

  function formatLeaveType(type: LeaveRequest['leave_type']) {
    if (type === 'annual') return 'Annual Leave';
    if (type === 'unpaid') return 'Unpaid Leave';
    return 'Sick Leave';
  }

  function formatTrajectory(value?: AppraisalResponse['manager_trajectory']) {
    return value ? value.replace(/_/g, ' ') : '-';
  }

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Personal Leave Overview</p>
            <h1>My Dashboard</h1>
            <p>
              Track approved time off, complete self-reflection when appraisal cycles open,
              and keep everything in one staff workspace.
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
            <div className="metric-card">
              <span className="metric-label">Appraisals Due</span>
              <span className="metric-value">{pendingSelfReviews.length}</span>
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
        <div className="summary-card">
          <span className="summary-label">Awaiting Manager</span>
          <div className="summary-value summary-value--warning">{awaitingManagerReview.length}</div>
          <p className="muted-text">Self-reflections sent for review</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Completed Appraisals</span>
          <div className="summary-value summary-value--success">{completedAppraisals.length}</div>
          <p className="muted-text">Finished review cycles on record</p>
        </div>
      </section>

      <section className="card table-card">
        <div className="section-header">
          <div>
            <h2>My Appraisals</h2>
            <p>Complete your self-reflection in the app first, then your manager reviews the same areas.</p>
          </div>
        </div>
        {appraisals.length === 0 ? (
          <div className="empty-state">No appraisal cycles assigned yet.</div>
        ) : (
          <div className="stack">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="surface-panel stack" style={{ padding: '16px' }}>
                <div className="section-header">
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>{appraisal.cycle_label}</h3>
                    <p style={{ margin: 0 }}>{appraisal.cycle_start_date} to {appraisal.cycle_end_date}</p>
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
                          <strong>Strengths</strong>
                          <p>{response.employee_strengths || '-'}</p>
                        </div>
                        <div>
                          <strong>Evidence</strong>
                          <p>{response.employee_evidence || '-'}</p>
                        </div>
                        <div>
                          <strong>Focus</strong>
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
                            <p>{formatTrajectory(response.manager_trajectory)}</p>
                          </div>
                          <div>
                            <strong>Manager Focus</strong>
                            <p>{response.manager_focus || '-'}</p>
                          </div>
                          <div>
                            <strong>Support Commitment</strong>
                            <p>{response.manager_support_commitment || '-'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {appraisal.status === 'self_review_pending' && (
                  <div className="inline-actions">
                    <button
                      className="btn btn-success"
                      disabled={submittingAppraisalId === appraisal.id}
                      onClick={() => handleSubmitSelfReview(appraisal)}
                    >
                      {submittingAppraisalId === appraisal.id ? 'Submitting...' : 'Complete Self-Reflection'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
