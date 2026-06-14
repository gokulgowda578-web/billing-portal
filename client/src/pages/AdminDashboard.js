import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllSubscriptions, getRevenueAnalytics } from '../services/api';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const [users,         setUsers]         = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, sRes, aRes] = await Promise.all([
          getAllUsers(),
          getAllSubscriptions(),
          getRevenueAnalytics(),
        ]);
        setUsers(uRes.data);
        setSubscriptions(sRes.data);
        setAnalytics(aRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner />;

  const activeCount    = subscriptions.filter((s) => s.status === 'active').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users"          value={users.length}           color="blue"   />
        <StatCard icon="📦" label="Active Subscriptions" value={activeCount}            color="green"  />
        <StatCard icon="🚫" label="Cancelled"            value={cancelledCount}         color="red"    />
        <StatCard icon="💵" label="Total Revenue"
          value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
          sub={`${analytics?.totalInvoices || 0} paid invoices`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by plan */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h2>
          {analytics?.revenueByPlan && Object.keys(analytics.revenueByPlan).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.revenueByPlan).map(([plan, revenue]) => {
                const pct = analytics.totalRevenue
                  ? Math.round((revenue / analytics.totalRevenue) * 100)
                  : 0;
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{plan}</span>
                      <span className="text-gray-500">${revenue.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No revenue data yet.</p>
          )}
        </div>

        {/* Recent subscriptions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <p className="text-gray-400 text-sm">No subscriptions yet.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.slice(0, 6).map((sub) => (
                <div key={sub._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{sub.userId?.name}</p>
                    <p className="text-xs text-gray-400">{sub.planId?.name} · {sub.billingCycle}</p>
                  </div>
                  <span className={`badge-${sub.status}`}>{sub.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User role breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h2>
          {['admin', 'user', 'finance'].map((role) => {
            const count = users.filter((u) => u.role === role).length;
            const colors = { admin: 'bg-purple-500', user: 'bg-blue-500', finance: 'bg-green-500' };
            return (
              <div key={role} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors[role]}`} />
                  <span className="text-sm font-medium capitalize text-gray-700">{role}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Revenue by month */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h2>
          {analytics?.revenueByMonth && Object.keys(analytics.revenueByMonth).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.revenueByMonth)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, revenue]) => (
                  <div key={month} className="flex justify-between text-sm">
                    <span className="text-gray-600">{month}</span>
                    <span className="font-semibold text-gray-900">${revenue.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No monthly data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
