
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout Components
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'

// Route Guards
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'

// Public Pages
import Welcome from './pages/public/Welcome'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

// Protected Pages
import Dashboard from './pages/protected/Dashboard'
import JobsList from './pages/protected/JobsList'
import JobDetail from './pages/protected/JobDetail'
import AddJob from './pages/protected/AddJob'
import ResumesList from './pages/protected/ResumesList'
import ResumeDetail from './pages/protected/ResumeDetail'
import NotesList from './pages/protected/NotesList'
import NoteDetail from './pages/protected/NoteDetail'
import Profile from './pages/protected/Profile'
import AdminDashboard from './pages/protected/AdminDashboard'

// Error Pages
import NotFound from './pages/error/NotFound'
import ServerError from './pages/error/ServerError'

// Redux
import { setUser, logout } from './redux/slices/authSlice'
import { setTheme } from './redux/slices/themeSlice'
import authService from './services/authService'

function AppContent() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth)
  const { mode } = useSelector((state) => state.theme)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    dispatch(setTheme(savedTheme))
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [dispatch])

  // Update theme when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authService.getMe()
          if (response.success) {
            dispatch(setUser(response.user))
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          dispatch(logout())
        }
      }
      setInitializing(false)
    }

    checkAuth()
  }, [dispatch])

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setSidebarOpen(false)
      
      // Clear auth state first
      dispatch(logout())
      
      // Then show toast and navigate
      toast.success('Logged out successfully')
      navigate('/login')
      
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    }
  }

  // Show loading screen while initializing
  if (initializing) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  // Helper function to determine redirect path
  const getRedirectPath = () => {
    if (!isAuthenticated) return null
    return user?.role === 'admin' ? '/admin' : '/dashboard'
  }

  return (
    <div className="app-layout">
      <Navbar onMenuClick={handleMenuClick} />
      
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
          onLogout={handleLogout}
        />
      )}

      <main className="app-main">
        <div className={`app-content ${isAuthenticated ? 'app-content-with-sidebar' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated 
                  ? <Navigate to={getRedirectPath()} replace /> 
                  : <Welcome />
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated 
                  ? <Navigate to={getRedirectPath()} replace /> 
                  : <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated 
                  ? <Navigate to={getRedirectPath()} replace /> 
                  : <Register />
              } 
            />

            {/* Protected Routes - Regular Users Only */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />}
                </ProtectedRoute>
              } 
            />

            {/* Jobs Routes */}
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <JobsList />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/add" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AddJob />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/:id" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <JobDetail />}
                </ProtectedRoute>
              } 
            />

            {/* Resumes Routes */}
            <Route 
              path="/resumes" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <ResumesList />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resumes/:id" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <ResumeDetail />}
                </ProtectedRoute>
              } 
            />

            {/* Notes Routes */}
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <NotesList />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notes/:id" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <NoteDetail />}
                </ProtectedRoute>
              } 
            />

            {/* Profile Route - Available to All */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Error Routes */}
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App



