import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from './context/AuthContext.jsx'
import {SearchProvider} from './context/SearchContext.jsx'
import {UserDataProvider} from './context/UserDataContext.jsx'
import { registerServiceWorker } from './utils/pwaUtils.js'

// Initialize PWA features
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserDataProvider>
      <AuthProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </AuthProvider>
    </UserDataProvider>
  </StrictMode>
)
