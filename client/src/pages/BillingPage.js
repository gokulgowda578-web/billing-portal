import React, { useEffect, useState } from 'react';
import { getMyInvoices, getMySubscription, cancelSubscription, downloadInvoicePdf } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const BillingPage = () => {
  const [invoices, setInvoices]         = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [dlLoading, setDlLoading]       = useState('');
  const [message, setMessage]           = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, subRes] = await Promise.all([
          getMyInvoices(),
          getMySubscription(),
        ]);
        setInvoices(invRes.data);
        setSubscription(subRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    setCancelLoading(true);
    try {
      await cancelSubscription();
      setSubscription(null);
      setMessage({ type: 'success', text: 'Subscription cancelled successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cancel failed.' });
    } finally {
      setCancelLoading(false);
    }
  };

  // Download invoice PDF and trigger browser download
  const handleDownload = async (invoiceId) => {
    setDlLoading(invoiceId);
    try {
      const { data } = await downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not download invoice.' });
    } finally {
      setDlLoading('');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing & Invoices</h1>

      {message.text && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
        </div>
      )}

      {/* Active subscription */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
        {subscription ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p>
                <span className="text-sm text-gray-500">Plan: </span>
                <span className="font-semibold">{subscription.planId?.name}</span>
              </p>
              <p>
                <span className="text-sm text-gray-500">Billing: </span>
                <span className="capitalize text-sm">{subscription.billingCycle}</span>
              </p>
              <p>
                <span className="text-sm text-gray-500">Start: </span>
                <span className="text-sm">{new Date(subscription.startDate).toLocaleDateString()}</span>
              </p>
              <p>
                <span className="text-sm text-gray-500">Renews: </span>
                <span className="text-sm">{new Date(subscription.endDate).toLocaleDateString()}</span>
              </p>
              <p>
                <span className="text-sm text-gray-500">Status: </span>
                <span className="badge-active">{subscription.status}</span>
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn-danger self-start"
            >
              {cancelLoading ? 'Cancelling…' : 'Cancel Subscription'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500">No active subscription.</p>
        )}
      </div>

      {/* Invoice history */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h2>
        {invoices.length === 0 ? (
          <p className="text-gray-400 text-sm">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 text-gray-500 font-medium">Invoice ID</th>
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
                    <td className="py-3 font-mono text-xs text-gray-400">#{inv._id.slice(-6)}</td>
                    <td className="py-3 font-medium text-gray-900">{inv.planName}</td>
                    <td className="py-3 capitalize text-gray-600">{inv.billingCycle}</td>
                    <td className="py-3 font-semibold text-gray-900">${inv.amount.toFixed(2)}</td>
                    <td className="py-3 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`badge-${inv.status}`}>{inv.status}</span>
                    </td>
                    <td className="py-3">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
