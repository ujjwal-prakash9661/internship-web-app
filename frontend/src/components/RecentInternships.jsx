import React from 'react';
import { FaMapMarkerAlt, FaClock, FaRupeeSign, FaExternalLinkAlt } from 'react-icons/fa';
import { recordInteraction } from '../services/applicationService';

const RecentInternships = ({ internships = [] }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatStipend = (stipend) => {
        if (!stipend || stipend === 'Unpaid') return 'Unpaid';
        return `₹${stipend}`;
    };

    const handleApplyClick = async (internship) => {
        try {
            // Record the interaction
            await recordInteraction(internship._id, 'applied', 'dashboard');
            
            // Open the application link
            if (internship.applyLink) {
                window.open(internship.applyLink, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Error recording interaction:', error);
            // Still open the link even if tracking fails
            if (internship.applyLink) {
                window.open(internship.applyLink, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const handleInternshipView = async (internship) => {
        try {
            // Record view interaction (don't wait for it to complete)
            recordInteraction(internship._id, 'viewed', 'dashboard').catch(console.error);
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Internships</h3>
                <span className="text-sm text-gray-500">{internships.length} available</span>
            </div>

            {internships.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No recent internships found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {internships.map((internship, index) => (
                        <div 
                            key={internship._id || index} 
                            className="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer relative group"
                            onClick={() => handleApplyClick(internship)}
                            onMouseEnter={() => handleInternshipView(internship)}
                            title={`Click to apply for ${internship.title}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                                    {internship.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(internship.createdAt)}
                                    </span>
                                    <FaExternalLinkAlt className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 font-medium">
                                {internship.company}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    {internship.location && (
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                                            <span className="truncate">{internship.location}</span>
                                        </div>
                                    )}
                                    
                                    {internship.duration && (
                                        <div className="flex items-center">
                                            <FaClock className="h-3 w-3 mr-1" />
                                            <span>{internship.duration}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center">
                                    <FaRupeeSign className="h-3 w-3 mr-1" />
                                    <span className="font-medium">
                                        {formatStipend(internship.stipend)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                    {internship.type && (
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                            internship.type === 'remote' 
                                                ? 'bg-green-100 text-green-800'
                                                : internship.type === 'hybrid'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-xs text-blue-600 font-medium">Click to Apply</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentInternships;