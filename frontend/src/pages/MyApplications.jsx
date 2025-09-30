import React, { useState, useEffect } from 'react';
import { getUserApplications, deleteUserApplication } from '../services/applicationService';
import Navbar from '../components/Navbar.jsx';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import ThemeButton from '../components/ThemeButton.jsx';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteLoading, setDeleteLoading] = useState(null);

    const statusOptions = [
        { value: '', label: 'All Applications' },
        { value: 'viewed', label: 'Viewed Only' },
        { value: 'applied', label: 'Applied' },
        { value: 'bookmarked', label: 'Bookmarked' }
    ];

    const statusColors = {
        viewed: 'bg-blue-100 text-blue-800',
        applied: 'bg-green-100 text-green-800',
        bookmarked: 'bg-yellow-100 text-yellow-800'
    };

    const fetchApplications = async (status = '', page = 1) => {
        try {
            setLoading(true);
            const response = await getUserApplications(status, page, 6);
            
            if (response.success) {
                setApplications(response.data.applications);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
            } else {
                setError(response.message || 'Failed to fetch applications');
            }
        } catch (err) {
            setError('Failed to fetch applications');
            console.error('Fetch applications error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(selectedStatus, currentPage);
    }, [selectedStatus, currentPage]);

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handleDeleteApplication = async (applicationId) => {
        if (!confirm('Are you sure you want to delete this application record?')) {
            return;
        }

        try {
            setDeleteLoading(applicationId);
            const response = await deleteUserApplication(applicationId);
            
            if (response.success) {
                setApplications(prev => prev.filter(app => app._id !== applicationId));
                
                // Trigger dashboard refresh
                window.dispatchEvent(new CustomEvent('applicationChange'));
            } else {
                setError(response.message || 'Failed to delete application');
            }
        } catch (err) {
            setError('Failed to delete application');
            console.error('Delete application error:', err);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleApplyNow = (application) => {
        // Directly open the apply link in a new tab
        if (application.internship.applyLink) {
            window.open(application.internship.applyLink, '_blank', 'noopener,noreferrer');
        } else {
            setError('Apply link not available for this internship');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading && applications.length === 0) {
        return (
            <ThemeBackground variant="applications">
                <div className="min-h-screen p-6">
                    <div className="max-w-6xl mx-auto">
                        <ThemeCard className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
                            <p className="text-gray-700">Loading your applications...</p>
                        </ThemeCard>
                    </div>
                </div>
            </ThemeBackground>
        );
    }

    return (
        <ThemeBackground variant="applications">
            <div className="min-h-screen p-4 sm:p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
                        <p className="text-gray-700 text-sm sm:text-base">Track your internship applications and interactions</p>
                    </div>

                    {/* Filters */}
                    <ThemeCard className="p-4 sm:p-6 mb-6 animate-slide-in-left" animationDelay="200ms">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-full sm:min-w-64">
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Filter by Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-gray-400/60 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </ThemeCard>

                {/* Error Message */}
                {error && (
                    <ThemeCard className="border border-red-400/30 bg-red-500/10 p-4 mb-6 animate-slide-in-right" animationDelay="300ms">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-red-300">Error</h3>
                                <p className="text-sm text-red-200 mt-1">{error}</p>
                            </div>
                        </div>
                    </ThemeCard>
                )}

                {/* Applications Grid */}
                {applications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {applications.map((application, index) => (
                            <ThemeCard 
                                key={application._id} 
                                className="hover:scale-105 transition-all duration-300 animate-scale-in" 
                                animationDelay={`${400 + index * 100}ms`}
                            >
                                <div className="p-4 sm:p-6">
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status]} backdrop-blur-sm`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteApplication(application._id)}
                                            disabled={deleteLoading === application._id}
                                            className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                            title="Delete application record"
                                        >
                                            {deleteLoading === application._id ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-white rounded-full"></div>
                                            ) : (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5l-.5.5-1.5-1.5V5H5v10a2 2 0 002 2h6a2 2 0 002-2V9.5l1.5 1.5.5-.5V15a3 3 0 01-3 3H7a3 3 0 01-3-3V5z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Internship Details */}
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {application.internship.title}
                                    </h3>
                                    
                                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {application.internship.company}
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {application.internship.location}
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {application.internship.duration}
                                        </div>
                                        
                                        {application.internship.stipend > 0 && (
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                </svg>
                                                {formatCurrency(application.internship.stipend)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamps */}
                                    <div className="border-t border-gray-300/40 pt-4 space-y-1">
                                        <p className="text-xs text-gray-600">
                                            Viewed: {formatDate(application.viewedAt)}
                                        </p>
                                        {application.status === 'applied' && application.appliedAt && (
                                            <p className="text-xs text-gray-600">
                                                Applied: {formatDate(application.appliedAt)}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600">
                                            Source: {application.applicationSource}
                                        </p>
                                    </div>

                                    {/* Apply Link */}
                                    {application.internship.applyLink && application.status !== 'applied' && (
                                        <div className="mt-4 pt-4 border-t border-gray-300/40">
                                            <ThemeButton
                                                onClick={() => handleApplyNow(application)}
                                                className="block w-full text-center py-2 px-4 text-sm font-medium"
                                                variant="primary"
                                            >
                                                🚀 Apply Now
                                            </ThemeButton>
                                        </div>
                                    )}
                                </div>
                            </ThemeCard>
                        ))}
                    </div>
                ) : (
                    <ThemeCard className="p-12 text-center animate-fade-in">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                        <p className="text-gray-700 mb-6">
                            {selectedStatus 
                                ? `No ${selectedStatus} applications found.`
                                : "You haven't interacted with any internships yet."
                            }
                        </p>
                        <ThemeButton
                            onClick={() => window.location.href = '/dashboard'}
                            variant="primary"
                            className="px-6 py-2"
                        >
                            Browse Internships
                        </ThemeButton>
                    </ThemeCard>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
                        <ThemeButton
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="secondary"
                            className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
                        >
                            ← Previous
                        </ThemeButton>
                        
                        <span className="px-6 py-3 text-sm font-semibold text-gray-900 bg-white/90 backdrop-blur-sm border-2 border-blue-300 rounded-lg shadow-md order-first sm:order-none">
                            Page {currentPage} of {totalPages}
                        </span>
                        
                        <ThemeButton
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="secondary"
                            className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
                        >
                            Next →
                        </ThemeButton>
                    </div>
                )}
            </div>
            </div>
        </ThemeBackground>
    );
};

export default MyApplications;