import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MyDashboard from './pages/MyDashboard';
import RequestLeave from './pages/RequestLeave';
import MyFiles from './pages/MyFiles';
import ManagerApprovals from './pages/ManagerApprovals';
import HrAdmin from './pages/HrAdmin';
import AdminLeaveCalendar from './pages/AdminLeaveCalendar';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('dev_email');
    setCurrentUser(email);
  }, []);

  function handleLogout() {
    localStorage.removeItem('dev_email');
    setCurrentUser(null);
    window.location.reload();
  }

  function handleLogin() {
    const email = prompt('Enter your email to login:');
    if (email) {
      localStorage.setItem('dev_email', email);
      setCurrentUser(email);
      window.location.reload();
    }
  }

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <h1>HR Dashboard</h1>
          <ul>
            <li><Link to="/">My Dashboard</Link></li>
            <li><Link to="/request-leave">Request Leave</Link></li>
            <li><Link to="/my-files">My Files</Link></li>
            <li><Link to="/manager">Manager Approvals</Link></li>
            <li><Link to="/admin">HR Admin</Link></li>
            <li><Link to="/leave-calendar">Leave Calendar</Link></li>
          </ul>
          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #333' }}>
            {currentUser ? (
              <>
                <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>
                  Logged in as:
                </p>
                <p style={{ fontSize: '0.9rem', color: '#93c5fd', marginBottom: '1rem', wordBreak: 'break-all' }}>
                  {currentUser}
                </p>
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#4a1a1a',
                    border: '1px solid #dc2626',
                    color: '#fca5a5',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e3a5f',
                  border: '1px solid #3b82f6',
                  color: '#93c5fd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}
          </div>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<MyDashboard />} />
            <Route path="/request-leave" element={<RequestLeave />} />
            <Route path="/my-files" element={<MyFiles />} />
            <Route path="/manager" element={<ManagerApprovals />} />
            <Route path="/admin" element={<HrAdmin />} />
            <Route path="/leave-calendar" element={<AdminLeaveCalendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;