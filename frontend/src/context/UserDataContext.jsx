import React, { createContext, useContext, useState, useEffect } from 'react';

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [internships, setInternships] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Function to clear all user-specific data
  const clearAllUserData = () => {
    console.log('🔄 UserDataContext: Clearing all user data');
    setInternships([]);
    setDashboardData(null);
    setUserProfile(null);
    setRecommendations([]);
    setCurrentUserId(null);
    
    // Force clear any browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('user-data') || name.includes('api-response')) {
            caches.delete(name);
          }
        });
      });
    }
  };

  // Function to clear specific data types
  const clearInternships = () => setInternships([]);
  const clearDashboardData = () => setDashboardData(null);
  const clearUserProfile = () => setUserProfile(null);
  const clearRecommendations = () => setRecommendations([]);

  // Listen for user authentication events
  useEffect(() => {
    const handleLogout = () => {
      console.log('🔐 UserDataContext: Received logout event');
      clearAllUserData();
    };

    const handleLogin = (event) => {
      const userId = event.detail?.userId;
      console.log('🔐 UserDataContext: Received login event for user:', userId);
      
      // Clear previous user's data before setting new user
      if (currentUserId && currentUserId !== userId) {
        console.log('🔄 UserDataContext: Different user detected, clearing previous data');
        clearAllUserData();
      }
      
      setCurrentUserId(userId);
    };

    window.addEventListener('userLogout', handleLogout);
    window.addEventListener('userLogin', handleLogin);
    
    return () => {
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('userLogin', handleLogin);
    };
  }, [currentUserId]);

  // Data validation function
  const validateDataOwnership = (responseData, expectedUserId) => {
    if (responseData?.userId && responseData.userId !== expectedUserId) {
      console.error('🚨 Data ownership validation failed!', {
        expected: expectedUserId,
        received: responseData.userId
      });
      clearAllUserData();
      throw new Error('Data ownership validation failed');
    }
    return true;
  };

  const value = {
    // Data states
    internships,
    setInternships,
    dashboardData,
    setDashboardData,
    userProfile,
    setUserProfile,
    recommendations,
    setRecommendations,
    currentUserId,
    setCurrentUserId,
    
    // Clear functions
    clearAllUserData,
    clearInternships,
    clearDashboardData,
    clearUserProfile,
    clearRecommendations,
    
    // Validation function
    validateDataOwnership,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};