import React from 'react';

const ThemeButton = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "md",
  className = "",
  disabled = false,
  icon: Icon = null
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-lg 
    transition-all duration-300 transform hover:scale-105 disabled:opacity-50 
    disabled:cursor-not-allowed disabled:hover:scale-100
  `;

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    secondary: "border-2 border-blue-500 hover:bg-blue-500 text-white",
    ghost: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    github: "bg-gray-800 hover:bg-gray-900 text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="mr-2" size={18} />}
      {children}
    </button>
  );
};

export default ThemeButton;