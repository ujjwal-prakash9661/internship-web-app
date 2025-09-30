import React from 'react';
import { FaUser, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const ProfileCompletion = ({ percentage, user }) => {
    const getCompletionColor = (percentage) => {
        if (percentage >= 80) return 'green';
        if (percentage >= 50) return 'yellow';
        return 'red';
    };

    const getCompletionMessage = (percentage) => {
        if (percentage >= 80) return 'Your profile is looking great!';
        if (percentage >= 50) return 'Good progress! Add a few more details.';
        return 'Complete your profile to get better recommendations.';
    };

    const color = getCompletionColor(percentage);
    const colorClasses = {
        green: 'text-green-600 bg-green-100',
        yellow: 'text-yellow-600 bg-yellow-100',
        red: 'text-red-600 bg-red-100'
    };

    const progressColorClasses = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                <div className={`p-2 rounded-full ${colorClasses[color]}`}>
                    {percentage >= 80 ? <FaCheck /> : <FaExclamationTriangle />}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{percentage}% Complete</span>
                    <span className="text-sm text-gray-500">{getCompletionMessage(percentage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${progressColorClasses[color]}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">✓ Basic Info</span>
                    <span className={user.name && user.email ? 'text-green-600' : 'text-gray-400'}>
                        {user.name && user.email ? 'Complete' : 'Incomplete'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">✓ Skills</span>
                    <span className={user.skills?.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                        {user.skills?.length > 0 ? `${user.skills.length} added` : 'Add skills'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">✓ GitHub Connection</span>
                    <span className={user.provider === 'github' ? 'text-green-600' : 'text-gray-400'}>
                        {user.provider === 'github' ? 'Connected' : 'Not connected'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletion;