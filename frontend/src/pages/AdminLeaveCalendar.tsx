import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaveRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
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

// Get all dates in a range (inclusive)
function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentWeek.push(new Date(year, month, day));
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill remaining cells in the last week
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const leaveMap = buildLeaveMap();
  const calendarWeeks = getCalendarDays();
  const today = new Date().toISOString().split('T')[0];

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

  return (
    <div>
      <h1 className="page-title">Leave Calendar</h1>
      
      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '0.5rem' }}>Filter by Employee:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ padding: '0.5rem', minWidth: '200px' }}
            >
              <option value="all">All Employees</option>
              {employeesWithLeave.map(emp => (
                <option key={emp.email} value={emp.email}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={previousMonth}>&lt; Prev</button>
            <button className="btn btn-primary" onClick={goToToday}>Today</button>
            <button className="btn" onClick={nextMonth}>Next &gt;</button>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        {/* Day Names Header */}
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarWeeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="calendar-cell empty" />;
              }
              
              const dateStr = day.toISOString().split('T')[0];
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
      </div>

      {/* Legend */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Legend</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          {employeesWithLeave.map(emp => (
            <div key={emp.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '4px', 
                  backgroundColor: getEmployeeColor(emp.employee_id) 
                }} 
              />
              <span>{emp.full_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="summary-card">
            <h4 style={{ margin: 0, color: '#aaa' }}>Total Approved Leave</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
              {leaveRequests.length} requests
            </p>
          </div>
          <div className="summary-card">
            <h4 style={{ margin: 0, color: '#aaa' }}>Employees with Leave</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
              {employeesWithLeave.length} employees
            </p>
          </div>
          <div className="summary-card">
            <h4 style={{ margin: 0, color: '#aaa' }}>Total Days This Month</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
              {Array.from(leaveMap.keys()).filter(date => {
                const d = new Date(date);
                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
              }).reduce((sum, date) => sum + (leaveMap.get(date)?.length || 0), 0)} person-days
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Leave List */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Approved Leave Details</h3>
        {leaveRequests.length === 0 ? (
          <p style={{ color: '#aaa' }}>No approved leave requests.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '3px', 
                            backgroundColor: getEmployeeColor(req.employee_id),
                            flexShrink: 0
                          }} 
                        />
                        {req.full_name}
                      </div>
                    </td>
                    <td>{req.start_date}</td>
                    <td>{req.end_date}</td>
                    <td>{req.days_requested}</td>
                    <td>{req.reason || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
