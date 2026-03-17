import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  formatLocalDate,
  getCalendarDaysForMonth,
  getDatesInRange,
  parseLocalDateString,
} from '../lib/leaveCalendarDates';

interface LeaveRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: 'annual' | 'unpaid' | 'sick';
  reason: string;
  status: string;
  full_name: string;
  email: string;
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
}

// Generate a consistent color for each employee based on their id
function getEmployeeColor(employeeId: number): string {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ];
  return colors[employeeId % colors.length];
}

export default function AdminLeaveCalendar() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, employeesData] = await Promise.all([
        api.getAllRequests(),
        api.getAllEmployees()
      ]);
      
      // Filter to only approved leave
      const approvedRequests = requestsData.filter(
        (req: LeaveRequest) => req.status === 'approved'
      );
      
      setLeaveRequests(approvedRequests);
      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Build a map of date -> employees on leave
  function buildLeaveMap(): Map<string, LeaveRequest[]> {
    const leaveMap = new Map<string, LeaveRequest[]>();
    
    const filteredRequests = selectedEmployee === 'all' 
      ? leaveRequests 
      : leaveRequests.filter(req => req.email === selectedEmployee);
    
    filteredRequests.forEach(request => {
      const dates = getDatesInRange(request.start_date, request.end_date);
      dates.forEach(date => {
        if (!leaveMap.has(date)) {
          leaveMap.set(date, []);
        }
        leaveMap.get(date)!.push(request);
      });
    });
    
    return leaveMap;
  }

  // Get calendar data for the current month
  function getCalendarDays(): (Date | null)[][] {
    return getCalendarDaysForMonth(currentDate);
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return <div className="loading-state">Loading leave calendar...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const leaveMap = buildLeaveMap();
  const calendarWeeks = getCalendarDays();
  const today = formatLocalDate(new Date());

  // Get unique employees who have approved leave
  const employeesWithLeave = Array.from(
    new Set(leaveRequests.map(req => req.email))
  ).map(email => {
    const emp = employees.find(e => e.email === email);
    const req = leaveRequests.find(r => r.email === email);
    return {
      email,
      full_name: emp?.full_name || req?.full_name || email,
      employee_id: req?.employee_id || 0
    };
  });

  function formatLeaveType(type: LeaveRequest['leave_type']) {
    if (type === 'annual') return 'Annual Leave';
    if (type === 'unpaid') return 'Unpaid Leave';
    return 'Sick Leave';
  }

  return (
    <div className="page-frame">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">Shared Leave Visibility</p>
            <h1>Leave Calendar</h1>
            <p>
              Review approved leave across the team with cleaner monthly views,
              employee filtering, and summary metrics.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Approved Requests</span>
              <span className="metric-value">{leaveRequests.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Employees</span>
              <span className="metric-value">{employeesWithLeave.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="calendar-toolbar">
          <div className="form-group" style={{ minWidth: '240px', marginBottom: 0 }}>
            <label>Filter by Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">All Employees</option>
              {employeesWithLeave.map(emp => (
                <option key={emp.email} value={emp.email}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="inline-actions" style={{ marginLeft: 'auto' }}>
            <button className="btn btn-secondary" onClick={previousMonth}>&lt; Prev</button>
            <button className="btn" onClick={goToToday}>Today</button>
            <button className="btn btn-secondary" onClick={nextMonth}>Next &gt;</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
          {calendarWeeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="calendar-cell empty" />;
              }
              
              const dateStr = formatLocalDate(day);
              const leaveOnDay = leaveMap.get(dateStr) || [];
              const isToday = dateStr === today;
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <div 
                  key={dateStr} 
                  className={`calendar-cell ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''} ${leaveOnDay.length > 0 ? 'has-leave' : ''}`}
                >
                  <div className="calendar-date">{day.getDate()}</div>
                  <div className="calendar-events">
                    {leaveOnDay.map((leave) => (
                      <div 
                        key={`${leave.id}-${dateStr}`}
                        className="calendar-event"
                        style={{ backgroundColor: getEmployeeColor(leave.employee_id) }}
                        title={`${leave.full_name}: ${leave.start_date} to ${leave.end_date}`}
                      >
                        {leave.full_name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Legend</h3>
        <div className="legend-grid" style={{ marginTop: '0.5rem' }}>
          {employeesWithLeave.map(emp => (
            <div key={emp.email} className="legend-item">
              <div className="legend-swatch" style={{ backgroundColor: getEmployeeColor(emp.employee_id) }} />
              <span>{emp.full_name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Summary</h3>
        <div className="summary-grid" style={{ marginTop: '0.5rem' }}>
          <div className="summary-card">
            <span className="summary-label">Total Approved Leave</span>
            <p className="summary-value summary-value--primary" style={{ margin: '0.5rem 0 0' }}>
              {leaveRequests.length} requests
            </p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Employees with Leave</span>
            <p className="summary-value summary-value--primary" style={{ margin: '0.5rem 0 0' }}>
              {employeesWithLeave.length} employees
            </p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Days This Month</span>
            <p className="summary-value summary-value--primary" style={{ margin: '0.5rem 0 0' }}>
              {Array.from(leaveMap.keys()).filter(date => {
                const d = parseLocalDateString(date);
                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
              }).reduce((sum, date) => sum + (leaveMap.get(date)?.length || 0), 0)} person-days
            </p>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <h3>Approved Leave Details</h3>
        {leaveRequests.length === 0 ? (
          <div className="empty-state">No approved leave requests.</div>
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
                </tr>
              </thead>
              <tbody>
                {leaveRequests
                  .filter(req => selectedEmployee === 'all' || req.email === selectedEmployee)
                  .sort((a, b) => a.start_date.localeCompare(b.start_date))
                  .map(req => (
                    <tr key={req.id}>
                      <td>
                        <div className="legend-item">
                          <div className="legend-swatch" style={{ width: '12px', height: '12px', backgroundColor: getEmployeeColor(req.employee_id) }} />
                          {req.full_name}
                        </div>
                      </td>
                      <td>{req.start_date}</td>
                      <td>{req.end_date}</td>
                      <td>{req.days_requested}</td>
                      <td><span className="status-badge status-neutral">{formatLeaveType(req.leave_type)}</span></td>
                      <td>{req.reason || '-'}</td>
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
