import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { FaGithub, FaEnvelope, FaLock, FaRocket, FaStar } from 'react-icons/fa';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import ThemeInput from '../components/ThemeInput.jsx';
import ThemeButton from '../components/ThemeButton.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    // const API_URL = '';

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleLogin = async(e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {email, password});
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch(err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleGitHubLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/github`
    }
    
    return (
        <ThemeBackground variant="login">
            {/* Header */}
            <header className="relative z-20 px-4 sm:px-6 py-4">
                <nav className="container mx-auto flex justify-between items-center">
                    <div className="text-xl sm:text-2xl font-bold">
                        Intern<span className="text-blue-400">Radar</span>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                            to="/" 
                            className="px-4 py-2 text-white hover:text-blue-400 transition duration-300"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-4 py-2 border-2 border-blue-500 hover:bg-blue-500 rounded-lg transition duration-300"
                        >
                            Sign Up
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 min-h-[80vh] flex items-center justify-center">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    
                    {/* Left Side - Brand Info */}
                    <div className={`text-center lg:text-left transform transition-all duration-1000 ${
                        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                    }`}>
                        <div className="mb-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-white">
                                to InternRadar
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg">
                                Continue your journey to find the perfect internship opportunity that matches your skills and passion.
                            </p>
                            
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center mb-8">
                                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-400 mb-1">1000+</div>
                                    <div className="text-sm text-gray-300">Companies</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-400 mb-1">5000+</div>
                                    <div className="text-sm text-gray-300">Internships</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-400 mb-1">98%</div>
                                    <div className="text-sm text-gray-300">Success Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className={`transform transition-all duration-1000 ${
                        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                    }`} style={{ transitionDelay: '200ms' }}>
                        <ThemeCard className="p-6 sm:p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    Sign In
                                </h3>
                                <p className="text-gray-300">
                                    Access your personalized dashboard
                                </p>
                            </div>

                            <ThemeButton
                                onClick={handleGitHubLogin}
                                variant="github"
                                className="w-full mb-6"
                                icon={FaGithub}
                            >
                                Continue with GitHub
                            </ThemeButton>

                            <div className="my-6 flex items-center">
                                <div className="flex-grow border-t border-white/20"></div>
                                <span className="mx-4 text-white/60 text-sm">OR</span>
                                <div className="flex-grow border-t border-white/20"></div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <ThemeInput
                                    label="Email Address"
                                    type="email"
                                    id="email"
                                    placeholder="your@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    error={error && error.includes('email') ? error : null}
                                />

                                <ThemeInput
                                    label="Password"
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    error={error && error.includes('password') ? error : null}
                                />

                                {error && !error.includes('email') && !error.includes('password') && (
                                    <p className="text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        {error}
                                    </p>
                                )}

                                <ThemeButton
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={loading}
                                    icon={loading ? null : FaRocket}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </ThemeButton>
                            </form>

                            <div className="text-center mt-8 pt-6 border-t border-white/20">
                                <p className="text-gray-300">
                                    Don't have an account?{' '}
                                    <Link 
                                        to="/register" 
                                        className="text-blue-400 hover:text-blue-300 font-medium transition duration-300 hover:underline"
                                    >
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </ThemeCard>
                    </div>
                </div>
            </div>
        </ThemeBackground>
    );
}

export default Login