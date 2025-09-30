import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', onClick, actionHint }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <div className={`p-6 rounded-lg border ${colorClasses[color]} bg-white shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    {actionHint && onClick && <p className="text-xs text-blue-500 mt-1 font-medium">{actionHint}</p>}
                </div>
                {Icon && (
                    <div 
                        className={`p-3 rounded-full ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}`}
                        onClick={onClick}
                        title={actionHint}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;