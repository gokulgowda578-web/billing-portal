import React, { useEffect, useState } from 'react';
import { getAllInvoices, getRevenueAnalytics, downloadInvoicePdf } from '../services/api';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const FinancePage = () => {
  const [invoices,  setInvoices]  = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [dlLoading, setDlLoading] = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, anaRes] = await Promise.all([
          getAllInvoices(),
          getRevenueAnalytics(),
        ]);
        setInvoices(invRes.data);
        setAnalytics(anaRes.data);
      } catch (err) {
        setError('Failed to load finance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (invoiceId) => {
    setDlLoading(invoiceId);
    try {
      const { data } = await downloadInvoicePdf(invoiceId);
      const url  = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Could not download invoice PDF.');
    } finally {
      setDlLoading('');
    }
  };

  if (loading) return <Spinner />;

  const paidInvoices    = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finance Dashboard</h1>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="💵"
          label="Total Revenue"
          value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
          sub="All paid invoices"
          color="green"
        />
        <StatCard
          icon="🧾"
          label="Total Invoices"
          value={invoices.length}
          color="blue"
        />
        <StatCard
          icon="✅"
          label="Paid"
          value={paidInvoices.length}
          color="green"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={pendingInvoices.length}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by plan */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h2>
          {analytics?.revenueByPlan && Object.keys(analytics.revenueByPlan).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.revenueByPlan).map(([plan, revenue]) => {
                const pct = analytics.totalRevenue
                  ? Math.round((revenue / analytics.totalRevenue) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{plan}</span>
                      <span className="text-gray-500">${revenue.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet.</p>
          )}
        </div>

        {/* Monthly revenue */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          {analytics?.revenueByMonth && Object.keys(analytics.revenueByMonth).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.revenueByMonth)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 8)
                .map(([month, revenue]) => (
                  <div key={month} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="text-sm font-semibold text-gray-900">${revenue.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet.</p>
          )}
        </div>
      </div>

      {/* All invoices table */}
      <div className="card overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-gray-400 text-sm">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 text-gray-500 font-medium">ID</th>
                <th className="pb-3 text-gray-500 font-medium">Customer</th>
                <th className="pb-3 text-gray-500 font-medium">Plan</th>
                <th className="pb-3 text-gray-500 font-medium">Cycle</th>
                <th className="pb-3 text-gray-500 font-medium">Amount</th>
                <th className="pb-3 text-gray-500 font-medium">Date</th>
                <th className="pb-3 text-gray-500 font-medium">Status</th>
                <th className="pb-3 text-gray-500 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 font-mono text-xs text-gray-400">#{inv._id.slice(-6)}</td>
                  <td className="py-2">
                    <p className="font-medium text-gray-900">{inv.userId?.name}</p>
                    <p className="text-xs text-gray-400">{inv.userId?.email}</p>
                  </td>
                  <td className="py-2 font-medium text-gray-900">{inv.planName}</td>
                  <td className="py-2 capitalize text-gray-600">{inv.billingCycle}</td>
                  <td className="py-2 font-semibold text-gray-900">${inv.amount.toFixed(2)}</td>
                  <td className="py-2 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`badge-${inv.status}`}>{inv.status}</span>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDownload(inv._id)}
                      disabled={dlLoading === inv._id}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {dlLoading === inv._id ? '…' : '⬇ PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
