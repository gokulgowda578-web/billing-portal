import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/api';
import Alert from '../components/Alert';

const ProfilePage = () => {
  const { user, login } = useAuth();

  const [form, setForm]       = useState({ name: user?.name || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setMessage({ type: 'error', text: 'Name cannot be empty' });
    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      const { data } = await updateMe(payload);
      // Update the stored user with new name
      login({ ...user, name: data.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const roleBadge = {
    admin:   'bg-purple-100 text-purple-800',
    finance: 'bg-green-100 text-green-800',
    user:    'bg-blue-100 text-blue-800',
  }[user?.role] || '';

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* User info card */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${roleBadge}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Details</h2>

        {message.text && (
          <div className="mb-4">
            <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 font-normal">(cannot be changed)</span>
            </label>
            <input
              type="email"
              value={user?.email}
              readOnly
              className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
