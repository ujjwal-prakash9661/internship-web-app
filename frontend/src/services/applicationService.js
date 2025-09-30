import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://internship-web-app-42i2.onrender.com/api';

const api = axios.create({
    baseURL: `${API_URL}/applications`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Clear service cache on logout
const clearServiceCache = () => {
    // Clear any pending requests or cached data
    if (api.defaults.adapter && api.defaults.adapter.cache) {
        api.defaults.adapter.cache.clear();
    }
};

// Listen for logout events to clear service data
if (typeof window !== 'undefined') {
    window.addEventListener('userLogout', clearServiceCache);
    // Note: We don't remove this listener as services are module-level
    // and should persist across component unmounts
}

// Record user interaction with internship
export const recordInteraction = async (internshipId, status = 'viewed', source = 'dashboard') => {
    try {
        const response = await api.post('/interaction', {
            internshipId,
            status,
            source
        });
        return response.data;
    } catch (error) {
        console.error('Error recording interaction:', error);
        throw error;
    }
};

// Apply to an internship (records interaction and opens apply link)
export const applyToInternship = async (internshipId, applyLink, source = 'my-applications') => {
    try {
        // Record the "applied" interaction first
        await recordInteraction(internshipId, 'applied', source);
        
        // Open the apply link in a new tab
        if (applyLink) {
            window.open(applyLink, '_blank', 'noopener,noreferrer');
        }
        
        return { success: true, message: 'Application recorded successfully' };
    } catch (error) {
        console.error('Error applying to internship:', error);
        throw error;
    }
};

// Get user's applications
export const getUserApplications = async (status = '', page = 1, limit = 10) => {
    try {
        const response = await api.get('/user-applications', {
            params: { status, page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user applications:', error);
        throw error;
    }
};

// Get user's recent interactions
export const getRecentInteractions = async (limit = 5) => {
    try {
        const response = await api.get('/recent-interactions', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent interactions:', error);
        throw error;
    }
};

// Delete specific application (user-owned only)
export const deleteUserApplication = async (applicationId) => {
    try {
        const response = await api.delete(`/application/${applicationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting application:', error);
        throw error;
    }
};

// Get application status for a specific internship
export const getApplicationStatus = async (internshipId) => {
    try {
        const response = await api.get(`/status/${internshipId}`);
        return response.data;
    } catch (error) {
        // If no application found, return null instead of throwing error
        if (error.response?.status === 404) {
            return null;
        }
        console.error('Error fetching application status:', error);
        throw error;
    }
};

// Clear all user application data (for complete data cleanup)
export const clearAllUserApplications = async () => {
    try {
        const response = await api.delete('/clear-all');
        return response.data;
    } catch (error) {
        console.error('Error clearing all applications:', error);
        throw error;
    }
};

// Validate user context in response (for security)
export const validateUserContext = (responseData, expectedUserId) => {
    if (responseData?.data?.userId && responseData.data.userId !== expectedUserId) {
        console.error('User context validation failed - potential data leak');
        throw new Error('Invalid user context in response');
    }
    return true;
};

export default {
    recordInteraction,
    applyToInternship,
    getUserApplications,
    getRecentInteractions,
    getApplicationStatus,
    deleteUserApplication,
    clearAllUserApplications,
    validateUserContext
};