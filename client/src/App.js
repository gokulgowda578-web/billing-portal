import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import PlansPage       from './pages/PlansPage';
import BillingPage     from './pages/BillingPage';
import ProfilePage     from './pages/ProfilePage';
import AdminDashboard  from './pages/AdminDashboard';
import AdminPlansPage  from './pages/AdminPlansPage';
import AdminUsersPage  from './pages/AdminUsersPage';
import FinancePage     from './pages/FinancePage';

// Layout
import Layout from './components/Layout';

// ──────────────────────────────────────────────
// Route Guards
// ──────────────────────────────────────────────

// Redirect unauthenticated users to /login
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Only admin can access
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Admin or Finance can access
const FinanceRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!['admin', 'finance'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private – wrapped in shared Layout (navbar + sidebar) */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="plans"     element={<PlansPage />} />
            <Route path="billing"   element={<BillingPage />} />
            <Route path="profile"   element={<ProfilePage />} />

            {/* Admin-only */}
            <Route path="admin"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="admin/plans"      element={<AdminRoute><AdminPlansPage /></AdminRoute>} />
            <Route path="admin/users"      element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

            {/* Finance (also accessible to admin) */}
            <Route path="finance" element={<FinanceRoute><FinancePage /></FinanceRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
