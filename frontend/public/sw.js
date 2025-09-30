// Custom Service Worker for InternRadar PWA
// This service worker is configured to NOT interfere with authentication

const CACHE_NAME = 'internradar-v1';
const API_BASE_URL = 'https://internship-web-app-42i2.onrender.com/api';

// Authentication URLs that should NEVER be cached
const AUTH_PATTERNS = [
  /\/api\/auth/,
  /github\.com/,
  /\/login/,
  /\/callback/,
  /\/oauth/,
  /github-oauth-handler/
];

// API endpoints that can be cached (non-auth)
const CACHEABLE_API_PATTERNS = [
  /\/api\/internships/,
  /\/api\/applications/
];

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with smart caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NEVER intercept authentication requests - let them go directly to network
  if (isAuthRequest(event.request)) {
    console.log('🔐 Auth request detected, bypassing cache:', url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Handle API requests with NetworkFirst strategy
  if (isApiRequest(event.request) && isCacheableApi(event.request)) {
    console.log('📡 Cacheable API request:', url.pathname);
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle static assets with CacheFirst strategy
  if (isStaticAsset(event.request)) {
    console.log('📁 Static asset request:', url.pathname);
    event.respondWith(handleStaticAsset(event.request));
    return;
  }
  
  // For navigation requests, try cache first, then network
  if (event.request.mode === 'navigate') {
    console.log('🧭 Navigation request:', url.pathname);
    event.respondWith(handleNavigation(event.request));
    return;
  }
  
  // Default: just fetch from network
  event.respondWith(fetch(event.request));
});

// Helper function to check if request is authentication-related
function isAuthRequest(request) {
  const url = new URL(request.url);
  return AUTH_PATTERNS.some(pattern => pattern.test(url.pathname + url.search));
}

// Helper function to check if request is to our API
function isApiRequest(request) {
  return request.url.includes(API_BASE_URL);
}

// Helper function to check if API request can be cached
function isCacheableApi(request) {
  const url = new URL(request.url);
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Helper function to check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/.test(url.pathname);
}

// Handle API requests with NetworkFirst strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    console.log('🌐 Trying network for API request');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('✅ API response cached');
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Network failed for API request, trying cache');
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Returning cached API response');
      return cachedResponse;
    }
    
    // If no cache, return error
    throw error;
  }
}

// Handle static assets with CacheFirst strategy
async function handleStaticAsset(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('📦 Returning cached static asset');
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    console.log('🌐 Fetching static asset from network');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('✅ Static asset cached');
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Failed to fetch static asset');
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    console.log('🌐 Trying network for navigation');
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('❌ Network failed for navigation, trying cache');
    // If network fails, try to serve cached index.html
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      console.log('📦 Returning cached index.html for navigation');
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    console.log('🗑️ Cache cleared');
  }
});

console.log('🚀 InternRadar Service Worker loaded');