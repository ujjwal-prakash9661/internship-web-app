// PWA utilities for InternRadar

// Register service worker with proper auth handling
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('🗑️ Unregistered old service worker');
        }
        
        // Register our new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        });
        
        console.log('✅ Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New service worker available');
              // Optionally notify user about update
              notifyUserAboutUpdate(newWorker);
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
      }
    });
  }
};

// Notify user about service worker updates
const notifyUserAboutUpdate = (newWorker) => {
  // You can implement a UI notification here
  console.log('📢 App update available');
  
  // Auto-update for now (you can change this to ask user)
  newWorker.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
};

// Clear service worker cache (useful for debugging auth issues)
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      // Send message to service worker to clear its cache
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE'
        });
      }
      
      console.log('🗑️ All caches cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }
  return false;
};

// Unregister service worker completely (for troubleshooting)
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map(registration => 
        registration.unregister()
      );
      
      await Promise.all(unregisterPromises);
      console.log('🗑️ All service workers unregistered');
      return true;
    } catch (error) {
      console.error('❌ Failed to unregister service workers:', error);
      return false;
    }
  }
  return false;
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
};

// Get PWA install prompt
export const getPWAInstallPrompt = () => {
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('💾 PWA install prompt ready');
  });
  
  return {
    isAvailable: () => deferredPrompt !== null,
    show: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User ${outcome} the install prompt`);
        deferredPrompt = null;
        return outcome;
      }
      return null;
    }
  };
};

// Debug function to check service worker status
export const debugServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('🔍 Service Worker Debug Info:');
    console.log(`- Registrations count: ${registrations.length}`);
    
    registrations.forEach((registration, index) => {
      console.log(`- Registration ${index + 1}:`);
      console.log(`  - Scope: ${registration.scope}`);
      console.log(`  - State: ${registration.active?.state || 'inactive'}`);
      console.log(`  - Script URL: ${registration.active?.scriptURL || 'none'}`);
    });
    
    // Check cache status
    const cacheNames = await caches.keys();
    console.log(`- Cache count: ${cacheNames.length}`);
    cacheNames.forEach(name => console.log(`  - ${name}`));
    
    return {
      registrations: registrations.length,
      caches: cacheNames.length,
      controller: !!navigator.serviceWorker.controller
    };
  }
  
  return { error: 'Service Worker not supported' };
};