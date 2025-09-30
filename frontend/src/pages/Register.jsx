import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaGithub, FaUser, FaEnvelope, FaLock, FaRocket, FaStar, FaUserPlus } from 'react-icons/fa';
import ThemeBackground from '../components/ThemeBackground.jsx';
import ThemeCard from '../components/ThemeCard.jsx';
import ThemeInput from '../components/ThemeInput.jsx';
import ThemeButton from '../components/ThemeButton.jsx';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'https://internship-web-app-42i2.onrender.com/api';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRegister = async(e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if(password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, {name, email, password});
      navigate('/login');
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleGitHubLogin = () => {
        window.location.href = `${API_URL}/auth/github`;
  };
  
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
              to="/login" 
              className="px-4 py-2 border-2 border-blue-500 hover:bg-blue-500 rounded-lg transition duration-300"
            >
              Sign In
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Start Your Journey
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-white">
                with InternRadar
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg">
                Join thousands of students who have found their perfect internships. Create your account and unlock endless opportunities.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: FaRocket, text: "Smart recommendations based on your skills" },
                  { icon: FaGithub, text: "GitHub integration for automatic skill sync" },
                  { icon: FaStar, text: "Access to 5000+ internship opportunities" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-300">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <feature.icon className="text-blue-400" size={16} />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>
            <ThemeCard className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create Account
                </h3>
                <p className="text-gray-300">
                  Start your internship journey today
                </p>
              </div>

              <ThemeButton
                onClick={handleGitHubLogin}
                variant="github"
                className="w-full mb-6"
                icon={FaGithub}
              >
                Sign Up with GitHub
              </ThemeButton>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-white/60 text-sm">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <ThemeInput
                  label="Full Name"
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <ThemeInput
                  label="Email Address"
                  type="email"
                  id="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <ThemeInput
                  label="Password"
                  type="password"
                  id="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  error={error && error.includes('password') ? error : null}
                />

                {error && !error.includes('password') && (
                  <p className="text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </p>
                )}

                <ThemeButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                  icon={loading ? null : FaUserPlus}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </ThemeButton>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-white/20">
                <p className="text-gray-300">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-400 hover:text-blue-300 font-medium transition duration-300 hover:underline"
                  >
                    Sign In
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

export default Register