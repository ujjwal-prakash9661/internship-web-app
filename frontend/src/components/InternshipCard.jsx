import React, { useState, useEffect } from 'react';
import { recordInteraction, getApplicationStatus } from '../services/applicationService';

function InternshipCard({ internship, variant = 'dashboard' }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        // Load application status and record view
        loadApplicationStatus();
        recordView();
    }, [internship._id]);

    const loadApplicationStatus = async () => {
        try {
            const status = await getApplicationStatus(internship._id);
            if (status?.data) {
                const { status: appStatus } = status.data;
                setIsBookmarked(appStatus === 'bookmarked');
                setIsApplied(appStatus === 'applied');
            }
        } catch (error) {
            // Application not found is normal for new internships
            console.log('No existing application found, starting fresh');
        }
    };

    const recordView = async () => {
        try {
            const source = mapVariantToSource(variant);
            await recordInteraction(internship._id, 'viewed', source);
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    const mapVariantToSource = (variant) => {
        const mapping = {
            'recommended': 'recommendations',
            'dashboard': 'dashboard',
            'search': 'search'
        };
        return mapping[variant] || 'dashboard';
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        setActionLoading('bookmark');
        
        try {
            const newStatus = isBookmarked ? 'viewed' : 'bookmarked';
            const source = mapVariantToSource(variant);
            await recordInteraction(internship._id, newStatus, source);
            setIsBookmarked(!isBookmarked);
            
            // Trigger dashboard refresh
            window.dispatchEvent(new CustomEvent('applicationChange'));
        } catch (error) {
            console.error('Error bookmarking:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleApply = async (e) => {
        e.stopPropagation();
        setActionLoading('apply');
        
        try {
            const source = mapVariantToSource(variant);
            await recordInteraction(internship._id, 'applied', source);
            setIsApplied(true);
            
            // Trigger dashboard refresh
            window.dispatchEvent(new CustomEvent('applicationChange'));
            
            // Open apply link if available
            if (internship.applyLink) {
                window.open(internship.applyLink, '_blank');
            }
        } catch (error) {
            console.error('Error applying:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Function to determine the badge color based on match label
    const getMatchBadge = (matchLabel) => {
        if (!matchLabel || matchLabel === 'No Match') return null;
        
        const badgeStyles = {
            'Best Match': 'text-green-600 bg-green-200',
            'Good Match': 'text-blue-600 bg-blue-200',
            'Partial Match': 'text-yellow-600 bg-yellow-200'
        };

        const styleClass = badgeStyles[matchLabel] || 'text-gray-600 bg-gray-200';
        
        return (
            <span className={`text-xs font-semibold inline-block py-1 px-3 rounded-full ${styleClass}`}>
                {matchLabel}
            </span>
        );
    };

    // Function to handle view details click
    const handleViewDetails = () => {
        if (internship.applyLink) {
            window.open(internship.applyLink, '_blank');
        }
    };

    if (variant === 'recommended') {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                <h3 className="text-base font-bold text-gray-800">{internship.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{internship.company}</p>
                <p className="text-sm text-gray-500 mb-3">{internship.location}</p>

                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                        {internship.requiredSkills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        {getMatchBadge(internship.matchLabel)}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleBookmark}
                            disabled={actionLoading === 'bookmark'}
                            className={`p-1.5 rounded transition-colors ${
                                isBookmarked 
                                    ? 'text-yellow-600 hover:text-yellow-700' 
                                    : 'text-gray-400 hover:text-yellow-600'
                            }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                            {actionLoading === 'bookmark' ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )}
                        </button>
                        
                        <button 
                            onClick={handleApply}
                            disabled={actionLoading === 'apply' || isApplied}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                                isApplied
                                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {actionLoading === 'apply' ? (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                    Applying...
                                </div>
                            ) : isApplied ? (
                                'Applied ✓'
                            ) : (
                                'Apply'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">{internship.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{internship.company}, {internship.location}</p>

            <ul className="mt-4 list-disc list-inside text-gray-600 space-y-1">
                {Array.from({length: 3}, (_, index) => (
                    <li key={index} className="text-sm">Required Skill {index + 1}</li>
                ))}
            </ul>

            <div className="flex justify-between items-center mt-4">
                <div>
                    {getMatchBadge(internship.matchLabel)}
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleBookmark}
                        disabled={actionLoading === 'bookmark'}
                        className={`p-2 rounded-full transition-colors ${
                            isBookmarked 
                                ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50' 
                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                        {actionLoading === 'bookmark' ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        )}
                    </button>
                    
                    <button 
                        onClick={handleApply}
                        disabled={actionLoading === 'apply' || isApplied}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isApplied
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {actionLoading === 'apply' ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Applying...
                            </div>
                        ) : isApplied ? (
                            'Applied ✓'
                        ) : (
                            'Apply Now'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InternshipCard;
