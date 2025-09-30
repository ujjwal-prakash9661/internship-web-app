import React, { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Function to clear all search data
  const clearSearchData = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Listen for logout event and clear search data
  useEffect(() => {
    const handleLogout = () => {
      clearSearchData();
    };

    window.addEventListener('userLogout', handleLogout);
    return () => {
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    clearSearchData
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};