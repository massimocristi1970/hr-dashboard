import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const approvedRequests = requests.filter(r => r.status === 'approved');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const declinedRequests = requests.filter(r => r.status === 'declined');

  // Calculate total approved days
  const totalApprovedDays = approvedRequests.reduce((sum, r) => sum + r.days_requested, 0);

  return (
    <div>
      <h1 className="page-title">My Dashboard</h1>
      
      {/* Summary Card */}
      <div style={{ 
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#86efac' }}>Approved Leave</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.87)' }}>
              <strong>{totalApprovedDays}</strong> days ({approvedRequests.length} requests)
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fcd34d' }}>Pending</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.87)' }}>
              <strong>{pendingRequests.length}</strong> requests
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5' }}>Declined</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.87)' }}>
              <strong>{declinedRequests.length}</strong> requests
            </p>
          </div>
        </div>
      </div>

      {/* Approved Leave Section */}
      {approvedRequests.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#28a745' }}>My Approved Leave</h2>
          <table>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
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
                  <td>{req.reason || '-'}</td>
                  <td>{req.manager_notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* All Requests Section */}
      <div className="card">
        <h2>All My Leave Requests</h2>
        {requests.length === 0 ? (
          <p>No leave requests yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Manager Notes</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td>{req.days_requested}</td>
                  <td>{req.reason || '-'}</td>
                  <td>
                    <span className={`status-badge status-${req.status}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.manager_notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}