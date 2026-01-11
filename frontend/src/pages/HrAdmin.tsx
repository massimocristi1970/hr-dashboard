import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Employee {
  id: number;
  email: string;
  full_name: string;
  manager_email: string;
  onedrive_folder_url: string;
}

export default function HrAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    manager_email: '',
    onedrive_folder_url: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await api.getAllEmployees();
      setEmployees(data);
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
      loadEmployees();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleSetEntitlement(employeeId: number) {
    const year = parseInt(prompt('Year (e.g., 2026):') || '');
    const allowance = parseFloat(prompt('Annual allowance (days):') || '');
    const carryover = parseFloat(prompt('Carryover days:') || '0');

    if (!year || !allowance) return;

    try {
      await api.setEntitlement({
        employee_id: employeeId,
        year,
        annual_allowance_days: allowance,
        carryover_days: carryover,
      });
      alert('Entitlement set!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">HR Admin</h1>
      
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
              />
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
              <th>OneDrive Folder</th>
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
                  {emp.onedrive_folder_url ? (
                    <a href={emp.onedrive_folder_url} target="_blank" rel="noopener noreferrer">
                      View Folder
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <button
                    className="btn"
                    onClick={() => handleSetEntitlement(emp.id)}
                  >
                    Set Entitlement
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}