import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AgeRangeSlider } from '../ui/AgeRangeSlider';

export const ProtocolForm = ({ protocol, categoryId, onSubmit, onCancel, basicOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: categoryId || '',
    isActive: true,
    sex: '',
    minAge: 0,
    maxAge: 100,
    formStructure: [
      {
        stepKey: 'step_1',
        stepLabel: 'Step 1',
        order: 1,
        fields: []
      }
    ]
  });

  useEffect(() => {
    if (protocol) {
      setFormData({
        name: protocol.name || '',
        categoryId: protocol.categoryId || categoryId || '',
        isActive: protocol.isActive !== undefined ? protocol.isActive : true,
        sex: protocol.sex || '',
        minAge: protocol.minAge !== undefined ? protocol.minAge : 0,
        maxAge: protocol.maxAge !== undefined ? protocol.maxAge : 100,
        formStructure: protocol.formStructure && protocol.formStructure.length > 0 
          ? protocol.formStructure 
          : [{ stepKey: 'step_1', stepLabel: 'Step 1', order: 1, fields: [] }]
      });
    }
  }, [protocol, categoryId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddStep = () => {
    const nextOrder = formData.formStructure.length + 1;
    setFormData((prev) => ({
      ...prev,
      formStructure: [
        ...prev.formStructure,
        {
          stepKey: `step_${nextOrder}`,
          stepLabel: `Step ${nextOrder}`,
          order: nextOrder,
          fields: []
        }
      ]
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      formStructure: prev.formStructure.filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, field, value) => {
    const newStructure = [...formData.formStructure];
    newStructure[index] = { ...newStructure[index], [field]: value };
    setFormData((prev) => ({ ...prev, formStructure: newStructure }));
  };

  const handleAddField = (stepIndex) => {
    const newStructure = [...formData.formStructure];
    const nextFieldNum = newStructure[stepIndex].fields.length + 1;
    newStructure[stepIndex].fields.push({
      fieldKey: `field_${nextFieldNum}`,
      label: `Field ${nextFieldNum}`,
      type: 'text',
      required: false,
      options: []
    });
    setFormData((prev) => ({ ...prev, formStructure: newStructure }));
  };

  const handleRemoveField = (stepIndex, fieldIndex) => {
    const newStructure = [...formData.formStructure];
    newStructure[stepIndex].fields = newStructure[stepIndex].fields.filter((_, i) => i !== fieldIndex);
    setFormData((prev) => ({ ...prev, formStructure: newStructure }));
  };

  const handleFieldChange = (stepIndex, fieldIndex, field, value) => {
    const newStructure = [...formData.formStructure];
    newStructure[stepIndex].fields[fieldIndex] = { ...newStructure[stepIndex].fields[fieldIndex], [field]: value };
    setFormData((prev) => ({ ...prev, formStructure: newStructure }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Protocol Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter protocol name"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sex
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Age Range (Years)
            </label>
            <AgeRangeSlider 
              minAge={formData.minAge} 
              maxAge={formData.maxAge} 
              onChange={(range) => setFormData(prev => ({ ...prev, ...range }))}
            />
          </div>
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

        {!basicOnly && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Form Structure</h3>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>

            <div className="space-y-6">
              {formData.formStructure.map((step, sIndex) => (
                <div key={sIndex} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(sIndex)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                        Step Label
                      </label>
                      <input
                        type="text"
                        value={step.stepLabel}
                        onChange={(e) => handleStepChange(sIndex, 'stepLabel', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                        Step Key
                      </label>
                      <input
                        type="text"
                        value={step.stepKey}
                        onChange={(e) => handleStepChange(sIndex, 'stepKey', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fields</span>
                      <button
                        type="button"
                        onClick={() => handleAddField(sIndex)}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Field
                      </button>
                    </div>

                    {step.fields.map((field, fIndex) => (
                      <div key={fIndex} className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Label"
                            value={field.label}
                            onChange={(e) => handleFieldChange(sIndex, fIndex, 'label', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-transparent hover:border-slate-200 focus:border-primary-500 rounded"
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(sIndex, fIndex, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="radio">Radio</option>
                            <option value="datetime-local">DateTime</option>
                            <option value="hearing_test_table">Hearing Test Table</option>
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Key"
                            value={field.fieldKey}
                            onChange={(e) => handleFieldChange(sIndex, fIndex, 'fieldKey', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-transparent hover:border-slate-200 focus:border-primary-500 rounded"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(sIndex, fIndex, 'required', e.target.checked)}
                            className="w-4 h-4 text-primary-600"
                            title="Required"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveField(sIndex, fIndex)}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          {protocol ? 'Update Protocol' : 'Create Protocol'}
        </button>
      </div>
    </form>
  );
};
