import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import GitHubSyncBanner from '../components/GitHubSyncBanner.jsx';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import ThemeButton from '../components/ThemeButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser, FaGithub } from 'react-icons/fa';

function RecommendedInternships() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const { token, user, loading: authLoading } = useAuth();
    const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

    useEffect(() => {
        const fetchData = async () => {
            if (!token || authLoading) return;

            try {
                setLoading(true);
                // Clear previous data to ensure fresh data for each user
                setInternships([]);
                
                // Fetch recommendations
                const recommendationsResponse = await axios.get(`${API_URL}/recommendations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setInternships(recommendationsResponse.data.recommendations);
                setError('');
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
                setError('Failed to load recommendations. Please try again later.');
                // Clear internships on error
                setInternships([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, authLoading, user?.id]); // Add user.id as dependency to refetch when user changes

    // Set userProfile from auth context when available
    useEffect(() => {
        if (user) {
            setUserProfile(user);
        } else {
            setUserProfile(null);
        }
    }, [user]);

    // Listen for logout/login events to clear data
    useEffect(() => {
        const handleUserLogout = () => {
            setInternships([]);
            setUserProfile(null);
            setError('');
            setLoading(false);
            setSyncing(false);
        };

        const handleUserLogin = () => {
            // Reset all data for new user
            setInternships([]);
            setUserProfile(null);
            setError('');
            setSyncing(false);
        };

        window.addEventListener('userLogout', handleUserLogout);
        window.addEventListener('userLogin', handleUserLogin);

        return () => {
            window.removeEventListener('userLogout', handleUserLogout);
            window.removeEventListener('userLogin', handleUserLogin);
        };
    }, []);

    // Handle GitHub skill sync
    const handleGithubSync = async () => {
        if (!token) return;

        try {
            setSyncing(true);
            
            // Step 1: Sync GitHub skills
            await axios.post(`${API_URL}/github/sync-skills`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Step 2: Fetch and save internships from API
            await axios.post(`${API_URL}/internships/fetch-from-api`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Step 3: Refresh the data
            const [profileResponse, recommendationsResponse] = await Promise.all([
                axios.get(`${API_URL}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/recommendations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setUserProfile(profileResponse.data.user);
            setInternships(recommendationsResponse.data.recommendations);
            setError('');
            
        } catch (err) {
            console.error("Failed to sync GitHub data:", err);
            setError('Failed to sync GitHub data. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    // For non-GitHub users, redirect to GitHub login
    const handleProfileAction = () => {
        if (userProfile?.provider !== 'github') {
            // Redirect to GitHub OAuth
            window.location.href = `${API_URL}/auth/github`;
        } else {
            // Already GitHub user, sync skills
            handleGithubSync();
        }
    };

    // Check if user is logged in via GitHub
    const isGithubUser = userProfile?.provider === 'github';
    const shouldShowUpdateBanner = !isGithubUser; // Only show if NOT a GitHub user

    return (
        <ThemeBackground variant="recommendations">
            <div className="min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
                    {/* GitHub Sync Banner for non-GitHub users only */}
                    <GitHubSyncBanner 
                        showBanner={!isGithubUser}
                        syncing={syncing}
                        onSyncSkills={handleProfileAction}
                    />

                    {/* Profile Update Notification */}
                    {shouldShowUpdateBanner && (
                        <ThemeCard className="border-l-4 border-blue-400 p-6 sm:p-8 mb-8 rounded-r-lg bg-blue-500/10 animate-slide-in-left transform hover:scale-105 transition-all duration-500 hover:shadow-xl" animationDelay="200ms">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <FaGithub className="text-blue-400 text-xl sm:text-base" />
                                    <div>
                                        <h4 className="text-blue-700 font-semibold text-base sm:text-lg">
                                            {isGithubUser ? 'Sync Your Latest Skills!' : 'Connect with GitHub!'}
                                        </h4>
                                        <p className="text-blue-600 text-sm mt-1">
                                            {isGithubUser 
                                                ? 'Update your skills from your latest GitHub repositories.' 
                                                : 'Get better recommendations by connecting your GitHub account and syncing skills.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <ThemeButton 
                                    onClick={handleProfileAction}
                                    disabled={syncing}
                                    variant="primary"
                                    className="px-6 py-3 text-sm font-medium transition-all duration-500 flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 hover:scale-110"
                                >
                                    {syncing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    {syncing ? '✨ Syncing...' : (isGithubUser ? '🔄 Sync Skills' : '🔗 Connect GitHub')}
                                </ThemeButton>
                            </div>
                        </ThemeCard>
                    )}

                    {/* Page Header */}
                    <div className="mb-8 sm:mb-12 text-center animate-fade-in">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-slide-in-left">
                            ✨ Recommended Internships
                        </h1>
                        <p className="text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed animate-slide-in-right" style={{ animationDelay: '300ms' }}>
                            Personalized internship recommendations crafted specifically for your skills and career goals.
                        </p>
                    </div>

                {/* Internships Grid */}
                <div className="mt-8">
                    {loading ? (
                        <ThemeCard className="flex flex-col justify-center items-center h-80 animate-pulse transform hover:scale-105 transition-all duration-500">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-700 mb-6"></div>
                            <p className="text-gray-700 text-lg animate-fade-in">Finding perfect matches for you...</p>
                        </ThemeCard>
                    ) : error ? (
                        <ThemeCard className="text-center py-12 border border-red-400/30 bg-red-500/10 animate-slide-in-right transform hover:scale-105 transition-all duration-500" animationDelay="400ms">
                            <div className="text-red-400 text-6xl mb-4">⚠️</div>
                            <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
                            <ThemeButton 
                                onClick={() => window.location.reload()} 
                                variant="primary"
                                className="px-6 py-3 font-medium transition-all duration-500 hover:scale-110"
                            >
                                🔄 Retry
                            </ThemeButton>
                        </ThemeCard>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {internships.map((internship, index) => (
                                <div 
                                    key={internship._id}
                                    className="transform hover:scale-105 transition-all duration-500 animate-scale-in hover:shadow-2xl"
                                    style={{ animationDelay: `${500 + index * 150}ms` }}
                                >
                                    <InternshipCard 
                                        internship={internship} 
                                        variant="recommended"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {!loading && !error && internships.length === 0 && (
                    <ThemeCard className="text-center py-16 animate-fade-in transform hover:scale-105 transition-all duration-500">
                        <div className="text-gray-500 text-8xl mb-6 animate-bounce">🎯</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-slide-in-left">No Recommendations Yet</h3>
                        <p className="text-gray-700 mb-8 text-lg max-w-md mx-auto leading-relaxed animate-slide-in-right" style={{ animationDelay: '300ms' }}>
                            Complete your profile to get personalized internship recommendations tailored just for you.
                        </p>
                        <ThemeButton 
                            onClick={handleProfileAction}
                            disabled={syncing}
                            variant="primary"
                            className="px-8 py-4 text-lg font-medium transition-all duration-500 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 hover:scale-110 animate-scale-in"
                            style={{ animationDelay: '500ms' }}
                        >
                            {syncing && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                            {syncing ? '✨ Syncing...' : '🚀 Complete Profile'}
                        </ThemeButton>
                    </ThemeCard>
                )}
            </main>
        </div>
    </ThemeBackground>
    );
}

export default RecommendedInternships;