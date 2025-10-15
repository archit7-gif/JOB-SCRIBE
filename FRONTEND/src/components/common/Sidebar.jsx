

import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  IoGrid, 
  IoBriefcase, 
  IoDocument, 
  IoCreate, 
  IoPerson,
  IoShield,
  IoLogOut
} from 'react-icons/io5'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const { user } = useSelector((state) => state.auth)

  // Admin only sees Dashboard and Profile
  const adminMenuItems = [
    { path: '/admin', icon: <IoShield />, label: 'Admin Dashboard' },
    { path: '/profile', icon: <IoPerson />, label: 'Profile' }
  ]

  // Regular users see all menu items
  const userMenuItems = [
    { path: '/dashboard', icon: <IoGrid />, label: 'Dashboard' },
    { path: '/jobs', icon: <IoBriefcase />, label: 'Jobs' },
    { path: '/resumes', icon: <IoDocument />, label: 'Resumes' },
    { path: '/notes', icon: <IoCreate />, label: 'Notes' },
    { path: '/profile', icon: <IoPerson />, label: 'Profile' }
  ]

  // Choose menu items based on role
  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}

          <button className="sidebar-link sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon"><IoLogOut /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </nav>
      </aside>
      
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  )
}

export default Sidebar



