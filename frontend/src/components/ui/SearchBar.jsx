import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
    </div>
  );
};
