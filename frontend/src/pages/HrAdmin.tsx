import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaveSummary {
  year: number;
  total_allowance: number;
  annual_allowance: number;
  carryover: number;
  taken: number;
  remaining: number;
  entitlement_set: boolean;
}

interface Employee {
  id: number;
  email: string;
  full_name: string;
  manager_email: string;
  onedrive_folder_url: string;
  leave_summary: LeaveSummary;
}

interface BlockedDay {
  id: number;
  blocked_date: string;
  reason: string;
  created_by_email: string;
  created_at: string;
}

export default function HrAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBlockedDayForm, setShowBlockedDayForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'blocked-days'>('employees');

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    manager_email: '',
    onedrive_folder_url: '',
  });

  const [blockedDayFormData, setBlockedDayFormData] = useState({
    blocked_date: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [employeesData, blockedDaysData] = await Promise.all([
        api.getAllEmployees(),
        api.getBlockedDays()
      ]);
      setEmployees(employeesData);
      setBlockedDays(blockedDaysData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addEmployee(formData);
      alert('Employee added!');
      setFormData({ email: '', full_name: '', manager_email: '', onedrive_folder_url: '' });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleSetEntitlement(employeeId: number, currentAllowance?: number, currentCarryover?: number) {
    const currentYear = new Date().getFullYear();
    const yearStr = prompt('Year:', currentYear.toString());
    if (!yearStr) return;
    const year = parseInt(yearStr);
    
    const allowanceStr = prompt('Annual allowance (days):', currentAllowance?.toString() || '28');
    if (!allowanceStr) return;
    const allowance = parseFloat(allowanceStr);
    
    const carryoverStr = prompt('Carryover days:', currentCarryover?.toString() || '0');
    const carryover = parseFloat(carryoverStr || '0');

    if (!year || isNaN(allowance)) {
      alert('Invalid input');
      return;
    }

    try {
      await api.setEntitlement({
        employee_id: employeeId,
        year,
        annual_allowance_days: allowance,
        carryover_days: carryover,
      });
      alert('Entitlement set!');
      loadData(); // Reload to show updated values
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleAddBlockedDay(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addBlockedDay(blockedDayFormData);
      alert('Blocked day added!');
      setBlockedDayFormData({ blocked_date: '', reason: '' });
      setShowBlockedDayForm(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDeleteBlockedDay(id: number, date: string) {
    if (!confirm(`Are you sure you want to remove the block on ${date}?`)) {
      return;
    }
    try {
      await api.deleteBlockedDay(id);
      alert('Blocked day removed.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">HR Admin</h1>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          className={`btn ${activeTab === 'employees' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('employees')}
          style={{ marginRight: '0.5rem' }}
        >
          Employees
        </button>
        <button
          className={`btn ${activeTab === 'blocked-days' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('blocked-days')}
        >
          Blocked Days
        </button>
      </div>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="card">
          <h2>Employees</h2>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add Employee'}
          </button>

          {showAddForm && (
            <form onSubmit={handleAddEmployee} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Manager Email (Optional)</label>
                <input
                  type="email"
                  value={formData.manager_email}
                  onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>OneDrive Folder URL (Optional)</label>
                <input
                  type="url"
                  value={formData.onedrive_folder_url}
                  onChange={(e) => setFormData({ ...formData, onedrive_folder_url: e.target.value })}
                  placeholder="https://yourcompany-my.sharepoint.com/personal/..."
                />
                <small style={{ color: '#aaa' }}>
                  Each agent's personal OneDrive folder URL for file uploads
                </small>
              </div>
              <button type="submit" className="btn btn-success">Save Employee</button>
            </form>
          )}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Manager</th>
                <th style={{ textAlign: 'center' }}>Leave Allowance ({new Date().getFullYear()})</th>
                <th>OneDrive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.manager_email || '-'}</td>
                  <td>
                    {emp.leave_summary?.entitlement_set ? (
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total</div>
                          <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{emp.leave_summary.total_allowance}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Taken</div>
                          <div style={{ fontWeight: 'bold', color: '#f97316' }}>{emp.leave_summary.taken}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Left</div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: emp.leave_summary.remaining > 0 ? '#22c55e' : '#ef4444' 
                          }}>
                            {emp.leave_summary.remaining}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#f59e0b' }}>Not set</span>
                    )}
                  </td>
                  <td>
                    {emp.onedrive_folder_url ? (
                      <a href={emp.onedrive_folder_url} target="_blank" rel="noopener noreferrer">
                        Open
                      </a>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => handleSetEntitlement(
                        emp.id, 
                        emp.leave_summary?.annual_allowance, 
                        emp.leave_summary?.carryover
                      )}
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    >
                      {emp.leave_summary?.entitlement_set ? 'Edit' : 'Set'} Entitlement
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blocked Days Tab */}
      {activeTab === 'blocked-days' && (
        <div className="card">
          <h2>Blocked Days</h2>
          <p style={{ color: '#aaa' }}>
            Block specific days to prevent leave requests from being approved on those dates. 
            As an admin, you can still override and approve leave on blocked days if needed.
          </p>
          
          <button 
            className="btn btn-primary" 
            onClick={() => setShowBlockedDayForm(!showBlockedDayForm)}
            style={{ marginBottom: '1rem' }}
          >
            {showBlockedDayForm ? 'Cancel' : 'Add Blocked Day'}
          </button>

          {showBlockedDayForm && (
            <form onSubmit={handleAddBlockedDay} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #444' }}>
              <div className="form-group">
                <label>Date to Block</label>
                <input
                  type="date"
                  required
                  value={blockedDayFormData.blocked_date}
                  onChange={(e) => setBlockedDayFormData({ ...blockedDayFormData, blocked_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Company-wide event, Inventory day, etc."
                  value={blockedDayFormData.reason}
                  onChange={(e) => setBlockedDayFormData({ ...blockedDayFormData, reason: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-success">Block Day</button>
            </form>
          )}

          {blockedDays.length === 0 ? (
            <p>No blocked days configured.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedDays.map((day) => (
                  <tr key={day.id}>
                    <td>
                      <strong>{day.blocked_date}</strong>
                    </td>
                    <td>{day.reason}</td>
                    <td>{day.created_by_email}</td>
                    <td>{new Date(day.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteBlockedDay(day.id, day.blocked_date)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}