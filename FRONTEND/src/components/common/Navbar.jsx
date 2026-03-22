import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { IoLogOut, IoSettingsOutline, IoChevronDown, IoMenu } from 'react-icons/io5'
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
      toast.error('Logout failed')
      console.log(error)
    }
  }

  const initials = user?.fullname
    ? `${user.fullname.firstname?.[0] || ''}${user.fullname.lastname?.[0] || ''}`.toUpperCase()
    : 'U'

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left */}
        <div className="navbar-left">
          {isAuthenticated && (
            <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
              <IoMenu size={22} />
            </button>
          )}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
            <img src="/logo-icon.svg" alt="JobScribe" className="navbar-logo-img" />
            <span className="logo-text">Job<span>Scribe</span></span>
          </Link>
        </div>

        {/* Right */}
        <div className="navbar-right">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="navbar-user-menu">
              <button
                className="navbar-user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="navbar-user-avatar">{initials}</div>
                <span className="navbar-user-name">
                  {user?.fullname?.firstname || 'User'}
                </span>
                <IoChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>

              {showDropdown && (
                <>
                  <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
                  <div className="navbar-dropdown">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <IoSettingsOutline size={16} />
                      Profile &amp; Settings
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <IoLogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-signin-btn">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar