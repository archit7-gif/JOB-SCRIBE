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

  const menuItems = [
    { path: '/dashboard', icon: <IoGrid />, label: 'Dashboard' },
    { path: '/jobs', icon: <IoBriefcase />, label: 'Jobs' },
    { path: '/resumes', icon: <IoDocument />, label: 'Resumes' },
    { path: '/notes', icon: <IoCreate />, label: 'Notes' },
    { path: '/profile', icon: <IoPerson />, label: 'Profile' }
  ]

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: <IoShield />, label: 'Admin' })
  }

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
      
      {/* Overlay renders AFTER sidebar for correct z-index stacking */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  )
}

export default Sidebar


