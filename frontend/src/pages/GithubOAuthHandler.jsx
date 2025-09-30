import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const GithubOAuthHandler = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [status, setStatus] = useState('Completing GitHub login…');
  const [authToken, setAuthToken] = useState(null); // Use local state for token
  const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

  useEffect(() => {
    // Extract token from callback query parameters
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (!tokenFromUrl) {
      navigate('/login', { replace: true });
      return;
    }

    // Verify token with backend and get user data
    const verifyTokenAndLogin = async () => {
      try {
        setStatus('Verifying authentication...');
        
        // Make authenticated request to get user profile
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${tokenFromUrl}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to verify token: ${response.status}`);
        }

        const userData = await response.json();
        console.log('✅ User authenticated successfully:', userData);

        // Store token and user data  
        login(userData.user, tokenFromUrl);
        setAuthToken(tokenFromUrl); // Store token for operations

        setStatus('Login successful! Setting up your dashboard...');

      } catch (error) {
        console.error('❌ Token verification failed:', error);
        setStatus('Authentication failed. Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setProcessing(false);
      }
    };

    verifyTokenAndLogin();
  }, [login, navigate]);

  // After token is set, fetch internships and redirect to dashboard
  useEffect(() => {
    const setupDashboard = async () => {
      if (!processing && authToken) {
        try {
          setStatus('Loading internship opportunities…');
          console.log('🚀 Starting internship setup...');
          console.log('🔑 Token:', authToken ? 'Present' : 'Missing');
          
          // Fetch internships for user recommendations
          try {
            console.log('📡 Calling /internships/fetch-from-api...');
            const internshipsResponse = await axios.post(`${API_URL}/internships/fetch-from-api`, {}, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log('✅ Internships fetch successful:', internshipsResponse.data);
          } catch (internshipsError) {
            console.error('❌ Internships fetch failed:', internshipsError.response?.data || internshipsError.message);
            // Don't fail the flow if internships can't be fetched
          }

          setStatus('All set! Redirecting to dashboard…');
          
          // Small delay to show completion message
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
          
        } catch (error) {
          console.error('❌ Unexpected error in GitHub OAuth flow:', error);
          setStatus('Setup complete! Redirecting to dashboard…');
          
          // Even if setup fails, still redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        }
      }
    };

    setupDashboard();
  }, [processing, authToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
        <p className="text-base sm:text-lg font-semibold text-gray-800 px-4">{status}</p>
      </div>
    </div>
  );
};

export default GithubOAuthHandler;