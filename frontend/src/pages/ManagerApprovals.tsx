import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface PendingRequest {
  id: number;
  full_name: string;
  email: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  created_at: string;
}

export default function ManagerApprovals() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getPendingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    const notes = prompt('Approval notes (optional):') || '';
    try {
      await api.approveRequest(id, notes);
      alert('Request approved!');
      loadRequests();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDecline(id: number) {
    const notes = prompt('Reason for declining:') || '';
    try {
      await api.declineRequest(id, notes);
      alert('Request declined.');
      loadRequests();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">Manager Approvals</h1>
      
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
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
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(req.id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}