import React from 'react';

export const AgeRangeSlider = ({ minAge, maxAge, onChange }) => {
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxAge - 1);
    onChange({ minAge: value, maxAge });
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minAge + 1);
    onChange({ minAge, maxAge: value });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
          Min: {minAge} Yrs
        </span>
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
          Max: {maxAge} Yrs
        </span>
      </div>
      
      <div className="relative h-2 w-full bg-slate-200 rounded-full mt-4">
        {/* Track highlight */}
        <div 
          className="absolute h-full bg-primary-500 rounded-full transition-all duration-150"
          style={{ 
            left: `${(minAge / 100) * 100}%`, 
            right: `${100 - (maxAge / 100) * 100}%` 
          }}
        />
        
        {/* Min Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={minAge}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:shadow-md"
        />
        
        {/* Max Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={maxAge}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Min Age</label>
          <input 
            type="number" 
            min="0" 
            max={maxAge - 1} 
            value={minAge} 
            onChange={handleMinChange}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Max Age</label>
          <input 
            type="number" 
            min={minAge + 1} 
            max="100" 
            value={maxAge} 
            onChange={handleMaxChange}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
