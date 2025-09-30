import React, { useState, useEffect } from 'react';
import { getRecentInteractions } from '../services/applicationService';

const RecentApplications = ({ limit = 5, refreshTrigger = 0 }) => {
    const [recentInteractions, setRecentInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const statusColors = {
        viewed: 'bg-blue-100 text-blue-800',
        applied: 'bg-green-100 text-green-800',
        bookmarked: 'bg-yellow-100 text-yellow-800'
    };

    const statusIcons = {
        viewed: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
        ),
        applied: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        ),
        bookmarked: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
        )
    };

    useEffect(() => {
        fetchRecentInteractions();
    }, [limit, refreshTrigger]);

    const fetchRecentInteractions = async () => {
        try {
            setLoading(true);
            const response = await getRecentInteractions(limit);
            
            if (response.success) {
                setRecentInteractions(response.data.interactions);
            } else {
                setError(response.message || 'Failed to fetch recent interactions');
            }
        } catch (err) {
            setError('Failed to fetch recent interactions');
            console.error('Fetch recent interactions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-center py-8">
                    <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                {recentInteractions.length > 0 && (
                    <button 
                        onClick={() => window.location.href = '/applications'}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all
                    </button>
                )}
            </div>

            {recentInteractions.length > 0 ? (
                <div className="space-y-4">
                    {recentInteractions.map((interaction) => (
                        <div key={interaction._id} className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                            {/* Status Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${statusColors[interaction.status]}`}>
                                {statusIcons[interaction.status]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {interaction.status === 'viewed' && 'Viewed'}
                                        {interaction.status === 'applied' && 'Applied to'}
                                        {interaction.status === 'bookmarked' && 'Bookmarked'}
                                    </p>
                                    <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                        {formatDate(interaction.updatedAt)}
                                    </p>
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate">
                                    {interaction.internship.title}
                                </p>
                                
                                <p className="text-xs text-gray-500 truncate">
                                    {interaction.internship.company} • {interaction.internship.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h4>
                    <p className="text-sm text-gray-500">
                        Start exploring internships to see your activity here
                    </p>
                </div>
            )}
        </div>
    );
};

export default RecentApplications;