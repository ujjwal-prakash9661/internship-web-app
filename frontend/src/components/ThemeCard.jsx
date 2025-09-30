import React from 'react';

const ThemeCard = ({ children, className = "", animation = true }) => {
  return (
    <div 
      className={`
        bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 
        hover:bg-white/20 transition-all duration-300 
        ${animation ? 'transform hover:scale-105' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ThemeCard;