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

  if (loading) return <div className="loading-state">Loading HR admin tools...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Admin Workspace</p>
            <h1>HR Admin</h1>
            <p>
              Manage employees, leave entitlements, blocked dates, and OneDrive
              setup from the same polished blue-led interface.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Employees</span>
              <span className="metric-value">{employees.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Blocked Days</span>
              <span className="metric-value">{blockedDays.length}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="inline-actions">
        <button
          className={activeTab === 'employees' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          className={activeTab === 'blocked-days' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('blocked-days')}
        >
          Blocked Days
        </button>
      </div>

      {activeTab === 'employees' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Employees</h2>
              <p>Maintain employee records, allowances, managers, and OneDrive links.</p>
            </div>
            <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Employee'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddEmployee} className="surface-panel form-grid" style={{ marginTop: '1rem' }}>
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
                <small className="form-help">
                  Each agent's personal OneDrive folder URL for file uploads
                </small>
              </div>
              <div className="inline-actions">
                <button type="submit" className="btn btn-success">Save Employee</button>
              </div>
            </form>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Manager</th>
                  <th>Leave Allowance ({new Date().getFullYear()})</th>
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
                        <div className="inline-actions">
                          <span className="status-badge status-neutral">Total {emp.leave_summary.total_allowance}</span>
                          <span className="status-badge status-pending">Taken {emp.leave_summary.taken}</span>
                          <span className={`status-badge ${emp.leave_summary.remaining > 0 ? 'status-approved' : 'status-declined'}`}>
                            Left {emp.leave_summary.remaining}
                          </span>
                        </div>
                      ) : (
                        <span className="status-badge status-pending">Not set</span>
                      )}
                    </td>
                    <td>
                      {emp.onedrive_folder_url ? (
                        <a href={emp.onedrive_folder_url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      ) : (
                        <span className="muted-text">-</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleSetEntitlement(
                          emp.id, 
                          emp.leave_summary?.annual_allowance, 
                          emp.leave_summary?.carryover
                        )}
                      >
                        {emp.leave_summary?.entitlement_set ? 'Edit' : 'Set'} Entitlement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'blocked-days' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Blocked Days</h2>
              <p>
            Block specific days to prevent leave requests from being approved on those dates. 
            As an admin, you can still override and approve leave on blocked days if needed.
              </p>
            </div>
          </div>
          
          <button 
            className="btn" 
            onClick={() => setShowBlockedDayForm(!showBlockedDayForm)}
            style={{ marginBottom: '1rem' }}
          >
            {showBlockedDayForm ? 'Cancel' : 'Add Blocked Day'}
          </button>

          {showBlockedDayForm && (
            <form onSubmit={handleAddBlockedDay} className="surface-panel form-grid" style={{ marginBottom: '1.5rem' }}>
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
              <div className="inline-actions">
                <button type="submit" className="btn btn-success">Block Day</button>
              </div>
            </form>
          )}

          {blockedDays.length === 0 ? (
            <div className="empty-state">No blocked days configured.</div>
          ) : (
            <div className="table-wrap">
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
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
