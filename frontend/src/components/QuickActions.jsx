import React from 'react';
import { FaUser, FaGithub, FaSearch, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QuickActions = ({ actions }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const getIcon = (action) => {
        switch (action) {
            case 'profile': return FaUser;
            case 'github': return FaGithub;
            case 'recommendations': return FaSearch;
            default: return FaArrowRight;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50';
            case 'medium': return 'border-blue-200 bg-blue-50';
            case 'low': return 'border-gray-200 bg-gray-50';
            case 'completed': return 'border-green-200 bg-green-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const handleAction = (action) => {
        switch (action) {
            case 'profile':
                // For now, we can show an alert or navigate to a profile page
                navigate('/profile')
                break;
            case 'github':
                if (user?.provider !== 'github') {
                    window.location.href = 'https://internship-web-app-42i2.onrender.com/api/auth/github';
                } else {
                    alert('GitHub already connected!');
                }
                break;
            case 'recommendations':
                navigate('/recommended');
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
                {actions.map((item, index) => {
                    const Icon = getIcon(item.action);
                    return (
                        <div 
                            key={index}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getPriorityColor(item.priority)}`}
                            onClick={() => handleAction(item.action)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Icon className={`h-5 w-5 ${
                                        item.priority === 'completed' ? 'text-green-600' :
                                        item.priority === 'high' ? 'text-red-600' :
                                        item.priority === 'medium' ? 'text-blue-600' :
                                        'text-gray-600'
                                    }`} />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                                <FaArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;