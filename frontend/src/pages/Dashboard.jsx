import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import GitHubSyncBanner from '../components/GitHubSyncBanner.jsx';
import StatsCard from '../components/StatsCard.jsx';
import ProfileCompletion from '../components/ProfileCompletion.jsx';
import QuickActions from '../components/QuickActions.jsx';
import RecentInternships from '../components/RecentInternships.jsx';
import RecentApplications from '../components/RecentApplications.jsx';
import ApplicationStats from '../components/ApplicationStats.jsx';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    FaUser, 
    FaBriefcase, 
    FaChartLine, 
    FaGithub,
    FaCog,
    FaBell,
    FaHeart
} from 'react-icons/fa';

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            
            // Validate token is a string
            const tokenString = typeof token === 'string' ? token : String(token || '');
            if (!tokenString || tokenString === 'undefined' || tokenString === 'null') {
                console.error('❌ Dashboard: Invalid token detected');
                setError('Authentication error. Please login again.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Clear previous data to ensure fresh data for each user
                setDashboardData(null);
                
                const response = await axios.get(`${API_URL}/dashboard/overview`, {
                    headers: {
                        'Authorization': `Bearer ${tokenString}`
                    }
                });
                setDashboardData(response.data.data);
                setError('');
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError('Failed to load dashboard data. Please try again later.');
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, user?.id]); // Add user.id as dependency to refetch when user changes

    // Listen for logout/login events to clear data
    useEffect(() => {
        const handleUserLogout = () => {
            setDashboardData(null);
            setError('');
            setLoading(false);
            setSyncing(false);
        };

        const handleUserLogin = () => {
            // Reset all data for new user
            setDashboardData(null);
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

    // Listen for application changes to refresh stats
    useEffect(() => {
        const handleApplicationChange = () => {
            setRefreshTrigger(prev => prev + 1);
        };

        window.addEventListener('applicationChange', handleApplicationChange);

        return () => {
            window.removeEventListener('applicationChange', handleApplicationChange);
        };
    }, []);

    // Handle GitHub skill sync
    const handleGithubSync = async () => {
        if (!token) return;
        
        // Validate token is a string
        const tokenString = typeof token === 'string' ? token : String(token || '');
        if (!tokenString || tokenString === 'undefined' || tokenString === 'null') {
            console.error('❌ Sync: Invalid token detected');
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            setSyncing(true);
            
            // Sync GitHub skills
            await axios.post(`${API_URL}/github/sync-skills`, {}, {
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });

            // Refresh dashboard data after syncing
            const response = await axios.get(`${API_URL}/dashboard/overview`, {
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });
            setDashboardData(response.data.data);
            
        } catch (err) {
            console.error("Failed to sync GitHub data:", err);
            setError('Failed to sync GitHub data. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    // For non-GitHub users, redirect to GitHub login
    const handleProfileAction = () => {
        if (user?.provider !== 'github') {
            // Redirect to GitHub OAuth
            window.location.href = `${API_URL}/auth/github`;
        } else {
            // Already GitHub user, sync skills
            handleGithubSync();
        }
    };

    // Check if user is logged in via GitHub
    const isGithubUser = user?.provider === 'github';

    // Navigation handlers for stats cards
    const handleTotalInternshipsClick = () => {
        navigate('/recommended');
    };

    const handleMatchingInternshipsClick = () => {
        navigate('/recommended');
    };

    const handleProfileCompletionClick = () => {
        navigate('/profile');
    };

    const handleSkillsClick = () => {
        if (!isGithubUser) {
            handleProfileAction(); // Connect to GitHub
        } else {
            navigate('/profile');
        }
    };

    if (loading) {
        return (
            <ThemeBackground variant="dashboard">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-6"></div>
                        <p className="text-white text-xl">Loading your dashboard...</p>
                        <p className="text-gray-300 text-sm mt-2">Preparing your personalized experience</p>
                    </div>
                </div>
            </ThemeBackground>
        );
    }

    if (error) {
        return (
            <ThemeBackground variant="dashboard">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <ThemeCard className="p-8 text-center max-w-md mx-4">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <h2 className="text-white text-xl font-semibold mb-4">Something went wrong</h2>
                        <p className="text-red-300 mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105"
                        >
                            Try Again
                        </button>
                    </ThemeCard>
                </div>
            </ThemeBackground>
        );
    }

    return (
        <ThemeBackground variant="dashboard" className="theme-scrollbar">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                {/* GitHub Sync Banner for non-GitHub users only */}
                <GitHubSyncBanner 
                    showBanner={!isGithubUser}
                    syncing={syncing}
                    onSyncSkills={handleProfileAction}
                />

                {/* Welcome Header */}
                <div className={`mb-8 transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                    <ThemeCard className="p-6 sm:p-8 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                    Welcome back, <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">{dashboardData?.user.name || 'User'}</span>! 👋
                                </h1>
                                <p className="text-gray-300 text-lg">
                                    Here's what's happening with your internship journey
                                </p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                {dashboardData?.user.avatar && (
                                    <img 
                                        src={dashboardData.user.avatar} 
                                        alt="Profile"
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-400/50 animate-glow"
                                    />
                                )}
                            </div>
                        </div>
                    </ThemeCard>
                </div>

                {/* Stats Cards */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`} style={{ transitionDelay: '200ms' }}>
                    <StatsCard
                        title="Total Internships"
                        value={dashboardData?.stats.totalInternships || 0}
                        subtitle="Available opportunities"
                        icon={FaBriefcase}
                        color="blue"
                        onClick={handleTotalInternshipsClick}
                        actionHint="View all internships"
                    />
                    <StatsCard
                        title="Matching Internships"
                        value={dashboardData?.stats.matchingInternships || 0}
                        subtitle="Based on your skills"
                        icon={FaHeart}
                        color="green"
                        onClick={handleMatchingInternshipsClick}
                        actionHint="View matching opportunities"
                    />
                    <StatsCard
                        title="Profile Completion"
                        value={`${dashboardData?.stats.profileCompletion || 0}%`}
                        subtitle="Complete for better matches"
                        icon={FaUser}
                        color="purple"
                        onClick={handleProfileCompletionClick}
                        actionHint="Complete your profile"
                    />
                    <StatsCard
                        title="Skills Added"
                        value={dashboardData?.stats.totalSkills || 0}
                        subtitle={dashboardData?.stats.isGithubConnected ? 'From GitHub' : 'Add more skills'}
                        icon={FaChartLine}
                        color="orange"
                        onClick={handleSkillsClick}
                        actionHint={isGithubUser ? "Update skills" : "Connect GitHub"}
                    />
                </div>

                {/* Application Stats */}
                <div className={`mb-8 transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`} style={{ transitionDelay: '400ms' }}>
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Application Activity</h2>
                    <ApplicationStats refreshTrigger={refreshTrigger} />
                </div>

                {/* Main Dashboard Grid */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`} style={{ transitionDelay: '600ms' }}>
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                        {/* Recent Internships */}
                        <RecentInternships internships={dashboardData?.recentInternships || []} />

                        {/* Skills Overview */}
                        {dashboardData?.user.skills && dashboardData.user.skills.length > 0 && (
                            <ThemeCard className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Your Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {dashboardData.user.skills.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-sm px-3 py-2 rounded-full border border-blue-400/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-purple-500/30 transition duration-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </ThemeCard>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 lg:space-y-8">
                        {/* Recent Applications */}
                        <RecentApplications limit={5} refreshTrigger={refreshTrigger} />

                        {/* Profile Completion */}
                        <ProfileCompletion 
                            percentage={dashboardData?.stats.profileCompletion || 0}
                            user={dashboardData?.user || {}}
                        />

                        {/* Quick Actions */}
                        <QuickActions actions={dashboardData?.quickActions || []} />

                        {/* Account Info */}
                        <ThemeCard className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Member since</span>
                                    <span className="text-sm text-white">
                                        {new Date(dashboardData?.stats.memberSince).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Login method</span>
                                    <span className="flex items-center text-sm text-white">
                                        {dashboardData?.user.provider === 'github' ? (
                                            <>
                                                <FaGithub className="mr-1 text-blue-400" />
                                                <span className="text-blue-400">GitHub</span>
                                            </>
                                        ) : (
                                            'Email'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </ThemeCard>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className={`mt-8 transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`} style={{ transitionDelay: '800ms' }}>
                    <ThemeCard className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition duration-300">
                                <FaBell className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <h4 className="font-medium text-white">Get Notifications</h4>
                                <p className="text-sm text-gray-300">Stay updated with new internships</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition duration-300">
                                <FaGithub className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <h4 className="font-medium text-white">Sync Skills</h4>
                                <p className="text-sm text-gray-300">Connect GitHub for better matching</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition duration-300">
                                <FaCog className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                <h4 className="font-medium text-white">Settings</h4>
                                <p className="text-sm text-gray-300">Customize your preferences</p>
                            </div>
                        </div>
                    </ThemeCard>
                </div>
            </main>
        </ThemeBackground>
    );
}

export default Dashboard;