import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import PWAControls from '../components/PWAControls.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCog, FaUser, FaBell, FaMobile, FaShieldAlt } from 'react-icons/fa';

const Settings = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'account', label: 'Account', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'pwa', label: 'PWA Settings', icon: FaMobile },
    { id: 'privacy', label: 'Privacy', icon: FaShield }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <ThemeBackground>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-300">
              Manage your account preferences and app settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ThemeCard className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition duration-300 ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </ThemeCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <ThemeCard className="p-6">
                
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Theme</h3>
                          <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                        </div>
                        <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Language</h3>
                          <p className="text-gray-400 text-sm">Select your preferred language</p>
                        </div>
                        <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      
                      {/* Profile Info */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4">Profile Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            {user?.avatarUrl && (
                              <img 
                                src={user.avatarUrl} 
                                alt="Profile" 
                                className="w-16 h-16 rounded-full"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium">{user?.name || 'N/A'}</p>
                              <p className="text-gray-400">{user?.email || 'N/A'}</p>
                              <p className="text-gray-400 text-sm">{user?.githubUsername || 'No GitHub connected'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h3 className="text-red-300 font-semibold mb-4">Danger Zone</h3>
                        <button
                          onClick={handleLogout}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Email Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Push Notifications</h3>
                          <p className="text-gray-400 text-sm">Get push notifications in browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Application Updates</h3>
                          <p className="text-gray-400 text-sm">Notifications about your applications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* PWA Settings */}
                {activeTab === 'pwa' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">PWA Settings</h2>
                    <p className="text-gray-300 mb-6">
                      Progressive Web App settings and troubleshooting tools. Use these controls if you experience authentication issues.
                    </p>
                    <PWAControls />
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Profile Visibility</h3>
                          <p className="text-gray-400 text-sm">Make your profile visible to employers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Analytics</h3>
                          <p className="text-gray-400 text-sm">Help improve the app with anonymous usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h3 className="text-yellow-300 font-semibold mb-2">Data Collection</h3>
                        <p className="text-gray-300 text-sm">
                          We only collect data necessary to provide our services. Your personal information is never sold to third parties.
                          <br /><br />
                          GitHub authentication data is used only for profile creation and application tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ThemeCard>
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  );
};

export default Settings;