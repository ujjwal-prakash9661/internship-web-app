import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { FaUserCircle, FaSearch, FaTimes, FaBars } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  const navigate = useNavigate();
  const API_URL = 'https://internship-web-app-42i2.onrender.com/api';
  
  const handleLogout = () => {
  toast.success('You have been successfully logged out!', { autoClose: 5000 });
  setTimeout(() => {
    logout();
  }, 2000); 
};

  // Debounced search function
  const performSearch = async (query) => {
    if (!query.trim() || !token) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`${API_URL}/internships/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSearchResults(response.data.internships || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Handle search result click
  const handleResultClick = (internshipId) => {
    setShowResults(false);
    setSearchQuery('');
    navigate('/recommended'); // Navigate to recommended page
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);
  
  // Don't render navbar if user is not authenticated (except on landing)
  if (!user) {
    return null;
  }

  return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                    Intern<span className="text-blue-500">Radar</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition duration-300"
                >
                    {mobileMenuOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
                </button>

                {/* Desktop Navigation - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-6">
                    <Link 
                        to="/dashboard" 
                        className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                    >
                        Dashboard
                    </Link>
                    <Link 
                        to="/recommended" 
                        className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                    >
                        Recommended
                    </Link>
                    <Link 
                        to="/applications" 
                        className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                    >
                        My Applications
                    </Link>
                    <Link 
                        to="/profile" 
                        className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                    >
                        Profile
                    </Link>
                </div>

                {/* Desktop Search Bar - Hidden on mobile */}
                <div className="hidden lg:block relative w-64 xl:w-80" ref={searchRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search internships..."
                        className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-full py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md hover:bg-white/95 transition-all duration-300"
                    />
                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'animate-spin' : ''} text-gray-600 hover:text-blue-500 transition-colors duration-300`} />
                    {searchQuery && (
                        <button 
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-500 transition-colors duration-300"
                        >
                            <FaTimes size={14} />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div ref={resultsRef} className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                            {isSearching ? (
                                <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-gray-500">Searching...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <>
                                    <div className="p-2 border-b border-gray-100">
                                        <p className="text-sm text-gray-500">Found {searchResults.length} result(s)</p>
                                    </div>
                                    {searchResults.slice(0, 10).map((internship) => (
                                        <div 
                                            key={internship._id}
                                            onClick={() => handleResultClick(internship._id)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                                        >
                                            <h4 className="font-medium text-gray-900 text-sm">{internship.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{internship.company}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {internship.skills && internship.skills.slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {internship.skills && internship.skills.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{internship.skills.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {searchResults.length > 10 && (
                                        <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-100">
                                            Showing top 10 results. View more in Recommended page.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-gray-500">No internships found for "{searchQuery}"</p>
                                    <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop User Profile & Logout - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2">
                                <FaUserCircle size={24} className="text-gray-600" />
                                <span className="font-medium text-gray-700 hidden xl:block">{user.name || 'User'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md transition duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition duration-300">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200">
                    <div className="px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <div className="relative" ref={searchRef}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search internships..."
                                className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-full py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md hover:bg-white/95 transition-all duration-300"
                            />
                            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'animate-spin' : ''} text-gray-600 hover:text-blue-500 transition-colors duration-300`} />
                            {searchQuery && (
                                <button 
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-red-500 transition-colors duration-300"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}

                            {/* Mobile Search Results Dropdown */}
                            {showResults && (
                                <div ref={resultsRef} className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
                                    {isSearching ? (
                                        <div className="p-4 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="mt-2 text-gray-500">Searching...</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            <div className="p-2 border-b border-gray-100">
                                                <p className="text-sm text-gray-500">Found {searchResults.length} result(s)</p>
                                            </div>
                                            {searchResults.slice(0, 5).map((internship) => (
                                                <div 
                                                    key={internship._id}
                                                    onClick={() => {
                                                        handleResultClick(internship._id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                                                >
                                                    <h4 className="font-medium text-gray-900 text-sm">{internship.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{internship.company}</p>
                                                </div>
                                            ))}
                                            {searchResults.length > 5 && (
                                                <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-100">
                                                    View more in Recommended page
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-gray-500">No internships found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="space-y-3">
                            <Link 
                                to="/dashboard" 
                                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link 
                                to="/recommended" 
                                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Recommended
                            </Link>
                            <Link 
                                to="/applications" 
                                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                My Applications
                            </Link>
                            <Link 
                                to="/profile" 
                                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile
                            </Link>
                        </div>

                        {/* Mobile User Profile & Logout */}
                        {user ? (
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <FaUserCircle size={24} className="text-gray-600" />
                                    <span className="font-medium text-gray-700">{user.name || 'User'}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 pt-4">
                                <Link 
                                    to="/login" 
                                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-2 px-4 rounded-md transition duration-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar