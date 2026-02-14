import { useState, useEffect } from 'react';
import { FormInput } from '../ui/FormInput';
import { userService } from '../../services';

export const PanelForm = ({ panel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: panel?.name || '',
    members: panel?.members?.map((m) => m._id) || [],
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      const allUsers = response.data.users || response.data;
      // Only show active users
      setUsers(allUsers.filter((u) => u.status === 'active'));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Panel name is required';
    }

    if (formData.members.length === 0) {
      newErrors.members = 'At least one member is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      };
    });

    // Clear members error when user selects/deselects
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.members;
      return newErrors;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Panel Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="e.g., Primary Care Panel"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Members <span className="text-red-500">*</span>
        </label>
        
        {loadingUsers ? (
          <div className="text-sm text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-slate-500">No active users available</div>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-4 space-y-2">
            {users.map((user) => (
              <label
                key={user._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.members.includes(user._id)}
                  onChange={() => handleMemberToggle(user._id)}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">
                    {user.role} • {user.institution?.name}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-primary-100 text-primary-700 text-xs font-medium">
                  {user.role}
                </span>
              </label>
            ))}
          </div>
        )}
        
        {errors.members && <p className="text-sm text-red-600 mt-1">{errors.members}</p>}
        
        {formData.members.length > 0 && (
          <p className="text-sm text-slate-600 mt-2">
            {formData.members.length} member{formData.members.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loadingUsers}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : panel ? 'Update Panel' : 'Create Panel'}
        </button>
      </div>
    </form>
  );
};
