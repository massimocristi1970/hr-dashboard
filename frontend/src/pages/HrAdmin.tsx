import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaveSummary {
  year: number;
  total_allowance: number;
  annual_allowance: number;
  carryover: number;
  taken: number;
  unpaid_taken: number;
  sick_taken: number;
  remaining: number;
  entitlement_set: boolean;
}

interface AccessLink {
  label: string;
  url: string;
}

interface Employee {
  id: number;
  email: string;
  full_name: string;
  manager_email: string;
  onedrive_folder_url: string;
  onedrive_shared_with_employee: boolean;
  onedrive_extra_access_links: AccessLink[];
  leave_summary: LeaveSummary;
}

interface BlockedDay {
  id: number;
  blocked_date: string;
  reason: string;
  created_by_email: string;
  created_at: string;
}

interface AppraisalSettings {
  cadence: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  self_review_deadline_days: number;
  manager_review_deadline_days: number;
  updated_by_email?: string | null;
  updated_at?: string | null;
}

interface AppraisalArea {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface AppraisalRun {
  id: number;
  full_name: string;
  email: string;
  cycle_label: string;
  cadence: string;
  cycle_start_date: string;
  cycle_end_date: string;
  self_review_due_date: string;
  manager_review_due_date: string;
  status: 'self_review_pending' | 'manager_review_pending' | 'completed';
  employee_submitted_at?: string | null;
  manager_completed_at?: string | null;
}

interface AppraisalAdminPayload {
  settings: AppraisalSettings;
  areas: AppraisalArea[];
  appraisals: AppraisalRun[];
}

interface EmployeeFormData {
  email: string;
  full_name: string;
  manager_email: string;
  onedrive_folder_url: string;
  onedrive_shared_with_employee: boolean;
  onedrive_extra_access_links: AccessLink[];
}

function createEmptyEmployeeForm(): EmployeeFormData {
  return {
    email: '',
    full_name: '',
    manager_email: '',
    onedrive_folder_url: '',
    onedrive_shared_with_employee: false,
    onedrive_extra_access_links: [],
  };
}

function mapEmployeeToForm(employee: Employee): EmployeeFormData {
  return {
    email: employee.email,
    full_name: employee.full_name,
    manager_email: employee.manager_email || '',
    onedrive_folder_url: employee.onedrive_folder_url || '',
    onedrive_shared_with_employee: employee.onedrive_shared_with_employee || false,
    onedrive_extra_access_links: employee.onedrive_extra_access_links || [],
  };
}

export default function HrAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [appraisalAdmin, setAppraisalAdmin] = useState<AppraisalAdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBlockedDayForm, setShowBlockedDayForm] = useState(false);
  const [showAppraisalAreaForm, setShowAppraisalAreaForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'blocked-days' | 'appraisals'>('employees');
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeForm());

  const [blockedDayFormData, setBlockedDayFormData] = useState({
    blocked_date: '',
    reason: '',
  });

  const [appraisalSettingsForm, setAppraisalSettingsForm] = useState<AppraisalSettings>({
    cadence: 'quarterly',
    self_review_deadline_days: 7,
    manager_review_deadline_days: 7,
  });

  const [appraisalAreaForm, setAppraisalAreaForm] = useState({
    title: '',
    description: '',
    sort_order: 0,
  });

  const [appraisalCycleForm, setAppraisalCycleForm] = useState({
    cycle_label: '',
    cycle_start_date: '',
    cycle_end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [employeesData, blockedDaysData, appraisalData] = await Promise.all([
        api.getAllEmployees(),
        api.getBlockedDays(),
        api.getAppraisalAdminData(),
      ]);
      setEmployees(employeesData);
      setBlockedDays(blockedDaysData);
      setAppraisalAdmin(appraisalData);
      setAppraisalSettingsForm(appraisalData.settings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetEmployeeForm() {
    setFormData(createEmptyEmployeeForm());
    setEditingEmployeeId(null);
    setShowAddForm(false);
  }

  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addEmployee({
        ...formData,
        manager_email: formData.manager_email || undefined,
        onedrive_folder_url: formData.onedrive_folder_url || undefined,
        onedrive_extra_access_links: formData.onedrive_extra_access_links.filter(
          (link) => link.label.trim() && link.url.trim()
        ),
      });
      alert(editingEmployeeId ? 'Employee updated.' : 'Employee added.');
      resetEmployeeForm();
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleToggleEmployeeSharing(employee: Employee, shared: boolean) {
    try {
      await api.addEmployee({
        ...mapEmployeeToForm(employee),
        manager_email: employee.manager_email || undefined,
        onedrive_folder_url: employee.onedrive_folder_url || undefined,
        onedrive_shared_with_employee: shared,
        onedrive_extra_access_links: employee.onedrive_extra_access_links || [],
      });

      setEmployees((current) =>
        current.map((emp) =>
          emp.id === employee.id
            ? { ...emp, onedrive_shared_with_employee: shared }
            : emp
        )
      );

      if (editingEmployeeId === employee.id) {
        setFormData((current) => ({
          ...current,
          onedrive_shared_with_employee: shared,
        }));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  function handleEditEmployee(employee: Employee) {
    setFormData(mapEmployeeToForm(employee));
    setEditingEmployeeId(employee.id);
    setShowAddForm(true);
  }

  function updateAccessLink(index: number, key: 'label' | 'url', value: string) {
    setFormData((current) => ({
      ...current,
      onedrive_extra_access_links: current.onedrive_extra_access_links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [key]: value } : link
      ),
    }));
  }

  function addAccessLink() {
    setFormData((current) => ({
      ...current,
      onedrive_extra_access_links: [
        ...current.onedrive_extra_access_links,
        { label: '', url: '' },
      ],
    }));
  }

  function removeAccessLink(index: number) {
    setFormData((current) => ({
      ...current,
      onedrive_extra_access_links: current.onedrive_extra_access_links.filter((_, linkIndex) => linkIndex !== index),
    }));
  }

  async function copyToClipboard(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      alert(successMessage);
    } catch {
      alert('Could not copy to clipboard.');
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
      loadData();
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

  async function handleSaveAppraisalSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await api.saveAppraisalSettings({
        cadence: appraisalSettingsForm.cadence,
        self_review_deadline_days: Number(appraisalSettingsForm.self_review_deadline_days),
        manager_review_deadline_days: Number(appraisalSettingsForm.manager_review_deadline_days),
      });
      setAppraisalSettingsForm(updated);
      alert('Appraisal settings saved.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleAddAppraisalArea(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addAppraisalArea({
        title: appraisalAreaForm.title,
        description: appraisalAreaForm.description || undefined,
        sort_order: Number(appraisalAreaForm.sort_order),
      });
      setAppraisalAreaForm({ title: '', description: '', sort_order: 0 });
      setShowAppraisalAreaForm(false);
      alert('Appraisal area added.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleArchiveAppraisalArea(id: number, title: string) {
    if (!confirm(`Archive appraisal area "${title}"?`)) {
      return;
    }
    try {
      await api.archiveAppraisalArea(id);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleLaunchAppraisalCycle(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.launchAppraisalCycle(appraisalCycleForm);
      alert('Appraisal cycle launched.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleResetSelfReflection(appraisalId: number, employeeName: string) {
    if (!confirm(`Reset the self-reflection for ${employeeName}? This will clear the employee and manager appraisal responses so it can be resubmitted.`)) {
      return;
    }

    try {
      await api.resetAppraisalSelfReview(appraisalId);
      alert('Self-reflection reset.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <div className="loading-state">Loading HR admin tools...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const configuredFolders = employees.filter((employee) => employee.onedrive_folder_url).length;
  const sharedFolders = employees.filter((employee) => employee.onedrive_shared_with_employee).length;

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
              <span className="metric-label">OneDrive Configured</span>
              <span className="metric-value">{configuredFolders}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Shared Confirmed</span>
              <span className="metric-value">{sharedFolders}</span>
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
        <button
          className={activeTab === 'appraisals' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('appraisals')}
        >
          Appraisals
        </button>
      </div>

      {activeTab === 'employees' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Employees</h2>
              <p>Maintain employee records, allowances, managers, and OneDrive links.</p>
            </div>
            <button className="btn" onClick={() => {
              if (showAddForm && !editingEmployeeId) {
                resetEmployeeForm();
                return;
              }
              setFormData(createEmptyEmployeeForm());
              setEditingEmployeeId(null);
              setShowAddForm(true);
            }}>
              {showAddForm && !editingEmployeeId ? 'Cancel' : 'Add Employee'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSaveEmployee} className="surface-panel stack" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <div className="section-header">
                <div>
                  <h3 style={{ marginBottom: '0.35rem' }}>{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</h3>
                  <p style={{ margin: 0 }}>
                    Save the employee record, folder link, and any extra OneDrive links from one place.
                  </p>
                </div>
              </div>

              <div className="form-grid form-grid--two">
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
                    placeholder="https://yourcompany-my.sharepoint.com/..."
                  />
                  <small className="form-help">
                    Paste the folder link that should open for this employee.
                  </small>
                </div>
              </div>

              <div className="surface-panel stack" style={{ padding: '16px' }}>
                <div className="section-header">
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>Sharing Workflow</h3>
                    <p style={{ margin: 0 }}>
                      This does not change OneDrive permissions automatically. It records your admin checklist in the app.
                    </p>
                  </div>
                </div>
                <label className="inline-actions" style={{ alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.onedrive_shared_with_employee}
                    onChange={(e) => setFormData({ ...formData, onedrive_shared_with_employee: e.target.checked })}
                  />
                  <span>I have completed the HR sharing step for this employee</span>
                </label>
                <div className="inline-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={!formData.onedrive_folder_url}
                    onClick={() => window.open(formData.onedrive_folder_url, '_blank', 'noopener,noreferrer')}
                  >
                    Open Folder
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={!formData.onedrive_folder_url}
                    onClick={() => copyToClipboard(formData.onedrive_folder_url, 'Folder link copied.')}
                  >
                    Copy Folder Link
                  </button>
                </div>
              </div>

              <div className="surface-panel stack" style={{ padding: '16px' }}>
                <div className="section-header">
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>Extra Access Links</h3>
                    <p style={{ margin: 0 }}>
                      Add any extra share links for managers or other people who should also be able to open the same folder.
                    </p>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={addAccessLink}>
                    Add Link
                  </button>
                </div>

                {formData.onedrive_extra_access_links.length === 0 ? (
                  <p className="muted-text" style={{ margin: 0 }}>No extra access links added yet.</p>
                ) : (
                  formData.onedrive_extra_access_links.map((link, index) => (
                    <div key={`${index}-${link.label}`} className="form-grid form-grid--two">
                      <div className="form-group">
                        <label>Link Label</label>
                        <input
                          type="text"
                          placeholder="e.g., Manager Share Link"
                          value={link.label}
                          onChange={(e) => updateAccessLink(index, 'label', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Link URL</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateAccessLink(index, 'url', e.target.value)}
                        />
                      </div>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={!link.url}
                          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                        >
                          Open Link
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={!link.url}
                          onClick={() => copyToClipboard(link.url, `${link.label || 'Access'} link copied.`)}
                        >
                          Copy Link
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => removeAccessLink(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="inline-actions">
                <button type="submit" className="btn btn-success">Save Employee</button>
                <button type="button" className="btn btn-secondary" onClick={resetEmployeeForm}>Cancel</button>
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
                  <th>OneDrive Workflow</th>
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
                          <span className="status-badge status-pending">Annual Used {emp.leave_summary.taken}</span>
                          <span className="status-badge status-neutral">Unpaid {emp.leave_summary.unpaid_taken}</span>
                          <span className="status-badge status-neutral">Sick {emp.leave_summary.sick_taken}</span>
                          <span className={`status-badge ${emp.leave_summary.remaining > 0 ? 'status-approved' : 'status-declined'}`}>
                            Left {emp.leave_summary.remaining}
                          </span>
                        </div>
                      ) : (
                        <span className="status-badge status-pending">Not set</span>
                      )}
                    </td>
                    <td>
                      <div className="stack" style={{ gap: '10px' }}>
                        <div className="inline-actions">
                          <span className={`status-badge ${emp.onedrive_folder_url ? 'status-approved' : 'status-pending'}`}>
                            {emp.onedrive_folder_url ? 'Folder linked' : 'Folder missing'}
                          </span>
                          <label className="inline-actions" style={{ alignItems: 'center', gap: '8px' }}>
                            <span className={`status-badge ${emp.onedrive_shared_with_employee ? 'status-approved' : 'status-neutral'}`}>
                              HR Sharing
                            </span>
                            <input
                              type="checkbox"
                              checked={emp.onedrive_shared_with_employee}
                              disabled={!emp.onedrive_folder_url}
                              onChange={(e) => handleToggleEmployeeSharing(emp, e.target.checked)}
                              style={{ width: 'auto' }}
                            />
                          </label>
                        </div>
                        <small className="muted-text">Tick once the employee confirms they can open the folder.</small>
                        <div className="inline-actions">
                          <button
                            className="btn btn-secondary"
                            disabled={!emp.onedrive_folder_url}
                            onClick={() => window.open(emp.onedrive_folder_url, '_blank', 'noopener,noreferrer')}
                          >
                            Open Folder
                          </button>
                          <button
                            className="btn btn-secondary"
                            disabled={!emp.onedrive_folder_url}
                            onClick={() => copyToClipboard(emp.onedrive_folder_url, 'Folder link copied.')}
                          >
                            Copy Folder Link
                          </button>
                        </div>
                        {emp.onedrive_extra_access_links?.length > 0 && (
                          <div className="stack" style={{ gap: '8px' }}>
                            {emp.onedrive_extra_access_links.map((link) => (
                              <div key={`${emp.id}-${link.label}-${link.url}`} className="inline-actions">
                                <span className="status-badge status-neutral">{link.label}</span>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  Open
                                </a>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => copyToClipboard(link.url, `${link.label} copied.`)}
                                >
                                  Copy
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditEmployee(emp)}
                        >
                          Manage OneDrive
                        </button>
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
                      </div>
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

      {activeTab === 'appraisals' && appraisalAdmin && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Appraisals</h2>
              <p>Set the cadence, define the review areas, and launch a cycle for employees and managers.</p>
            </div>
          </div>

          <form onSubmit={handleSaveAppraisalSettings} className="surface-panel stack" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Schedule Settings</h3>
                <p style={{ margin: 0 }}>Choose the appraisal rhythm and how long each stage stays open after a cycle ends.</p>
              </div>
            </div>
            <div className="form-grid form-grid--two">
              <div className="form-group">
                <label>Cadence</label>
                <select
                  value={appraisalSettingsForm.cadence}
                  onChange={(e) => setAppraisalSettingsForm({
                    ...appraisalSettingsForm,
                    cadence: e.target.value as AppraisalSettings['cadence'],
                  })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biannual">Bi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Self Review Deadline (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={appraisalSettingsForm.self_review_deadline_days}
                  onChange={(e) => setAppraisalSettingsForm({
                    ...appraisalSettingsForm,
                    self_review_deadline_days: Number(e.target.value),
                  })}
                />
              </div>
              <div className="form-group">
                <label>Manager Review Deadline (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={appraisalSettingsForm.manager_review_deadline_days}
                  onChange={(e) => setAppraisalSettingsForm({
                    ...appraisalSettingsForm,
                    manager_review_deadline_days: Number(e.target.value),
                  })}
                />
              </div>
            </div>
            <div className="inline-actions">
              <button type="submit" className="btn btn-success">Save Settings</button>
            </div>
          </form>

          <div className="surface-panel stack" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Appraisal Areas</h3>
                <p style={{ margin: 0 }}>These are the sections both employee and manager will use during the review.</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowAppraisalAreaForm((current) => !current)}>
                {showAppraisalAreaForm ? 'Cancel' : 'Add Area'}
              </button>
            </div>

            {showAppraisalAreaForm && (
              <form onSubmit={handleAddAppraisalArea} className="form-grid form-grid--two">
                <div className="form-group">
                  <label>Area Title</label>
                  <input
                    type="text"
                    required
                    value={appraisalAreaForm.title}
                    onChange={(e) => setAppraisalAreaForm({ ...appraisalAreaForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={appraisalAreaForm.sort_order}
                    onChange={(e) => setAppraisalAreaForm({ ...appraisalAreaForm, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={appraisalAreaForm.description}
                    onChange={(e) => setAppraisalAreaForm({ ...appraisalAreaForm, description: e.target.value })}
                  />
                </div>
                <div className="inline-actions">
                  <button type="submit" className="btn btn-success">Save Area</button>
                </div>
              </form>
            )}

            {appraisalAdmin.areas.length === 0 ? (
              <div className="empty-state">No appraisal areas configured yet.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Description</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appraisalAdmin.areas.map((area) => (
                      <tr key={area.id}>
                        <td>{area.title}</td>
                        <td>{area.description || '-'}</td>
                        <td>{area.sort_order}</td>
                        <td>
                          <span className={`status-badge ${area.is_active ? 'status-approved' : 'status-neutral'}`}>
                            {area.is_active ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td>
                          {area.is_active ? (
                            <button className="btn btn-danger" onClick={() => handleArchiveAppraisalArea(area.id, area.title)}>
                              Archive
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
          </div>

          <form onSubmit={handleLaunchAppraisalCycle} className="surface-panel stack" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Launch Appraisal Cycle</h3>
                <p style={{ margin: 0 }}>Creates an appraisal record for every employee using the active areas and current cadence.</p>
              </div>
            </div>
            <div className="form-grid form-grid--two">
              <div className="form-group">
                <label>Cycle Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q2 2026 Review"
                  value={appraisalCycleForm.cycle_label}
                  onChange={(e) => setAppraisalCycleForm({ ...appraisalCycleForm, cycle_label: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cycle Start Date</label>
                <input
                  type="date"
                  required
                  value={appraisalCycleForm.cycle_start_date}
                  onChange={(e) => setAppraisalCycleForm({ ...appraisalCycleForm, cycle_start_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cycle End Date</label>
                <input
                  type="date"
                  required
                  value={appraisalCycleForm.cycle_end_date}
                  onChange={(e) => setAppraisalCycleForm({ ...appraisalCycleForm, cycle_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="inline-actions">
              <button type="submit" className="btn btn-success">Launch Cycle</button>
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Cycle</th>
                  <th>Period</th>
                  <th>Self Review Due</th>
                  <th>Manager Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appraisalAdmin.appraisals.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">No appraisal cycles launched yet.</div>
                    </td>
                  </tr>
                ) : (
                  appraisalAdmin.appraisals.map((appraisal) => (
                    <tr key={appraisal.id}>
                      <td>
                        {appraisal.full_name}
                        <br />
                        <small className="muted-text">{appraisal.email}</small>
                      </td>
                      <td>
                        <strong>{appraisal.cycle_label}</strong>
                        <br />
                        <small className="muted-text">{appraisal.cadence}</small>
                      </td>
                      <td>{appraisal.cycle_start_date} to {appraisal.cycle_end_date}</td>
                      <td>{appraisal.self_review_due_date}</td>
                      <td>{appraisal.manager_review_due_date}</td>
                      <td>
                        <span className={`status-badge ${
                          appraisal.status === 'completed'
                            ? 'status-approved'
                            : appraisal.status === 'manager_review_pending'
                              ? 'status-pending'
                              : 'status-neutral'
                        }`}>
                          {appraisal.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {appraisal.status !== 'self_review_pending' ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleResetSelfReflection(appraisal.id, appraisal.full_name)}
                          >
                            Reset Self-Reflection
                          </button>
                        ) : (
                          <span className="muted-text">No action</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
