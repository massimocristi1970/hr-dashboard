import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { calculateWorkingLeaveDays } from '../lib/leaveCalendarDates';
import {
  managerReferenceBuildOrder,
  managerReferenceGuides,
  managerReferencePriorities,
  managerReferenceSections,
} from '../lib/managerReference';

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

interface AdminLeaveRequest {
  id: number;
  employee_id: number;
  full_name: string;
  email: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: 'annual' | 'unpaid' | 'sick';
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason: string;
  manager_notes?: string | null;
  start_half_day?: 'full' | 'am' | 'pm';
  end_half_day?: 'full' | 'am' | 'pm';
  created_at: string;
  updated_at: string;
}

interface BlockedDay {
  id: number;
  blocked_date: string;
  reason: string;
  created_by_email: string;
  created_at: string;
}

interface BankHoliday {
  id: number;
  holiday_date: string;
  description: string;
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

interface BradfordWindowSummary {
  range_start: string;
  range_end: string;
  occurrences: number;
  total_days: number;
  bradford_score: number;
}

interface ReturnToWorkRecord {
  id: number;
  employee_id: number;
  leave_request_id: number;
  manager_name?: string | null;
  manager_comments?: string | null;
  employee_comments?: string | null;
  support_actions?: string | null;
  wellbeing_notes?: string | null;
  manager_signature?: string | null;
  employee_signature?: string | null;
  manager_signed_at?: string | null;
  employee_signed_at?: string | null;
  form_completed_date: string;
  return_to_work_date: string;
  absence_days: number;
  occurrences_last_3_months: number;
  bradford_last_3_months: number;
  occurrences_last_6_months: number;
  bradford_last_6_months: number;
  occurrences_last_9_months: number;
  bradford_last_9_months: number;
  occurrences_last_52_weeks: number;
  bradford_last_52_weeks: number;
  policy_bradford_score: number;
  saved_document_name?: string | null;
  saved_document_url?: string | null;
}

interface AbsenceRecord {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason?: string | null;
  manager_notes?: string | null;
  start_half_day?: 'full' | 'am' | 'pm';
  end_half_day?: 'full' | 'am' | 'pm';
  created_at: string;
  updated_at: string;
  rtw_form_id?: number | null;
  form_completed_date?: string | null;
  return_to_work_date?: string | null;
  policy_bradford_score?: number | null;
  saved_document_name?: string | null;
  saved_document_url?: string | null;
}

interface AbsenceEmployeeSummary {
  total_days: number;
  total_occurrences: number;
  policy_bradford_score: number;
  last_3_months: BradfordWindowSummary;
  last_6_months: BradfordWindowSummary;
  last_9_months: BradfordWindowSummary;
  last_52_weeks: BradfordWindowSummary;
}

interface AbsenceEmployee {
  id: number;
  email: string;
  full_name: string;
  manager_email: string;
  onedrive_folder_url: string;
  absence_summary: AbsenceEmployeeSummary;
  absences: AbsenceRecord[];
}

interface ReturnToWorkDetail {
  leave_request_id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  manager_email: string;
  onedrive_folder_url: string;
  absence: {
    id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason?: string | null;
    manager_notes?: string | null;
    status: string;
  };
  metrics: {
    last_3_months: BradfordWindowSummary;
    last_6_months: BradfordWindowSummary;
    last_9_months: BradfordWindowSummary;
    last_52_weeks: BradfordWindowSummary;
  };
  form: ReturnToWorkRecord | null;
}

interface ReturnToWorkFormData {
  leave_request_id: number;
  manager_name: string;
  manager_comments: string;
  employee_comments: string;
  support_actions: string;
  wellbeing_notes: string;
  manager_signature: string;
  employee_signature: string;
  manager_signed_at: string;
  employee_signed_at: string;
  form_completed_date: string;
  return_to_work_date: string;
  saved_document_name: string;
  saved_document_url: string;
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

interface LeaveFormData {
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'annual' | 'unpaid' | 'sick';
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason: string;
  manager_notes: string;
  start_half_day: 'full' | 'am' | 'pm';
  end_half_day: 'full' | 'am' | 'pm';
}

function createEmptyLeaveForm(): LeaveFormData {
  return {
    employee_id: '',
    start_date: '',
    end_date: '',
    leave_type: 'annual',
    status: 'approved',
    reason: '',
    manager_notes: '',
    start_half_day: 'full',
    end_half_day: 'full',
  };
}

function mapLeaveToForm(request: AdminLeaveRequest): LeaveFormData {
  return {
    employee_id: request.employee_id.toString(),
    start_date: request.start_date,
    end_date: request.end_date,
    leave_type: request.leave_type,
    status: request.status,
    reason: request.reason || '',
    manager_notes: request.manager_notes || '',
    start_half_day: request.start_half_day || 'full',
    end_half_day: request.end_half_day || 'full',
  };
}

function formatLeaveType(type: AdminLeaveRequest['leave_type']) {
  if (type === 'annual') return 'Annual Leave';
  if (type === 'unpaid') return 'Unpaid Leave';
  return 'Sick Leave';
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

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function createEmptyReturnToWorkForm(leaveRequestId = 0): ReturnToWorkFormData {
  const today = getTodayDateString();
  return {
    leave_request_id: leaveRequestId,
    manager_name: '',
    manager_comments: '',
    employee_comments: '',
    support_actions: '',
    wellbeing_notes: '',
    manager_signature: '',
    employee_signature: '',
    manager_signed_at: today,
    employee_signed_at: today,
    form_completed_date: today,
    return_to_work_date: today,
    saved_document_name: '',
    saved_document_url: '',
  };
}

function formatBradfordWindowLabel(key: 'last_3_months' | 'last_6_months' | 'last_9_months' | 'last_52_weeks') {
  if (key === 'last_3_months') return 'Last Full 3 Months';
  if (key === 'last_6_months') return 'Last Full 6 Months';
  if (key === 'last_9_months') return 'Last Full 9 Months';
  return 'Rolling 52 Weeks';
}

function buildReturnToWorkFilename(detail: ReturnToWorkDetail) {
  const safeEmployee = detail.employee_name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return `RTW-${safeEmployee || 'employee'}-${detail.absence.end_date}.html`;
}

function buildReturnToWorkHtml(detail: ReturnToWorkDetail, form: ReturnToWorkFormData) {
  const metricRows: Array<{ label: string; metric: BradfordWindowSummary }> = [
    { label: 'Last Full 3 Months', metric: detail.metrics.last_3_months },
    { label: 'Last Full 6 Months', metric: detail.metrics.last_6_months },
    { label: 'Last Full 9 Months', metric: detail.metrics.last_9_months },
    { label: 'Rolling 52 Weeks', metric: detail.metrics.last_52_weeks },
  ];

  const escapeHtml = (value?: string | null) =>
    (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Return to Work Form</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #17324d; }
    h1, h2 { margin-bottom: 8px; color: #0e5ea8; }
    .panel { border: 1px solid #cfe0f2; border-radius: 14px; padding: 18px; margin-bottom: 18px; background: #f8fbff; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #5a7189; }
    .value { font-size: 14px; font-weight: 600; margin-top: 4px; white-space: pre-wrap; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #d7e4f2; }
  </style>
</head>
<body>
  <h1>Return to Work Form</h1>
  <div class="panel grid">
    <div><div class="label">Employee</div><div class="value">${escapeHtml(detail.employee_name)}</div></div>
    <div><div class="label">Manager</div><div class="value">${escapeHtml(form.manager_name || detail.manager_email)}</div></div>
    <div><div class="label">Absence Period</div><div class="value">${escapeHtml(detail.absence.start_date)} to ${escapeHtml(detail.absence.end_date)}</div></div>
    <div><div class="label">Return to Work Date</div><div class="value">${escapeHtml(form.return_to_work_date)}</div></div>
    <div><div class="label">Absence Days</div><div class="value">${detail.absence.days_requested}</div></div>
    <div><div class="label">Policy Bradford Score</div><div class="value">${detail.metrics.last_52_weeks.bradford_score}</div></div>
  </div>
  <div class="panel">
    <h2>Bradford Overview</h2>
    <table>
      <thead><tr><th>Window</th><th>Occurrences</th><th>Days</th><th>Score</th></tr></thead>
      <tbody>
        ${metricRows.map(({ label, metric }) => `<tr><td>${label}</td><td>${metric.occurrences}</td><td>${metric.total_days}</td><td>${metric.bradford_score}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div class="panel"><div class="label">Discussion Summary / Support Actions</div><div class="value">${escapeHtml(form.support_actions)}</div></div>
  <div class="panel"><div class="label">Wellbeing Notes</div><div class="value">${escapeHtml(form.wellbeing_notes)}</div></div>
  <div class="panel"><div class="label">Manager Comments</div><div class="value">${escapeHtml(form.manager_comments)}</div></div>
  <div class="panel"><div class="label">Employee Comments</div><div class="value">${escapeHtml(form.employee_comments)}</div></div>
  <div class="panel grid">
    <div><div class="label">Manager Signature</div><div class="value">${escapeHtml(form.manager_signature)}</div><div class="label">Date</div><div class="value">${escapeHtml(form.manager_signed_at)}</div></div>
    <div><div class="label">Employee Signature</div><div class="value">${escapeHtml(form.employee_signature)}</div><div class="label">Date</div><div class="value">${escapeHtml(form.employee_signed_at)}</div></div>
  </div>
</body>
</html>`;
}

export default function HrAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRequest[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>([]);
  const [appraisalAdmin, setAppraisalAdmin] = useState<AppraisalAdminPayload | null>(null);
  const [absenceAdmin, setAbsenceAdmin] = useState<AbsenceEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showBlockedDayForm, setShowBlockedDayForm] = useState(false);
  const [showBankHolidayForm, setShowBankHolidayForm] = useState(false);
  const [showAppraisalAreaForm, setShowAppraisalAreaForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'leave' | 'blocked-days' | 'bank-holidays' | 'appraisals' | 'absence' | 'manager-reference'>('employees');
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [editingLeaveId, setEditingLeaveId] = useState<number | null>(null);
  const [selectedAbsenceEmployeeId, setSelectedAbsenceEmployeeId] = useState<number | null>(null);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<number | null>(null);
  const [returnToWorkDetail, setReturnToWorkDetail] = useState<ReturnToWorkDetail | null>(null);
  const [returnToWorkFormData, setReturnToWorkFormData] = useState<ReturnToWorkFormData>(createEmptyReturnToWorkForm());
  const [referenceSearch, setReferenceSearch] = useState('');
  const [referenceSectionFilter, setReferenceSectionFilter] = useState('all');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(managerReferenceGuides[0]?.id || '');
  const [leaveFilters, setLeaveFilters] = useState({
    employee_id: 'all',
    leave_type: 'all',
    status: 'all',
  });

  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeForm());
  const [leaveFormData, setLeaveFormData] = useState<LeaveFormData>(createEmptyLeaveForm());

  const [blockedDayFormData, setBlockedDayFormData] = useState({
    blocked_date: '',
    reason: '',
  });
  const [bankHolidayFormData, setBankHolidayFormData] = useState({
    holiday_date: '',
    description: '',
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

  useEffect(() => {
    if (absenceAdmin.length === 0) {
      setSelectedAbsenceEmployeeId(null);
      setSelectedAbsenceId(null);
      setReturnToWorkDetail(null);
      setReturnToWorkFormData(createEmptyReturnToWorkForm());
      return;
    }

    const employeeStillExists = absenceAdmin.some((employee) => employee.id === selectedAbsenceEmployeeId);
    if (!employeeStillExists) {
      setSelectedAbsenceEmployeeId(absenceAdmin[0].id);
    }
  }, [absenceAdmin, selectedAbsenceEmployeeId]);

  useEffect(() => {
    if (!managerReferenceGuides.some((guide) => guide.id === selectedReferenceId) && managerReferenceGuides[0]) {
      setSelectedReferenceId(managerReferenceGuides[0].id);
    }
  }, [selectedReferenceId]);

  async function loadData() {
    try {
      setLoading(true);
      const [employeesData, requestsData, blockedDaysData, bankHolidaysData, appraisalData, absenceData] = await Promise.all([
        api.getAllEmployees(),
        api.getAllRequests(),
        api.getBlockedDays(),
        api.getAdminBankHolidays(),
        api.getAppraisalAdminData(),
        api.getAbsenceAdminData(),
      ]);
      setEmployees(employeesData);
      setLeaveRequests(requestsData);
      setBlockedDays(blockedDaysData);
      setBankHolidays(bankHolidaysData);
      setAppraisalAdmin(appraisalData);
      setAbsenceAdmin(absenceData);
      setAppraisalSettingsForm(appraisalData.settings);
      if (!selectedAbsenceEmployeeId && absenceData.length > 0) {
        setSelectedAbsenceEmployeeId(absenceData[0].id);
      }
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

  function resetLeaveForm() {
    setLeaveFormData(createEmptyLeaveForm());
    setEditingLeaveId(null);
    setShowLeaveForm(false);
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

  async function handleSaveLeave(e: React.FormEvent) {
    e.preventDefault();

    const employeeId = Number(leaveFormData.employee_id);
    if (!employeeId || !leaveFormData.start_date || !leaveFormData.end_date) {
      alert('Please choose an employee and valid dates.');
      return;
    }

    const payload = {
      employee_id: employeeId,
      start_date: leaveFormData.start_date,
      end_date: leaveFormData.end_date,
      leave_type: leaveFormData.leave_type,
      status: leaveFormData.status,
      reason: leaveFormData.reason || undefined,
      manager_notes: leaveFormData.manager_notes || undefined,
      start_half_day: leaveFormData.start_half_day,
      end_half_day: leaveFormData.end_half_day,
    };

    try {
      if (editingLeaveId) {
        await api.updateAdminLeave(editingLeaveId, payload);
        alert('Leave updated.');
      } else {
        await api.createAdminLeave(payload);
        alert('Leave added.');
      }
      resetLeaveForm();
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  function handleEditLeave(request: AdminLeaveRequest) {
    setLeaveFormData(mapLeaveToForm(request));
    setEditingLeaveId(request.id);
    setShowLeaveForm(true);
    setActiveTab('leave');
  }

  async function handleDeleteLeave(request: AdminLeaveRequest) {
    if (!confirm(`Soft delete ${request.full_name}'s ${formatLeaveType(request.leave_type)} entry from ${request.start_date} to ${request.end_date}?`)) {
      return;
    }

    try {
      await api.deleteAdminLeave(request.id);
      alert('Leave deleted.');
      if (editingLeaveId === request.id) {
        resetLeaveForm();
      }
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

  async function handleAddBankHoliday(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addBankHoliday(bankHolidayFormData);
      alert('Bank holiday added.');
      setBankHolidayFormData({ holiday_date: '', description: '' });
      setShowBankHolidayForm(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDeleteBankHoliday(id: number, date: string) {
    if (!confirm(`Are you sure you want to remove the bank holiday on ${date}?`)) {
      return;
    }

    try {
      await api.deleteBankHoliday(id);
      alert('Bank holiday removed.');
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

  async function handleOpenReturnToWork(absence: AbsenceRecord) {
    try {
      const detail = await api.getReturnToWorkDetail(absence.id);
      setSelectedAbsenceId(absence.id);
      setReturnToWorkDetail(detail);
      setReturnToWorkFormData({
        leave_request_id: detail.leave_request_id,
        manager_name: detail.form?.manager_name || detail.manager_email || '',
        manager_comments: detail.form?.manager_comments || '',
        employee_comments: detail.form?.employee_comments || '',
        support_actions: detail.form?.support_actions || '',
        wellbeing_notes: detail.form?.wellbeing_notes || '',
        manager_signature: detail.form?.manager_signature || '',
        employee_signature: detail.form?.employee_signature || '',
        manager_signed_at: detail.form?.manager_signed_at || getTodayDateString(),
        employee_signed_at: detail.form?.employee_signed_at || getTodayDateString(),
        form_completed_date: detail.form?.form_completed_date || getTodayDateString(),
        return_to_work_date: detail.form?.return_to_work_date || detail.absence.end_date,
        saved_document_name: detail.form?.saved_document_name || buildReturnToWorkFilename(detail),
        saved_document_url: detail.form?.saved_document_url || '',
      });
      setActiveTab('absence');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleSaveReturnToWork(e: React.FormEvent) {
    e.preventDefault();

    if (!returnToWorkDetail) {
      alert('Choose an absence first.');
      return;
    }

    try {
      const saved = await api.saveReturnToWorkForm({
        ...returnToWorkFormData,
        saved_document_name: returnToWorkFormData.saved_document_name || buildReturnToWorkFilename(returnToWorkDetail),
        saved_document_url: returnToWorkFormData.saved_document_url || undefined,
      });
      setReturnToWorkDetail((current) => (current ? { ...current, form: saved } : current));
      alert('Return to work form saved.');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  function handleDownloadReturnToWork() {
    if (!returnToWorkDetail) {
      alert('Choose an absence first.');
      return;
    }

    const html = buildReturnToWorkHtml(returnToWorkDetail, returnToWorkFormData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = returnToWorkFormData.saved_document_name || buildReturnToWorkFilename(returnToWorkDetail);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  if (loading) return <div className="loading-state">Loading HR admin tools...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const configuredFolders = employees.filter((employee) => employee.onedrive_folder_url).length;
  const sharedFolders = employees.filter((employee) => employee.onedrive_shared_with_employee).length;
  const leaveDaysPreview = calculateWorkingLeaveDays(
    leaveFormData.start_date,
    leaveFormData.end_date,
    leaveFormData.start_half_day,
    leaveFormData.end_half_day,
    bankHolidays.map((holiday) => holiday.holiday_date)
  );
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    if (leaveFilters.employee_id !== 'all' && request.employee_id.toString() !== leaveFilters.employee_id) {
      return false;
    }
    if (leaveFilters.leave_type !== 'all' && request.leave_type !== leaveFilters.leave_type) {
      return false;
    }
    if (leaveFilters.status !== 'all' && request.status !== leaveFilters.status) {
      return false;
    }
    return true;
  });
  const selectedAbsenceEmployee = absenceAdmin.find((employee) => employee.id === selectedAbsenceEmployeeId) || absenceAdmin[0] || null;
  const totalAbsenceOccurrences = absenceAdmin.reduce((sum, employee) => sum + employee.absences.length, 0);
  const totalAbsenceDays = Number(absenceAdmin.reduce((sum, employee) => sum + employee.absence_summary.total_days, 0).toFixed(2));
  const referenceSearchTerm = referenceSearch.trim().toLowerCase();
  const filteredReferenceGuides = managerReferenceGuides.filter((guide) => {
    if (referenceSectionFilter !== 'all' && guide.section !== referenceSectionFilter) {
      return false;
    }

    if (!referenceSearchTerm) {
      return true;
    }

    const searchIndex = [
      guide.title,
      guide.sectionLabel,
      guide.whenToUse,
      guide.whatThisIs,
      ...guide.tags,
      ...guide.keyLegalPoints,
      ...guide.managerShouldDo,
      ...guide.managerShouldNotDo,
      ...guide.whenToEscalate,
      ...guide.relatedForms,
    ]
      .join(' ')
      .toLowerCase();

    return searchIndex.includes(referenceSearchTerm);
  });
  const selectedReferenceGuide =
    filteredReferenceGuides.find((guide) => guide.id === selectedReferenceId) ||
    filteredReferenceGuides[0] ||
    null;

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
          className={activeTab === 'leave' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('leave')}
        >
          Leave
        </button>
        <button
          className={activeTab === 'blocked-days' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('blocked-days')}
        >
          Blocked Days
        </button>
        <button
          className={activeTab === 'bank-holidays' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('bank-holidays')}
        >
          Bank Holidays
        </button>
        <button
          className={activeTab === 'appraisals' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('appraisals')}
        >
          Appraisals
        </button>
        <button
          className={activeTab === 'absence' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('absence')}
        >
          Absence
        </button>
        <button
          className={activeTab === 'manager-reference' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('manager-reference')}
        >
          Manager Reference
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

      {activeTab === 'leave' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Leave Management</h2>
              <p>Add, amend, and soft delete annual, unpaid, and sick leave for any employee.</p>
            </div>
            <button
              className="btn"
              onClick={() => {
                if (showLeaveForm && !editingLeaveId) {
                  resetLeaveForm();
                  return;
                }
                setLeaveFormData(createEmptyLeaveForm());
                setEditingLeaveId(null);
                setShowLeaveForm(true);
              }}
            >
              {showLeaveForm && !editingLeaveId ? 'Cancel' : 'Add Leave'}
            </button>
          </div>

          {showLeaveForm && (
            <form onSubmit={handleSaveLeave} className="surface-panel stack" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <div className="section-header">
                <div>
                  <h3 style={{ marginBottom: '0.35rem' }}>{editingLeaveId ? 'Edit Leave' : 'Add Leave'}</h3>
                  <p style={{ margin: 0 }}>Create a leave record directly for HR-managed corrections, backfills, and manual updates.</p>
                </div>
              </div>

              <div className="form-grid form-grid--two">
                <div className="form-group">
                  <label>Employee</label>
                  <select
                    required
                    value={leaveFormData.employee_id}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, employee_id: e.target.value })}
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    value={leaveFormData.leave_type}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value as LeaveFormData['leave_type'] })}
                  >
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                    <option value="sick">Sick Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveFormData.start_date}
                    onChange={(e) => setLeaveFormData({
                      ...leaveFormData,
                      start_date: e.target.value,
                      end_date: leaveFormData.end_date || e.target.value,
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Start Day Type</label>
                  <select
                    value={leaveFormData.start_half_day}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, start_half_day: e.target.value as LeaveFormData['start_half_day'] })}
                  >
                    <option value="full">Full Day</option>
                    <option value="am">AM Only</option>
                    <option value="pm">PM Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    required
                    min={leaveFormData.start_date || undefined}
                    value={leaveFormData.end_date}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Day Type</label>
                  <select
                    value={leaveFormData.end_half_day}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, end_half_day: e.target.value as LeaveFormData['end_half_day'] })}
                  >
                    <option value="full">Full Day</option>
                    <option value="am">AM Only</option>
                    <option value="pm">PM Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={leaveFormData.status}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, status: e.target.value as LeaveFormData['status'] })}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {leaveDaysPreview > 0 && (
                <div className="alert alert-info" style={{ maxWidth: '420px' }}>
                  <strong>{leaveDaysPreview}</strong> day{leaveDaysPreview === 1 ? '' : 's'} recorded
                </div>
              )}

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  rows={3}
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Admin / Approval Notes</label>
                <textarea
                  rows={3}
                  value={leaveFormData.manager_notes}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, manager_notes: e.target.value })}
                />
              </div>

              <div className="inline-actions">
                <button type="submit" className="btn btn-success">
                  {editingLeaveId ? 'Save Leave' : 'Create Leave'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetLeaveForm}>Cancel</button>
              </div>
            </form>
          )}

          <div className="surface-panel form-grid form-grid--two" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Filter by Employee</label>
              <select
                value={leaveFilters.employee_id}
                onChange={(e) => setLeaveFilters({ ...leaveFilters, employee_id: e.target.value })}
              >
                <option value="all">All employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Filter by Type</label>
              <select
                value={leaveFilters.leave_type}
                onChange={(e) => setLeaveFilters({ ...leaveFilters, leave_type: e.target.value })}
              >
                <option value="all">All types</option>
                <option value="annual">Annual</option>
                <option value="unpaid">Unpaid</option>
                <option value="sick">Sick</option>
              </select>
            </div>
            <div className="form-group">
              <label>Filter by Status</label>
              <select
                value={leaveFilters.status}
                onChange={(e) => setLeaveFilters({ ...leaveFilters, status: e.target.value })}
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">No leave records match the current filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="stack" style={{ gap: '4px' }}>
                          <strong>{request.full_name}</strong>
                          <span className="muted-text">{request.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stack" style={{ gap: '4px' }}>
                          <span>{request.start_date} to {request.end_date}</span>
                          <span className="muted-text">
                            {request.start_half_day || 'full'} / {request.end_half_day || 'full'}
                          </span>
                        </div>
                      </td>
                      <td>{request.days_requested}</td>
                      <td>{formatLeaveType(request.leave_type)}</td>
                      <td>
                        <span className={`status-badge ${
                          request.status === 'approved'
                            ? 'status-approved'
                            : request.status === 'pending'
                              ? 'status-pending'
                              : 'status-declined'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{request.reason || '-'}</td>
                      <td>{request.manager_notes || '-'}</td>
                      <td>
                        <div className="inline-actions">
                          <button className="btn btn-secondary" onClick={() => handleEditLeave(request)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDeleteLeave(request)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {activeTab === 'bank-holidays' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Bank Holidays</h2>
              <p>
                Manage the holiday calendar used when annual leave is calculated.
                Weekends and these dates are excluded from deducted leave days.
              </p>
            </div>
          </div>

          <button
            className="btn"
            onClick={() => setShowBankHolidayForm(!showBankHolidayForm)}
            style={{ marginBottom: '1rem' }}
          >
            {showBankHolidayForm ? 'Cancel' : 'Add Bank Holiday'}
          </button>

          {showBankHolidayForm && (
            <form onSubmit={handleAddBankHoliday} className="surface-panel form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Holiday Date</label>
                <input
                  type="date"
                  required
                  value={bankHolidayFormData.holiday_date}
                  onChange={(e) => setBankHolidayFormData({ ...bankHolidayFormData, holiday_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Christmas Day"
                  value={bankHolidayFormData.description}
                  onChange={(e) => setBankHolidayFormData({ ...bankHolidayFormData, description: e.target.value })}
                />
              </div>
              <div className="inline-actions">
                <button type="submit" className="btn btn-success">Save Bank Holiday</button>
              </div>
            </form>
          )}

          {bankHolidays.length === 0 ? (
            <div className="empty-state">No bank holidays configured.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bankHolidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td>
                        <strong>{holiday.holiday_date}</strong>
                      </td>
                      <td>{holiday.description}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteBankHoliday(holiday.id, holiday.holiday_date)}
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

      {activeTab === 'manager-reference' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Manager Reference</h2>
              <p>Searchable UK employment law prompts for managers inside the admin workspace.</p>
            </div>
            <div className="inline-actions">
              <span className="status-badge status-neutral">{managerReferenceGuides.length} guides</span>
              <span className="status-badge status-neutral">{filteredReferenceGuides.length} shown</span>
            </div>
          </div>

          <div className="reference-summary-grid">
            <div className="surface-panel stack" style={{ gap: '12px' }}>
              <span className="summary-label">Coverage</span>
              <strong className="summary-value summary-value--primary">{managerReferenceSections.length} sections</strong>
              <p className="muted-text" style={{ margin: 0 }}>
                Built from the internal reference pack structure for managers and HR admins.
              </p>
            </div>
            <div className="surface-panel stack" style={{ gap: '12px' }}>
              <span className="summary-label">Search Tags</span>
              <strong className="summary-value summary-value--success">
                {new Set(managerReferenceGuides.flatMap((guide) => guide.tags)).size}
              </strong>
              <p className="muted-text" style={{ margin: 0 }}>
                Tags cover absence, probation, grievance, disciplinary, flexibility, redundancy, and more.
              </p>
            </div>
            <div className="surface-panel stack" style={{ gap: '12px' }}>
              <span className="summary-label">Priority Gaps</span>
              <strong className="summary-value summary-value--warning">{managerReferencePriorities.length}</strong>
              <p className="muted-text" style={{ margin: 0 }}>
                Quick view of the high-priority policy areas still worth formalising next.
              </p>
            </div>
          </div>

          <div className="reference-search-bar">
            <div className="form-group">
              <label htmlFor="manager-reference-search">Search guides</label>
              <input
                id="manager-reference-search"
                type="search"
                placeholder="Try sickness, probation, flexible working, redundancy..."
                value={referenceSearch}
                onChange={(e) => setReferenceSearch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="manager-reference-section">Filter by section</label>
              <select
                id="manager-reference-section"
                value={referenceSectionFilter}
                onChange={(e) => setReferenceSectionFilter(e.target.value)}
              >
                <option value="all">All sections</option>
                {managerReferenceSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="reference-layout">
            <div className="reference-list stack">
              <div className="surface-panel stack">
                <h3 style={{ marginBottom: '0.35rem' }}>Reference Index</h3>
                <p style={{ margin: 0 }}>
                  Choose a guide to read the manager prompts, escalation cues, and related forms.
                </p>
              </div>

              {filteredReferenceGuides.length === 0 ? (
                <div className="empty-state surface-panel">No guides match that search yet.</div>
              ) : (
                filteredReferenceGuides.map((guide) => (
                  <button
                    key={guide.id}
                    type="button"
                    className={`reference-card${selectedReferenceGuide?.id === guide.id ? ' is-selected' : ''}`}
                    onClick={() => setSelectedReferenceId(guide.id)}
                  >
                    <span className="reference-card__section">{guide.sectionLabel}</span>
                    <strong>{guide.title}</strong>
                    <span className="reference-card__copy">{guide.whenToUse}</span>
                    <div className="reference-tag-row">
                      {guide.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="status-badge status-neutral">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="reference-detail stack">
              {selectedReferenceGuide ? (
                <>
                  <div className="surface-panel stack">
                    <div className="section-header">
                      <div>
                        <span className="reference-card__section">{selectedReferenceGuide.sectionLabel}</span>
                        <h3 style={{ marginBottom: '0.35rem' }}>{selectedReferenceGuide.title}</h3>
                        <p style={{ margin: 0 }}>{selectedReferenceGuide.whatThisIs}</p>
                      </div>
                      <span className="status-badge status-neutral">Last reviewed {selectedReferenceGuide.lastReviewed}</span>
                    </div>
                    <div className="surface-panel stack" style={{ padding: '14px' }}>
                      <span className="summary-label">When to use it</span>
                      <p style={{ margin: 0 }}>{selectedReferenceGuide.whenToUse}</p>
                    </div>
                    <div className="reference-columns">
                      <div className="surface-panel stack" style={{ padding: '16px' }}>
                        <h4 style={{ marginBottom: '0.35rem' }}>Key legal points</h4>
                        <ul className="reference-list-points">
                          {selectedReferenceGuide.keyLegalPoints.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="surface-panel stack" style={{ padding: '16px' }}>
                        <h4 style={{ marginBottom: '0.35rem' }}>What managers should do</h4>
                        <ul className="reference-list-points">
                          {selectedReferenceGuide.managerShouldDo.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="reference-columns">
                      <div className="surface-panel stack" style={{ padding: '16px' }}>
                        <h4 style={{ marginBottom: '0.35rem' }}>What managers should not do</h4>
                        <ul className="reference-list-points">
                          {selectedReferenceGuide.managerShouldNotDo.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="surface-panel stack" style={{ padding: '16px' }}>
                        <h4 style={{ marginBottom: '0.35rem' }}>When to escalate</h4>
                        <ul className="reference-list-points">
                          {selectedReferenceGuide.whenToEscalate.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="surface-panel stack" style={{ padding: '16px' }}>
                      <h4 style={{ marginBottom: '0.35rem' }}>Related forms</h4>
                      <div className="reference-tag-row">
                        {selectedReferenceGuide.relatedForms.map((form) => (
                          <span key={form} className="status-badge status-neutral">
                            {form}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="reference-columns">
                    <div className="surface-panel stack">
                      <h3 style={{ marginBottom: '0.35rem' }}>Section Overview</h3>
                      {managerReferenceSections.map((section) => (
                        <div key={section.id} className="reference-overview-item">
                          <strong>{section.label}</strong>
                          <p>{section.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="surface-panel stack">
                      <h3 style={{ marginBottom: '0.35rem' }}>Priority Policies</h3>
                      {managerReferencePriorities.map((priority) => (
                        <div key={priority.title} className="reference-overview-item">
                          <strong>{priority.title}</strong>
                          <p>{priority.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-panel stack">
                    <h3 style={{ marginBottom: '0.35rem' }}>Suggested Build Order</h3>
                    <div className="reference-phase-grid">
                      {managerReferenceBuildOrder.map((phase) => (
                        <div key={phase.phase} className="surface-panel stack" style={{ padding: '16px' }}>
                          <span className="summary-label">{phase.phase}</span>
                          <ul className="reference-list-points">
                            {phase.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state surface-panel">Choose a guide to see the manager reference details.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'absence' && (
        <section className="card table-card">
          <div className="section-header">
            <div>
              <h2>Absence</h2>
              <p>Track sickness absence from existing sick leave records, review Bradford scores, and complete return to work forms.</p>
            </div>
          </div>

          <div className="inline-actions" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="status-badge status-neutral">Employees with sickness records {absenceAdmin.length}</span>
            <span className="status-badge status-neutral">Occurrences {totalAbsenceOccurrences}</span>
            <span className="status-badge status-neutral">Days {totalAbsenceDays}</span>
          </div>

          {absenceAdmin.length === 0 ? (
            <div className="empty-state">No sickness absence records found yet.</div>
          ) : (
            <div className="stack" style={{ gap: '1.5rem' }}>
              <div className="surface-panel stack">
                <div className="section-header">
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>Employees</h3>
                    <p style={{ margin: 0 }}>Choose an employee to review absence history and complete a return to work form.</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Occurrences</th>
                        <th>Total Days</th>
                        <th>Policy Score</th>
                        <th>Trend Views</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absenceAdmin.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <strong>{employee.full_name}</strong>
                            <br />
                            <small className="muted-text">{employee.email}</small>
                          </td>
                          <td>{employee.absence_summary.total_occurrences}</td>
                          <td>{employee.absence_summary.total_days}</td>
                          <td>
                            <span className="status-badge status-pending">
                              {employee.absence_summary.last_52_weeks.bradford_score}
                            </span>
                          </td>
                          <td>
                            <div className="stack" style={{ gap: '4px' }}>
                              <small className="muted-text">3m {employee.absence_summary.last_3_months.bradford_score}</small>
                              <small className="muted-text">6m {employee.absence_summary.last_6_months.bradford_score}</small>
                              <small className="muted-text">9m {employee.absence_summary.last_9_months.bradford_score}</small>
                            </div>
                          </td>
                          <td>
                            <button
                              className={selectedAbsenceEmployee?.id === employee.id ? 'btn' : 'btn btn-secondary'}
                              onClick={() => {
                                setSelectedAbsenceEmployeeId(employee.id);
                                setSelectedAbsenceId(null);
                                setReturnToWorkDetail(null);
                                setReturnToWorkFormData(createEmptyReturnToWorkForm());
                              }}
                            >
                              {selectedAbsenceEmployee?.id === employee.id ? 'Selected' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedAbsenceEmployee && (
                <>
                  <div className="surface-panel stack">
                    <div className="section-header">
                      <div>
                        <h3 style={{ marginBottom: '0.35rem' }}>{selectedAbsenceEmployee.full_name}</h3>
                        <p style={{ margin: 0 }}>
                          Policy Bradford score is based on the rolling 52-week view. Shorter windows are shown for trend spotting only.
                        </p>
                      </div>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={!selectedAbsenceEmployee.onedrive_folder_url}
                          onClick={() => window.open(selectedAbsenceEmployee.onedrive_folder_url, '_blank', 'noopener,noreferrer')}
                        >
                          Open HR Folder
                        </button>
                      </div>
                    </div>

                    <div className="form-grid form-grid--two">
                      {(['last_3_months', 'last_6_months', 'last_9_months', 'last_52_weeks'] as const).map((key) => {
                        const metric = selectedAbsenceEmployee.absence_summary[key];
                        return (
                          <div key={key} className="surface-panel stack" style={{ padding: '14px' }}>
                            <h4 style={{ marginBottom: '0.35rem' }}>{formatBradfordWindowLabel(key)}</h4>
                            <div className="inline-actions">
                              <span className="status-badge status-neutral">Occurrences {metric.occurrences}</span>
                              <span className="status-badge status-neutral">Days {metric.total_days}</span>
                              <span className={key === 'last_52_weeks' ? 'status-badge status-pending' : 'status-badge status-neutral'}>
                                Score {metric.bradford_score}
                              </span>
                            </div>
                            <small className="muted-text">{metric.range_start} to {metric.range_end}</small>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="surface-panel stack">
                    <div className="section-header">
                      <div>
                        <h3 style={{ marginBottom: '0.35rem' }}>Sickness Episodes</h3>
                        <p style={{ margin: 0 }}>Every row below is pulled from the existing sick leave records in the app.</p>
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Dates</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>RTW</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAbsenceEmployee.absences.map((absence) => (
                            <tr key={absence.id}>
                              <td>
                                <strong>{absence.start_date}</strong> to <strong>{absence.end_date}</strong>
                              </td>
                              <td>{absence.days_requested}</td>
                              <td>
                                <span className={`status-badge ${
                                  absence.status === 'approved'
                                    ? 'status-approved'
                                    : absence.status === 'pending'
                                      ? 'status-pending'
                                      : 'status-neutral'
                                }`}>
                                  {absence.status}
                                </span>
                              </td>
                              <td>{absence.reason || '-'}</td>
                              <td>
                                {absence.rtw_form_id ? (
                                  <div className="stack" style={{ gap: '4px' }}>
                                    <span className="status-badge status-approved">Saved</span>
                                    <small className="muted-text">
                                      {absence.form_completed_date || 'Form saved'}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="status-badge status-neutral">Not started</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className={selectedAbsenceId === absence.id ? 'btn' : 'btn btn-secondary'}
                                  onClick={() => handleOpenReturnToWork(absence)}
                                >
                                  {absence.rtw_form_id ? 'Open RTW' : 'Start RTW'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {returnToWorkDetail && (
                    <form onSubmit={handleSaveReturnToWork} className="surface-panel stack">
                      <div className="section-header">
                        <div>
                          <h3 style={{ marginBottom: '0.35rem' }}>Return to Work Form</h3>
                          <p style={{ margin: 0 }}>Simple app-style version of the RTW form with Bradford scores added automatically.</p>
                        </div>
                        <div className="inline-actions">
                          <button type="button" className="btn btn-secondary" onClick={handleDownloadReturnToWork}>
                            Download RTW
                          </button>
                        </div>
                      </div>

                      <div className="inline-actions" style={{ flexWrap: 'wrap' }}>
                        <span className="status-badge status-neutral">Employee {returnToWorkDetail.employee_name}</span>
                        <span className="status-badge status-neutral">Absence Days {returnToWorkDetail.absence.days_requested}</span>
                        <span className="status-badge status-pending">Policy Bradford {returnToWorkDetail.metrics.last_52_weeks.bradford_score}</span>
                      </div>

                      <div className="form-grid form-grid--two">
                        <div className="form-group">
                          <label>Manager Name</label>
                          <input
                            type="text"
                            value={returnToWorkFormData.manager_name}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, manager_name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Return to Work Date</label>
                          <input
                            type="date"
                            value={returnToWorkFormData.return_to_work_date}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, return_to_work_date: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Form Completed Date</label>
                          <input
                            type="date"
                            value={returnToWorkFormData.form_completed_date}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, form_completed_date: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Suggested File Name</label>
                          <input
                            type="text"
                            value={returnToWorkFormData.saved_document_name}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, saved_document_name: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Manager Comments</label>
                          <textarea
                            rows={4}
                            value={returnToWorkFormData.manager_comments}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, manager_comments: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Employee Comments</label>
                          <textarea
                            rows={4}
                            value={returnToWorkFormData.employee_comments}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, employee_comments: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Discussion Summary and Support Actions</label>
                          <textarea
                            rows={4}
                            value={returnToWorkFormData.support_actions}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, support_actions: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Wellbeing Notes</label>
                          <textarea
                            rows={3}
                            value={returnToWorkFormData.wellbeing_notes}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, wellbeing_notes: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Manager Signature</label>
                          <input
                            type="text"
                            value={returnToWorkFormData.manager_signature}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, manager_signature: e.target.value })}
                            placeholder="Type full name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Manager Signed Date</label>
                          <input
                            type="date"
                            value={returnToWorkFormData.manager_signed_at}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, manager_signed_at: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Employee Signature</label>
                          <input
                            type="text"
                            value={returnToWorkFormData.employee_signature}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, employee_signature: e.target.value })}
                            placeholder="Type full name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Employee Signed Date</label>
                          <input
                            type="date"
                            value={returnToWorkFormData.employee_signed_at}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, employee_signed_at: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Saved Document URL (Optional)</label>
                          <input
                            type="url"
                            placeholder="Paste the Wellbeing folder file link after uploading"
                            value={returnToWorkFormData.saved_document_url}
                            onChange={(e) => setReturnToWorkFormData({ ...returnToWorkFormData, saved_document_url: e.target.value })}
                          />
                          <small className="form-help">
                            The app generates the RTW file for download. If you upload it into the employee&apos;s Wellbeing folder, you can paste that saved file link here.
                          </small>
                        </div>
                      </div>

                      <div className="surface-panel stack" style={{ padding: '14px' }}>
                        <h4 style={{ marginBottom: '0.35rem' }}>Bradford Score Snapshot</h4>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Window</th>
                                <th>Occurrences</th>
                                <th>Days</th>
                                <th>Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(['last_3_months', 'last_6_months', 'last_9_months', 'last_52_weeks'] as const).map((key) => {
                                const metric = returnToWorkDetail.metrics[key];
                                return (
                                  <tr key={key}>
                                    <td>{formatBradfordWindowLabel(key)}</td>
                                    <td>{metric.occurrences}</td>
                                    <td>{metric.total_days}</td>
                                    <td>{metric.bradford_score}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="inline-actions">
                        <button type="submit" className="btn btn-success">Save RTW Form</button>
                        <button type="button" className="btn btn-secondary" onClick={handleDownloadReturnToWork}>
                          Download HTML Copy
                        </button>
                        {returnToWorkDetail.onedrive_folder_url && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => window.open(returnToWorkDetail.onedrive_folder_url, '_blank', 'noopener,noreferrer')}
                          >
                            Open Employee Folder
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
