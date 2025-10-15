
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const UserRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect admin to admin panel
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default UserRoute
