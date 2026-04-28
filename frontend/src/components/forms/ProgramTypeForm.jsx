import { useState, useEffect } from 'react';

export const ProgramTypeForm = ({ programType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (programType) {
      setFormData({
        name: programType.name || '',
        description: programType.description || '',
        isActive: programType.isActive !== undefined ? programType.isActive : true,
      });
    }
  }, [programType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
            <span>Program Type Name *</span>
            <span className={`text-[10px] font-bold ${formData.name.length >= 20 ? 'text-amber-600' : 'text-slate-400'}`}>
              {formData.name.length}/20
            </span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter program type name"
            maxLength={20}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows="3"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            Is Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2"
        >
          {programType ? 'Update Type' : 'Create Type'}
        </button>
      </div>
    </form>
  );
};
