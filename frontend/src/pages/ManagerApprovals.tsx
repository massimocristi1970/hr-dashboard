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
    
    let message = 'Approval notes (optional):';
    
    if (hasConflicts) {
      const conflictNames = req.conflicts.map(c => c.full_name).join(', ');
      message = `WARNING: Other employees have approved leave during this period: ${conflictNames}\n\n${message}`;
    }
    
    if (hasBlockedDays) {
      const blockedDates = req.blocked_days.map(b => `${b.blocked_date} (${b.reason})`).join(', ');
      message = `WARNING: The following days are blocked: ${blockedDates}\n\n${message}`;
    }

    const notes = prompt(message) || '';
    
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">Manager Approvals</h1>
      
      {userInfo?.isAdmin && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          borderRadius: '8px',
          backgroundColor: '#1e3a5f',
          border: '1px solid #3b82f6',
          color: '#93c5fd'
        }}>
          <p style={{ margin: 0, color: '#93c5fd' }}>
            <strong>Admin Mode:</strong> You can override blocked days when approving leave requests.
          </p>
        </div>
      )}
      
      <div className="card">
        <h2>Pending Leave Requests</h2>
        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
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
                      <small style={{ color: '#999' }}>{req.email}</small>
                    </td>
                    <td>{req.start_date}</td>
                    <td>{req.end_date}</td>
                    <td>{req.days_requested}</td>
                    <td>{req.reason || '-'}</td>
                    <td>
                      {hasConflicts && (
                        <div style={{ 
                          backgroundColor: '#4a3f1a',
                          border: '1px solid #f59e0b',
                          color: '#fcd34d',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          marginBottom: hasBlockedDays ? '0.5rem' : 0,
                          fontSize: '0.875rem'
                        }}>
                          <strong style={{ color: '#fcd34d' }}>Conflict:</strong>
                          {req.conflicts.map(c => (
                            <div key={c.id} style={{ color: '#fcd34d' }}>
                              {c.full_name}: {c.start_date} to {c.end_date}
                            </div>
                          ))}
                        </div>
                      )}
                      {hasBlockedDays && (
                        <div style={{ 
                          backgroundColor: '#4a1a1a',
                          border: '1px solid #dc2626',
                          color: '#fca5a5',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          <strong style={{ color: '#fca5a5' }}>Blocked Days:</strong>
                          {req.blocked_days.map(b => (
                            <div key={b.id} style={{ color: '#fca5a5' }}>
                              {b.blocked_date}: {b.reason}
                            </div>
                          ))}
                        </div>
                      )}
                      {!hasConflicts && !hasBlockedDays && (
                        <span style={{ color: '#86efac' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(req)}
                        style={{ marginBottom: '0.25rem' }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDecline(req.id)}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}