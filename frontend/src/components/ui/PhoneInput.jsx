import React from "react";

const COUNTRY_CODES = [
  { label: "India", code: "+91", iso: "IN" },
  { label: "United States", code: "+1", iso: "US" },
  { label: "United Kingdom", code: "+44", iso: "GB" },
  { label: "Canada", code: "+1", iso: "CA" },
  { label: "Australia", code: "+61", iso: "AU" },
  { label: "Germany", code: "+49", iso: "DE" },
  { label: "France", code: "+33", iso: "FR" },
  { label: "Japan", code: "+81", iso: "JP" },
  { label: "Brazil", code: "+55", iso: "BR" },
  { label: "Mexico", code: "+52", iso: "MX" },
];

export const PhoneInput = ({
  label,
  name,
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  error,
  required = false,
  placeholder = "1234567890",
  disabled = false,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={`flex items-center gap-0 border rounded-xl overflow-hidden transition-all bg-white ${
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/20"
            : "border-slate-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/20"
        } ${disabled ? "bg-slate-50 cursor-not-allowed" : ""}`}
      >
        <div className="w-28 border-r border-slate-100 h-[42px] flex items-center justify-center bg-slate-50/50">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-transparent border-none text-sm font-semibold h-full px-3 focus:ring-0 outline-none cursor-pointer disabled:cursor-not-allowed"
          >
            {COUNTRY_CODES.map((country) => (
              <option key={`${country.iso}-${country.code}`} value={country.code}>
                {country.iso} {country.code}
              </option>
            ))}
          </select>
        </div>
        <input
          id={name}
          name={name}
          type="tel"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 h-[42px] text-sm bg-transparent text-slate-900 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
