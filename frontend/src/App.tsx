import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* Public — full screen, no sidebar */}
      <Route path="/login/*" element={<Login />} />

      {/* Authenticated — sidebar layout wraps all these routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/tasks"     element={<Tasks />} />
      </Route>
    </Routes>
  );
}

export default App;
