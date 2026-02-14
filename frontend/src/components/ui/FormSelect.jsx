export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Select...',
  disabled = false,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
        } focus:outline-none focus:ring-4 disabled:bg-slate-100 disabled:cursor-not-allowed`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
