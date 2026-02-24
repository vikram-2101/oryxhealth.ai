import { useState, useEffect } from 'react';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { institutionService } from '../../services';

const ROLE_OPTIONS = [
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Health Worker', label: 'Health Worker' },
  { value: 'Coordinator', label: 'Coordinator' },
];

export const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || '',
    institution: user?.institution?._id || '',
    registrationNumber: user?.registrationNumber || '',
    password: '',
  });

  const [institutions, setInstitutions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await institutionService.getAll();
      setInstitutions(response.data.institutions || response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.institution) {
      newErrors.institution = 'Institution is required';
    }

    // Doctor-specific validation
    if (formData.role === 'Doctor' && !formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required for doctors';
    }

    // Password validation
    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]).{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 chars, including letters, numbers, and special characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Remove registrationNumber if not a doctor
      const submitData = { ...formData };
      if (formData.role !== 'Doctor') {
        delete submitData.registrationNumber;
      }
      await onSubmit(submitData);
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

    // Clear registration number if role changes from Doctor
    if (name === 'role' && value !== 'Doctor') {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: '',
      }));
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const institutionOptions = institutions
    .filter((i) => i.status === 'active')
    .map((i) => ({
      value: i._id,
      label: i.name,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Dr. Alan Hughes"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="e.g., alan@hospital.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
          placeholder="e.g., +1 555-1001"
        />

        <FormInput
          label={user ? "New Password (leave blank to keep current)" : "Password"}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required={!user}
          placeholder="Min. 8 chars, 1 letter, 1 number, 1 special char"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          error={errors.role}
          required
        />
      </div>

      <FormInput
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        required
        placeholder="e.g., 123 Main St, City, State"
      />

      <FormSelect
        label="Institution"
        name="institution"
        value={formData.institution}
        onChange={handleChange}
        options={institutionOptions}
        error={errors.institution}
        required
        placeholder={loadingInstitutions ? 'Loading institutions...' : 'Select an institution'}
        disabled={loadingInstitutions}
      />

      {/* Conditional Doctor Fields */}
      {formData.role === 'Doctor' && (
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Doctor Information</h3>
          
          <FormInput
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            error={errors.registrationNumber}
            required
            placeholder="e.g., MD-2024-001"
          />
        </div>
      )}

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
          disabled={isSubmitting || loadingInstitutions}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>
  );
};
