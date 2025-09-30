import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import ThemeInput from '../components/ThemeInput.jsx';
import ThemeButton from '../components/ThemeButton.jsx';
import { 
    FaUser, 
    FaEnvelope, 
    FaGithub, 
    FaCode, 
    FaCalendar, 
    FaEdit, 
    FaSave, 
    FaTimes, 
    FaPlus,
    FaTrash,
    FaCheck,
    FaExternalLinkAlt
} from 'react-icons/fa';
import DataSecurityControls from '../components/DataSecurityControls';

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        skills: []
    });
    const [newSkill, setNewSkill] = useState('');
    const { token, user } = useAuth();
    const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

    useEffect(() => {
        fetchProfileData();
    }, [token]);

    // Listen for logout/login events to clear data
    useEffect(() => {
        const handleUserLogout = () => {
            setProfileData(null);
            setError('');
            setLoading(false);
            setEditing(false);
            setSaving(false);
            setEditForm({ name: '', skills: [] });
            setNewSkill('');
        };

        const handleUserLogin = () => {
            // Reset all data for new user
            setProfileData(null);
            setError('');
            setEditing(false);
            setSaving(false);
            setEditForm({ name: '', skills: [] });
            setNewSkill('');
        };

        window.addEventListener('userLogout', handleUserLogout);
        window.addEventListener('userLogin', handleUserLogin);

        return () => {
            window.removeEventListener('userLogout', handleUserLogout);
            window.removeEventListener('userLogin', handleUserLogin);
        };
    }, []);

    const fetchProfileData = async () => {
        if (!token) return;
        
        // Validate token is a string
        const tokenString = typeof token === 'string' ? token : String(token || '');
        if (!tokenString || tokenString === 'undefined' || tokenString === 'null') {
            console.error('❌ Profile: Invalid token detected');
            setError('Authentication error. Please login again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/dashboard/overview`, {
                headers: {
                    'Authorization': `Bearer ${tokenString}`
                }
            });
            const userData = response.data.data.user;
            setProfileData(userData);
            setEditForm({
                name: userData.name || '',
                skills: [...(userData.skills || [])]
            });
            setError('');
        } catch (err) {
            console.error("Failed to fetch profile data:", err);
            setError('Failed to load profile data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setEditForm({
            name: profileData.name || '',
            skills: [...(profileData.skills || [])]
        });
    };

    const handleCancel = () => {
        setEditing(false);
        setEditForm({
            name: profileData.name || '',
            skills: [...(profileData.skills || [])]
        });
        setNewSkill('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(`${API_URL}/dashboard/profile`, {
                name: editForm.name,
                skills: editForm.skills
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setProfileData(response.data.data);
            setEditing(false);
            setError('');
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleNameChange = (e) => {
        setEditForm(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
            setEditForm(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setEditForm(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const connectGitHub = () => {
        if (profileData?.provider !== 'github') {
            window.location.href = `${API_URL}/auth/github`;
        }
    };

    if (loading) {
        return (
            <ThemeBackground variant="profile">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4"></div>
                        <p className="text-gray-200">Loading your profile...</p>
                    </div>
                </div>
            </ThemeBackground>
        );
    }

    if (error) {
        return (
            <ThemeBackground variant="profile">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <ThemeButton 
                            onClick={fetchProfileData}
                            variant="primary"
                        >
                            Retry
                        </ThemeButton>
                    </div>
                </div>
            </ThemeBackground>
        );
    }

    return (
        <ThemeBackground variant="profile">
            <Navbar />
            
            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
                {/* Page Header */}
                <div className="mb-8 text-center animate-fade-in">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-slide-in-left">
                        Profile Settings
                    </h1>
                    <p className="text-gray-200 text-lg animate-slide-in-right animation-delay-200">
                        Manage your account information and preferences
                    </p>
                </div>

                {/* Profile Card */}
                <ThemeCard className="mb-8 animate-scale-in animation-delay-300">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {/* Profile Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                {profileData?.avatar ? (
                                    <img 
                                        src={profileData.avatar} 
                                        alt="Profile"
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 mx-auto sm:mx-0 animate-glow"
                                    />
                                ) : (
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto sm:mx-0 animate-glow">
                                        <FaUser className="text-white text-xl sm:text-2xl" />
                                    </div>
                                )}
                                
                                <div className="text-center sm:text-left">
                                    {editing ? (
                                        <ThemeInput
                                            type="text"
                                            value={editForm.name}
                                            onChange={handleNameChange}
                                            className="text-xl sm:text-2xl font-bold w-full sm:w-auto"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                                            {profileData?.name || 'User'}
                                        </h2>
                                    )}
                                    <p className="text-gray-300 flex items-center justify-center sm:justify-start mt-2 text-sm sm:text-base">
                                        <FaEnvelope className="mr-2" />
                                        {profileData?.email}
                                    </p>
                                    {profileData?.githubUsername && (
                                        <p className="text-gray-300 flex items-center justify-center sm:justify-start mt-1 text-sm sm:text-base">
                                            <FaGithub className="mr-2" />
                                            <a 
                                                href={`https://github.com/${profileData.githubUsername}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-300 hover:text-blue-400 flex items-center transition-colors duration-200"
                                            >
                                                {profileData.githubUsername}
                                                <FaExternalLinkAlt className="ml-1 text-xs" />
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                                {editing ? (
                                    <>
                                        <ThemeButton
                                            onClick={handleSave}
                                            disabled={saving}
                                            variant="primary"
                                            className="flex items-center justify-center"
                                        >
                                            <FaSave className="mr-2" />
                                            {saving ? 'Saving...' : 'Save'}
                                        </ThemeButton>
                                        <ThemeButton
                                            onClick={handleCancel}
                                            variant="ghost"
                                            className="flex items-center justify-center"
                                        >
                                            <FaTimes className="mr-2" />
                                            Cancel
                                        </ThemeButton>
                                    </>
                                ) : (
                                    <ThemeButton
                                        onClick={handleEdit}
                                        variant="primary"
                                        className="flex items-center justify-center"
                                    >
                                        <FaEdit className="mr-2" />
                                        Edit Profile
                                    </ThemeButton>
                                )}
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Account Details */}
                            <div className="animate-slide-in-left animation-delay-600">
                                <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                        <span className="text-gray-300">Login Method</span>
                                        <div className="flex items-center">
                                            {profileData?.provider === 'github' ? (
                                                <>
                                                    <FaGithub className="text-gray-200 mr-2" />
                                                    <span className="text-white font-medium">GitHub</span>
                                                    <span className="ml-2 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs border border-green-400/30">
                                                        Connected
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaEnvelope className="text-gray-200 mr-2" />
                                                    <span className="text-white font-medium">Email</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                        <span className="text-gray-300">Member Since</span>
                                        <div className="flex items-center">
                                            <FaCalendar className="text-gray-200 mr-2" />
                                            <span className="text-white font-medium">
                                                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="animate-slide-in-right animation-delay-600">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <FaCode className="mr-2" />
                                    Skills
                                </h3>
                                
                                {editing ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                            <ThemeInput
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Add a new skill"
                                                className="flex-1 text-sm sm:text-base"
                                            />
                                            <ThemeButton
                                                onClick={addSkill}
                                                variant="primary"
                                                className="flex items-center justify-center text-sm sm:text-base"
                                            >
                                                <FaPlus className="mr-1" />
                                                Add
                                            </ThemeButton>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {editForm.skills.map((skill, index) => (
                                                <span 
                                                    key={index}
                                                    className="inline-flex items-center bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-400/30"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill(skill)}
                                                        className="ml-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {profileData?.skills && profileData.skills.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.skills.map((skill, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-block bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full border border-purple-400/30 animate-fade-in"
                                                        style={{ animationDelay: `${index * 100}ms` }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">No skills added yet</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ThemeCard>

                {/* Data Security Controls */}
                <div className="animate-fade-in animation-delay-800">
                    <DataSecurityControls />
                </div>

                {/* GitHub Integration Card */}
                {profileData?.provider !== 'github' && (
                    <ThemeCard className="animate-scale-in animation-delay-900">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/30">
                                    <FaGithub className="text-white text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Connect GitHub</h3>
                                    <p className="text-gray-300 text-sm sm:text-base">Automatically sync your skills and repositories</p>
                                </div>
                            </div>
                            <ThemeButton
                                onClick={connectGitHub}
                                variant="github"
                                className="flex items-center justify-center text-sm sm:text-base"
                            >
                                <FaGithub className="mr-2" />
                                Connect GitHub
                            </ThemeButton>
                        </div>
                    </ThemeCard>
                )}

                {/* Success Message */}
                {error === '' && saving === false && editing === false && (
                    <div className="fixed bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in border border-green-400/30">
                        <FaCheck className="mr-2" />
                        Profile updated successfully!
                    </div>
                )}
            </main>
        </ThemeBackground>
    );
}

export default Profile;