import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySubscription, getMyInvoices } from '../services/api';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';

const DashboardPage = () => {
  const { user, isAdmin, isFinance } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    // Admin/Finance roles don't have personal subscriptions - skip personal data load
    if (isAdmin) { setLoading(false); return; }
    if (isFinance) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const [subRes, invRes] = await Promise.all([
          getMySubscription(),
          getMyInvoices(),
        ]);
        setSubscription(subRes.data);
        setInvoices(invRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isFinance]);

  if (loading) return <Spinner />;

  // ── Admin dashboard redirect hint ──
  if (isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {user.name} 👋</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/admin"       className="card hover:shadow-md transition text-center group">
            <div className="text-3xl mb-2">⚙️</div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Admin Dashboard</p>
            <p className="text-xs text-gray-400 mt-1">Analytics & overview</p>
          </Link>
          <Link to="/admin/plans" className="card hover:shadow-md transition text-center group">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Plans</p>
            <p className="text-xs text-gray-400 mt-1">Create, edit, delete plans</p>
          </Link>
          <Link to="/admin/users" className="card hover:shadow-md transition text-center group">
            <div className="text-3xl mb-2">👥</div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Users</p>
            <p className="text-xs text-gray-400 mt-1">View & change roles</p>
          </Link>
        </div>
      </div>
    );
  }

  // ── Finance dashboard redirect hint ──
  if (isFinance) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {user.name} 👋</h1>
        <Link to="/finance" className="card hover:shadow-md transition inline-flex items-center gap-3 group">
          <span className="text-3xl">💰</span>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Finance Dashboard</p>
            <p className="text-xs text-gray-400">Revenue analytics & invoices</p>
          </div>
        </Link>
      </div>
    );
  }

  // ── Regular User dashboard ──
  const totalSpent = invoices.reduce((s, inv) => s + (inv.status === 'paid' ? inv.amount : 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user.name} 👋</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon="📦"
          label="Current Plan"
          value={subscription?.planId?.name || 'None'}
          sub={subscription ? `Status: ${subscription.status}` : 'No active subscription'}
          color="blue"
        />
        <StatCard
          icon="🧾"
          label="Total Invoices"
          value={invoices.length}
          sub="Billing history"
          color="purple"
        />
        <StatCard
          icon="💵"
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          sub="All paid invoices"
          color="green"
        />
      </div>

      {/* Active subscription card */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Subscription</h2>
        {subscription ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-blue-600">{subscription.planId.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Billing: <span className="capitalize">{subscription.billingCycle}</span> ·
                Renews: {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/billing" className="btn-secondary text-sm">View Invoices</Link>
              <Link to="/plans"   className="btn-primary  text-sm">Change Plan</Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You don't have an active subscription.</p>
            <Link to="/plans" className="btn-primary">Browse Plans</Link>
          </div>
        )}
      </div>

      {/* Recent invoices */}
      {invoices.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link to="/billing" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {invoices.slice(0, 3).map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.planName} Plan</p>
                  <p className="text-xs text-gray-400">{new Date(inv.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${inv.amount.toFixed(2)}</p>
                  <span className={`badge-${inv.status}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
