import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRocket, FaSearch, FaGithub, FaUserCheck, FaBriefcase, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

const Landing = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Animation timing
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: FaRocket,
      title: "Smart Recommendations",
      description: "Get personalized internship suggestions based on your skills and preferences",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: FaGithub,
      title: "GitHub Integration",
      description: "Connect your GitHub account to automatically sync your skills and projects",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: FaSearch,
      title: "Advanced Search",
      description: "Find internships using powerful filters and search capabilities",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: FaBriefcase,
      title: "Career Growth",
      description: "Access thousands of internship opportunities from top companies",
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-20 px-4 sm:px-6 py-4">
        <nav className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl sm:text-2xl font-bold">
            Intern<span className="text-blue-400">Radar</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:space-x-4">
            {token ? (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <span className="text-white font-medium text-sm sm:text-base">Hello, {user?.name || 'User'}</span>
                  <Link 
                    to="/dashboard" 
                    className="px-3 sm:px-4 py-2 text-white hover:text-blue-400 transition duration-300 text-sm sm:text-base"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/recommended" 
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300 text-sm sm:text-base"
                  >
                    Recommended
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-3 sm:px-4 py-2 text-white hover:text-blue-400 transition duration-300 text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300 text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Find Your Dream
          </h1>
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-8">
            Internship Today
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto px-4">
            Connect with top companies, showcase your GitHub projects, and land the perfect internship 
            opportunity tailored to your skills.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            {token ? (
              <>
                <div className="mb-4 w-full sm:w-auto">
                  <span className="text-lg sm:text-2xl text-blue-300">Welcome back, {user?.name || 'User'}!</span>
                </div>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-base sm:text-lg font-semibold transition duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <FaRocket className="mr-2 sm:mr-3" />
                  Go to Dashboard
                </Link>
                <Link 
                  to="/recommended" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-500 hover:bg-blue-500 rounded-lg text-base sm:text-lg font-semibold transition duration-300 w-full sm:w-auto"
                >
                  <FaBriefcase className="mr-2 sm:mr-3" />
                  View Internships
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-base sm:text-lg font-semibold transition duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <FaRocket className="mr-2 sm:mr-3" />
                  Get Started
                </Link>
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-500 hover:bg-blue-500 rounded-lg text-base sm:text-lg font-semibold transition duration-300 w-full sm:w-auto"
                >
                  <FaUserCheck className="mr-2 sm:mr-3" />
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Animated Features Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Why Choose InternRadar?
          </h3>
          <p className="text-lg sm:text-xl text-gray-300">
            The smart way to discover and apply for internships
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } ${currentStep === index ? 'scale-105' : 'scale-100'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition duration-300 h-full">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 mx-auto`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-center">{feature.title}</h4>
                  <p className="text-gray-300 text-center">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                <div className="text-gray-300">Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">5000+</div>
                <div className="text-gray-300">Internships</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">98%</div>
                <div className="text-gray-300">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
            Ready to Launch Your Career?
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto px-4">
            Join thousands of students who have found their perfect internships through InternRadar.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg text-lg sm:text-xl font-semibold transition duration-300 transform hover:scale-105 w-full sm:w-auto max-w-sm mx-auto"
          >
            <FaStar className="mr-2 sm:mr-3" />
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/5 rounded-full animate-ping"
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Landing;