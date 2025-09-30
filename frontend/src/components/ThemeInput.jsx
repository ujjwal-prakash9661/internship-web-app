import React from 'react';

const ThemeInput = ({ 
  label, 
  type = "text", 
  placeholder = "", 
  value, 
  onChange, 
  required = false,
  className = "",
  id,
  error = null
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-white text-sm font-medium mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 
          rounded-lg text-white placeholder-white/60
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
          transition duration-300 hover:bg-white/20
          ${error ? 'border-red-400 focus:ring-red-400' : ''}
        `}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <p className="text-red-300 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ThemeInput;