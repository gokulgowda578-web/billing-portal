import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const ROLES = ['user', 'finance', 'admin'];

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(''); // id of user being updated

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    // Prevent admin from demoting themselves
    if (userId === currentUser._id && newRole !== 'admin') {
      return setMessage({ type: 'error', text: "You cannot demote your own admin account." });
    }
    setUpdating(userId);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
      setMessage({ type: 'success', text: `${data.name}'s role updated to "${data.role}".` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setUpdating('');
    }
  };

  if (loading) return <Spinner />;

  const roleBadge = {
    admin:   'bg-purple-100 text-purple-800',
    finance: 'bg-green-100 text-green-800',
    user:    'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

      {message.text && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
        </div>
      )}

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-3 text-gray-500 font-medium">Name</th>
              <th className="pb-3 text-gray-500 font-medium">Email</th>
              <th className="pb-3 text-gray-500 font-medium">Current Role</th>
              <th className="pb-3 text-gray-500 font-medium">Change Role</th>
              <th className="pb-3 text-gray-500 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                      {u.name}
                      {u._id === currentUser._id && (
                        <span className="ml-1 text-xs text-gray-400">(you)</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-gray-500">{u.email}</td>
                <td className="py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  <select
                    value={u.role}
                    disabled={updating === u._id}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {updating === u._id && <span className="ml-2 text-xs text-gray-400">Saving…</span>}
                </td>
                <td className="py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
