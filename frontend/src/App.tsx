import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MyDashboard from './pages/MyDashboard';
import RequestLeave from './pages/RequestLeave';
import MyFiles from './pages/MyFiles';
import ManagerApprovals from './pages/ManagerApprovals';
import HrAdmin from './pages/HrAdmin';
import AdminLeaveCalendar from './pages/AdminLeaveCalendar';
import './App.css';

function App() {
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