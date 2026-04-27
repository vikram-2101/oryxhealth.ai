import { useState, useEffect } from 'react';
import { customerService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export const AppointmentTypeForm = ({ type, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: type?.name || '',
    accountId: type?.accountId?._id || type?.accountId || (user?.role === 'account' ? user.accountId : ''),
    status: type?.status || 'active',
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data.customers || response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {user?.role === 'super_admin' && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Account (Customer)</label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            required
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Select Account</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Type Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Consult, Screening"
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          {type ? 'Update Type' : 'Add Type'}
        </button>
      </div>
    </form>
  );
};
