import React from 'react';

const ThemeBackground = ({ children, className = "", variant = "default" }) => {
  const baseClasses = "min-h-screen text-white overflow-hidden";
  
  const variants = {
    default: "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900",
    login: "bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900",
    dashboard: "bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    profile: "bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/5 rounded-full animate-ping"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          ></div>
        ))}
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ThemeBackground;