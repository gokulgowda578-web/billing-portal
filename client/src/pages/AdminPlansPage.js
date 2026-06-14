import React, { useEffect, useState } from 'react';
import { getAllPlansAdmin, createPlan, updatePlan, deletePlan } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

// Empty plan form state
const emptyForm = {
  name: '', priceMonthly: '', priceYearly: '', features: '', isActive: true,
};

const AdminPlansPage = () => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(emptyForm);
  const [editId,  setEditId]  = useState(null); // null = create mode
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await getAllPlansAdmin();
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
  };

  // Populate form for editing an existing plan
  const startEdit = (plan) => {
    setEditId(plan._id);
    setForm({
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceYearly:  plan.priceYearly,
      features:     plan.features.join(', '),
      isActive:     plan.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setMessage({ type: 'error', text: 'Plan name is required' });

    setSaving(true);
    setMessage({ type: '', text: '' });

    // Convert features from comma-separated string to array
    const payload = {
      name:         form.name.trim(),
      priceMonthly: parseFloat(form.priceMonthly) || 0,
      priceYearly:  parseFloat(form.priceYearly)  || 0,
      features:     form.features.split(',').map((f) => f.trim()).filter(Boolean),
      isActive:     form.isActive,
    };

    try {
      if (editId) {
        await updatePlan(editId, payload);
        setMessage({ type: 'success', text: 'Plan updated successfully.' });
      } else {
        await createPlan(payload);
        setMessage({ type: 'success', text: 'Plan created successfully.' });
      }
      cancelEdit();
      await fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      setMessage({ type: 'success', text: `Plan "${name}" deleted.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Plans</h1>

      {message.text && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
        </div>
      )}

      {/* Create / Edit form */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editId ? '✏️ Edit Plan' : '➕ New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Pro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
            <input name="priceMonthly" type="number" min="0" step="0.01" value={form.priceMonthly} onChange={handleChange} className="input-field" placeholder="29.99" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
            <input name="priceYearly" type="number" min="0" step="0.01" value={form.priceYearly} onChange={handleChange} className="input-field" placeholder="299.99" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
            <input name="features" value={form.features} onChange={handleChange} className="input-field" placeholder="Feature 1, Feature 2, Feature 3" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible to users)</label>
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editId ? 'Update Plan' : 'Create Plan'}
            </button>
            {editId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Plans table */}
      <div className="card overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Plans</h2>
        {plans.length === 0 ? (
          <p className="text-gray-400 text-sm">No plans yet. Create one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 text-gray-500 font-medium">Name</th>
                <th className="pb-3 text-gray-500 font-medium">Monthly</th>
                <th className="pb-3 text-gray-500 font-medium">Yearly</th>
                <th className="pb-3 text-gray-500 font-medium">Features</th>
                <th className="pb-3 text-gray-500 font-medium">Status</th>
                <th className="pb-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-semibold text-gray-900">{plan.name}</td>
                  <td className="py-3 text-gray-600">${plan.priceMonthly}</td>
                  <td className="py-3 text-gray-600">${plan.priceYearly}</td>
                  <td className="py-3 text-gray-500 max-w-xs truncate">{plan.features.join(', ')}</td>
                  <td className="py-3">
                    <span className={plan.isActive ? 'badge-active' : 'badge-cancelled'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => startEdit(plan)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(plan._id, plan.name)} className="text-red-600 hover:underline text-xs">Delete</button>
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

export default AdminPlansPage;
