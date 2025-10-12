
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { IoMenu, IoPersonCircle, IoLogOut, IoSettings } from 'react-icons/io5'
import { logout } from '../../redux/slices/authSlice'
import ThemeToggle from './ThemeToggle'
import authService from '../../services/authService'
import { toast } from 'react-toastify'
import './Navbar.css'

const Navbar = ({ onMenuClick }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [showDropdown, setShowDropdown] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logout())
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed',)
      console.log(error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Menu + Logo */}
        <div className="navbar-left">
          {isAuthenticated && (
            <button className="navbar-menu-btn" onClick={onMenuClick}>
              <IoMenu size={24} />
            </button>
          )}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
            <span className="logo-text">JobScribe</span>
          </Link>
        </div>

        {/* Right: Theme Toggle + Auth */}
        <div className="navbar-right">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="navbar-user-menu">
              <button 
                className="navbar-user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <IoPersonCircle size={24} />
                <span className="navbar-user-name">
                  {user?.fullname?.firstname || 'User'}
                </span>
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="navbar-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <IoSettings size={18} />
                      Profile & Settings
                    </Link>
                    <button 
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <IoLogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-signin-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
