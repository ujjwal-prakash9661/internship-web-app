import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Processing GitHub authentication...');

    useEffect(() => {
        const processOAuthCallback = async () => {
            try {
                // Get token from URL parameters
                const token = searchParams.get('token');
                
                if (!token) {
                    setStatus('error');
                    setMessage('No authentication token received from GitHub.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                // Verify the token by making a profile request
                const response = await fetch('https://internship-web-app-42i2.onrender.com/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to verify authentication token');
                }

                const data = await response.json();
                
                // Login the user using the context
                login(data.user, token);

                setStatus('success');
                setMessage('GitHub authentication successful! Redirecting to dashboard...');

                // Redirect to dashboard after successful authentication
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 2000);

            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setMessage('Authentication failed. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        processOAuthCallback();
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-6">
                    {status === 'processing' && (
                        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    )}
                    {status === 'success' && (
                        <div className="text-green-500 text-4xl sm:text-6xl mb-4">✓</div>
                    )}
                    {status === 'error' && (
                        <div className="text-red-500 text-4xl sm:text-6xl mb-4">✗</div>
                    )}
                </div>
                
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    {status === 'processing' && 'Completing Sign In...'}
                    {status === 'success' && 'Authentication Successful!'}
                    {status === 'error' && 'Authentication Failed'}
                </h2>
                
                <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
                
                {status === 'processing' && (
                    <div className="text-sm text-gray-500">
                        Please wait while we complete your GitHub sign-in...
                    </div>
                )}
                
                {status === 'error' && (
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md w-full sm:w-auto"
                    >
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
}

export default OAuthCallback;