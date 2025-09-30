import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext()
const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

export function useAuth()
{
    return useContext(AuthContext)
}

export function AuthProvider({children})
{
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(token)
        {
            // Ensure token is always a string before using it
            const tokenString = typeof token === 'string' ? token : String(token || '');
            
            if (!tokenString || tokenString === 'undefined' || tokenString === 'null') {
                console.error('❌ Invalid token detected, clearing authentication');
                logout();
                return;
            }
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;
            // Only fetch user profile if we don't already have user data
            if (!user) {
                fetchUserProfile();
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [token])

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/profile`);
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If token is invalid, clear it
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, userToken) => 
    {
        // Clear any existing data before setting new user data
        window.dispatchEvent(new CustomEvent('userLogout'));
        
        // Ensure token is always a string
        const tokenString = typeof userToken === 'string' ? userToken : String(userToken || '');
        
        if (!tokenString) {
            console.error('❌ Login failed: Invalid token provided');
            setLoading(false);
            return;
        }
        
        console.log('✅ Login successful with token type:', typeof tokenString);
        
        setUser(userData)
        setToken(tokenString)
        localStorage.setItem('token', tokenString)
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;
        
        // Dispatch login event to reset data for new user
        window.dispatchEvent(new CustomEvent('userLogin', { 
            detail: { userId: userData?.id || null } 
        }));
        
        // Only fetch user profile if userData is not provided
        if (!userData && tokenString) {
            fetchUserProfile();
        } else {
            // User data is provided, stop loading
            setLoading(false);
        }
    };

    const logout = () => {
        // Dispatch logout event FIRST to clear all contexts immediately
        window.dispatchEvent(new CustomEvent('userLogout'));
        
        // Clear all user data
        setUser(null)
        setToken(null)
        
        // Clear all localStorage and sessionStorage data to ensure clean logout
        localStorage.removeItem('token')
        localStorage.clear() // Clear any other stored data
        sessionStorage.clear() // Clear session storage as well
        
        // Remove auth headers from all axios instances
        delete axios.defaults.headers.common['Authorization']
        
        setLoading(false);
        
        // Clear any cached axios responses
        if (axios.defaults.adapter && axios.defaults.adapter.cache) {
            axios.defaults.adapter.cache.clear();
        }
        
        // Force redirect to home page with a fresh reload to clear any cached data
        window.location.href = '/';
        window.location.reload();
    }

    const value = {
        user,
        token,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
}
