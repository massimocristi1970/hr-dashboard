import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="app-shell">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="mobile-menu-button"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <span className="sidebar-eyebrow">People Operations</span>
            <h1 className="sidebar-title">HR Dashboard</h1>
            <p className="sidebar-copy">
              Leave management, employee records, and file tracking in the same
              visual language as the training portal.
            </p>
          </div>

          <div className="sidebar-panel sidebar-user">
            <span className="sidebar-user-label">Session</span>
            {currentUser ? (
              <>
                <strong>{currentUser}</strong>
                <span>Signed in to the staff workspace</span>
              </>
            ) : (
              <>
                <strong>Guest access</strong>
                <span>Use your work email to continue</span>
              </>
            )}
          </div>

          <div className="sidebar-panel">
            <span className="sidebar-user-label">Navigation</span>
            <div className="sidebar-nav" style={{ marginTop: '12px' }}>
              <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                My Dashboard
              </NavLink>
              <NavLink to="/request-leave" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                Request Leave
              </NavLink>
              <NavLink to="/my-files" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                My Files
              </NavLink>
              <NavLink to="/manager" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                Manager Approvals
              </NavLink>
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                HR Admin
              </NavLink>
              <NavLink to="/leave-calendar" onClick={() => setMenuOpen(false)} className={({ isActive }) => `btn btn-secondary${isActive ? ' active' : ''}`}>
                Leave Calendar
              </NavLink>
            </div>
          </div>

          <div className="sidebar-panel">
            <span className="sidebar-user-label">Focus</span>
            <p className="sidebar-copy" style={{ marginTop: '10px' }}>
              More blue-led surfaces, correct SF Pro and Inter typography, and
              cleaner staff workflows across every page.
            </p>
          </div>

          <div className="sidebar-footer">
            {currentUser ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ width: '100%' }}>
                Logout
              </button>
            ) : (
              <button onClick={() => { handleLogin(); setMenuOpen(false); }} style={{ width: '100%' }}>
                Login
              </button>
            )}
          </div>
        </nav>
        {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
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
