import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  IoGridOutline,
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
} from 'react-icons/io5'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const { user } = useSelector((state) => state.auth)

  const adminMenuItems = [
    { path: '/admin', icon: <IoShieldCheckmarkOutline />, label: 'Admin Dashboard' },
    { path: '/profile', icon: <IoPersonOutline />, label: 'Profile' },
  ]

  const userMenuItems = [
    { path: '/dashboard', icon: <IoGridOutline />, label: 'Dashboard' },
    { path: '/jobs', icon: <IoBriefcaseOutline />, label: 'Jobs' },
    { path: '/resumes', icon: <IoDocumentTextOutline />, label: 'Resumes' },
    { path: '/notes', icon: <IoCreateOutline />, label: 'Notes' },
    { path: '/profile', icon: <IoPersonOutline />, label: 'Profile' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/admin'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon"><IoLogOutOutline /></span>
            <span className="sidebar-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  )
}

export default Sidebar
