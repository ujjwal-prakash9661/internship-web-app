import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { clearAllUserApplications } from '../services/applicationService';

const DataSecurityControls = () => {
    const { user } = useAuth();
    const { clearAllUserData, currentUserId } = useUserData();
    const [isClearing, setIsClearing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearAllData = async () => {
        if (!user) return;

        setIsClearing(true);
        try {
            // Clear data from backend
            await clearAllUserApplications();
            console.log('✅ Backend data cleared for user:', user.id);

            // Clear frontend data
            clearAllUserData();
            console.log('✅ Frontend data cleared for user:', user.id);

            // Clear any remaining localStorage items related to user data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.includes('internship') || 
                    key.includes('dashboard') || 
                    key.includes('recommendation') ||
                    key.includes('application')
                ) && key !== 'token') {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log('🗑️ Removed localStorage key:', key);
            });

            alert('All your data has been cleared successfully!');
            setShowConfirm(false);

        } catch (error) {
            console.error('❌ Error clearing user data:', error);
            alert('Error clearing data. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    const ConfirmDialog = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-mx shadow-xl">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                    ⚠️ Clear All Data
                </h3>
                <p className="text-gray-700 mb-4">
                    This will permanently delete all your:
                </p>
                <ul className="text-sm text-gray-600 mb-4 ml-4">
                    <li>• Application history</li>
                    <li>• Viewed internships</li>
                    <li>• Bookmarked internships</li>
                    <li>• Activity tracking data</li>
                </ul>
                <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone!
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={isClearing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClearAllData}
                        disabled={isClearing}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {isClearing ? 'Clearing...' : 'Yes, Clear All Data'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    🔒 Data Security Controls
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Current User</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">ID: {currentUserId || user.id}</p>
                        </div>
                        <div className="text-green-600">
                            ✅ Secure Session
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Data Management</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Clear all your personal data from our servers. This includes application history, 
                            viewed internships, and activity tracking.
                        </p>
                        
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            🗑️ Clear All My Data
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 pt-4 border-t">
                        <p>• Your account and profile information will remain intact</p>
                        <p>• This only clears activity data and application history</p>
                        <p>• You can continue using the app normally after clearing data</p>
                    </div>
                </div>
            </div>

            {showConfirm && <ConfirmDialog />}
        </>
    );
};

export default DataSecurityControls;