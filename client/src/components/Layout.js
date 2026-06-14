import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sidebar nav items per role
const navItems = [
  { to: '/dashboard', label: 'Dashboard',    roles: ['user', 'admin', 'finance'], icon: '🏠' },
  { to: '/plans',     label: 'Plans',        roles: ['user', 'admin', 'finance'], icon: '📦' },
  { to: '/billing',   label: 'My Billing',   roles: ['user'],                     icon: '🧾' },
  { to: '/profile',   label: 'Profile',      roles: ['user', 'admin', 'finance'], icon: '👤' },
  // Admin section
  { to: '/admin',       label: 'Admin Dashboard', roles: ['admin'],  icon: '⚙️' },
  { to: '/admin/plans', label: 'Manage Plans',     roles: ['admin'],  icon: '📋' },
  { to: '/admin/users', label: 'Manage Users',     roles: ['admin'],  icon: '👥' },
  // Finance section
  { to: '/finance', label: 'Finance',  roles: ['admin', 'finance'], icon: '💰' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter nav items by user's role
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  const roleBadgeColor = {
    admin:   'bg-purple-100 text-purple-800',
    finance: 'bg-green-100 text-green-800',
    user:    'bg-blue-100 text-blue-800',
  }[user?.role] || 'bg-gray-100 text-gray-800';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600">💳 BillingPortal</h1>
        <p className="text-xs text-gray-500 mt-1">SaaS Management</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'} // avoid matching /admin/plans as active for /admin
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-white z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            className="md:hidden p-1 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h2 className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
