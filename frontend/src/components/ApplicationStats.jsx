import React, { useState, useEffect } from 'react';
import { getUserApplications } from '../services/applicationService';

const ApplicationStats = ({ refreshTrigger = 0 }) => {
    const [stats, setStats] = useState({
        total: 0,
        viewed: 0,
        applied: 0,
        bookmarked: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplicationStats();
    }, [refreshTrigger]);

    const fetchApplicationStats = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            
            // Fetch all statuses to get complete stats
            const [totalResponse, viewedResponse, appliedResponse, bookmarkedResponse] = await Promise.all([
                getUserApplications('', 1, 1000), // Get all for total count
                getUserApplications('viewed', 1, 1000),
                getUserApplications('applied', 1, 1000),
                getUserApplications('bookmarked', 1, 1000)
            ]);

            // Debug logging
            console.log('Total Response:', totalResponse);
            console.log('Viewed Response:', viewedResponse);
            console.log('Applied Response:', appliedResponse);
            console.log('Bookmarked Response:', bookmarkedResponse);

            // Extract total count with multiple fallback strategies
            const extractTotal = (response) => {
                return response?.data?.data?.total || 
                       response?.data?.total || 
                       response?.total || 
                       0;
            };

            setStats({
                total: extractTotal(totalResponse),
                viewed: extractTotal(viewedResponse),
                applied: extractTotal(appliedResponse),
                bookmarked: extractTotal(bookmarkedResponse)
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch application stats';
            setError(errorMessage);
            console.error('Fetch application stats error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            // Set default stats on error to prevent crashes
            setStats({
                total: 0,
                viewed: 0,
                applied: 0,
                bookmarked: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        {
            label: 'Total Interactions',
            value: stats?.total || 0,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
            ),
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Applied',
            value: stats?.applied || 0,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ),
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            label: 'Bookmarked',
            value: stats?.bookmarked || 0,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
            ),
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        {
            label: 'Viewed Only',
            value: Math.max(0, (stats?.viewed || 0) - (stats?.applied || 0) - (stats?.bookmarked || 0)),
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
            ),
            bgColor: 'bg-gray-50',
            iconColor: 'text-gray-600'
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error loading stats</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            <div className={stat.iconColor}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {(stat.value || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                            {stat.label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationStats;