import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Settings from './pages/Settings'
import RecommendedInternships from './pages/RecommendedInternships'
import MyApplications from './pages/MyApplications'
import ProtectedRoute from './components/ProtectedRoute'
import GithubOAuthHandler from './pages/GithubOAuthHandler'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <div className='font-sans'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={ <Login/> } />
          <Route path='/register' element={ <Register /> } />
          <Route path='/oauth/github/callback' element={<GithubOAuthHandler />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<Dashboard />}/>
            <Route path='/profile' element={<Profile />}/>
            <Route path='/settings' element={<Settings />}/>
            <Route path='/recommended' element={<RecommendedInternships />}/>
            <Route path='/applications' element={<MyApplications />}/>
          </Route>
        </Routes>
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  )
}

export default App