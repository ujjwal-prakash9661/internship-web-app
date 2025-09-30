import React, { useState, useEffect } from 'react';
import { 
  clearServiceWorkerCache, 
  unregisterServiceWorker, 
  debugServiceWorker,
  isPWA,
  getPWAInstallPrompt
} from '../utils/pwaUtils.js';

const PWAControls = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [swInfo, setSWInfo] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // Initialize PWA install prompt
    const prompt = getPWAInstallPrompt();
    setInstallPrompt(prompt);
    
    // Check if install prompt is available
    const checkInstallability = () => {
      setIsInstallable(prompt.isAvailable());
    };
    
    checkInstallability();
    
    // Check periodically
    const interval = setInterval(checkInstallability, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    const success = await clearServiceWorkerCache();
    if (success) {
      alert('✅ Cache cleared successfully! The page will reload.');
      window.location.reload();
    } else {
      alert('❌ Failed to clear cache');
    }
  };

  const handleUnregisterSW = async () => {
    const success = await unregisterServiceWorker();
    if (success) {
      alert('✅ Service Worker unregistered! The page will reload.');
      window.location.reload();
    } else {
      alert('❌ Failed to unregister Service Worker');
    }
  };

  const handleDebugSW = async () => {
    const info = await debugServiceWorker();
    setSWInfo(info);
  };

  const handleInstallPWA = async () => {
    if (installPrompt && installPrompt.isAvailable()) {
      const outcome = await installPrompt.show();
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">PWA Controls</h3>
      
      <div className="space-y-4">
        {/* PWA Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">PWA Mode:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isPWA() ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
          }`}>
            {isPWA() ? 'Active' : 'Browser Mode'}
          </span>
        </div>

        {/* Install PWA */}
        {isInstallable && (
          <button
            onClick={handleInstallPWA}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            📱 Install as App
          </button>
        )}

        {/* Debug Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDebugSW}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            🔍 Debug SW
          </button>
          
          <button
            onClick={handleClearCache}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            🗑️ Clear Cache
          </button>
        </div>

        {/* Emergency Control */}
        <button
          onClick={handleUnregisterSW}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          ⚠️ Disable PWA (Troubleshoot Auth Issues)
        </button>

        {/* Service Worker Info */}
        {swInfo && (
          <div className="bg-black/20 rounded-lg p-4 mt-4">
            <h4 className="text-white font-semibold mb-2">Service Worker Status:</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Registrations: {swInfo.registrations || 0}</div>
              <div>Caches: {swInfo.caches || 0}</div>
              <div>Controller: {swInfo.controller ? '✅' : '❌'}</div>
              {swInfo.error && <div className="text-red-300">Error: {swInfo.error}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h4 className="text-blue-300 font-semibold mb-2">💡 Troubleshooting Auth Issues:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• If GitHub login fails, try "Clear Cache"</li>
          <li>• For persistent issues, use "Disable PWA"</li>
          <li>• After auth issues are fixed, reload to re-enable PWA</li>
        </ul>
      </div>
    </div>
  );
};

export default PWAControls;