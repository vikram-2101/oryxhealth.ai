import { useState, useEffect } from 'react';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { customerService } from '../../services';

const EMOJI_OPTIONS = ['🏥', '🩺', '💊', '🔬', '🧬', '🌡️', '💉', '🏗️', '🌊', '🌅', '⚕️', '🫀'];

export const InstitutionForm = ({ institution, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: institution?.name || '',
    customer: institution?.customer?._id || '',
    contactPerson: {
      name: institution?.contactPerson?.name || '',
      email: institution?.contactPerson?.email || '',
      phone: institution?.contactPerson?.phone || '',
    },
    logo: institution?.logo || '🏥',
  });

  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data.customers || response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institution name is required';
    }

    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }

    if (!formData.contactPerson.name.trim()) {
      newErrors.contactPersonName = 'Contact person name is required';
    }

    if (!formData.contactPerson.email.trim()) {
      newErrors.contactPersonEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPerson.email)) {
      newErrors.contactPersonEmail = 'Invalid email format';
    }

    if (!formData.contactPerson.phone.trim()) {
      newErrors.contactPersonPhone = 'Phone is required';
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
    
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name.replace('.', '')];
      return newErrors;
    });
  };

  const customerOptions = customers
    .filter((c) => c.status === 'active')
    .map((c) => ({
      value: c._id,
      label: c.name,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSelect
        label="Customer"
        name="customer"
        value={formData.customer}
        onChange={handleChange}
        options={customerOptions}
        error={errors.customer}
        required
        placeholder={loadingCustomers ? 'Loading customers...' : 'Select a customer'}
        disabled={loadingCustomers}
      />

      <FormInput
        label="Institution Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="e.g., City General Hospital"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Logo Emoji
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, logo: emoji }))}
              className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                formData.logo === emoji
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Person</h3>
        
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            name="contactPerson.name"
            value={formData.contactPerson.name}
            onChange={handleChange}
            error={errors.contactPersonName}
            required
            placeholder="e.g., Dr. Emily Ross"
          />

          <FormInput
            label="Email"
            name="contactPerson.email"
            type="email"
            value={formData.contactPerson.email}
            onChange={handleChange}
            error={errors.contactPersonEmail}
            required
            placeholder="e.g., emily@citygeneral.com"
          />

          <FormInput
            label="Phone"
            name="contactPerson.phone"
            type="tel"
            value={formData.contactPerson.phone}
            onChange={handleChange}
            error={errors.contactPersonPhone}
            required
            placeholder="e.g., +1 555-0201"
          />
        </div>
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
          disabled={isSubmitting || loadingCustomers}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : institution ? 'Update Institution' : 'Add Institution'}
        </button>
      </div>
    </form>
  );
};
