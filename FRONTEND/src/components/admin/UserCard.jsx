import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTrashOutline } from 'react-icons/io5'
import Button from '../common/Button'
import { formatDate, getInitials } from '../../utils/formatters'
import './UserCard.css'

const UserCard = ({ user, onToggleStatus, onDelete, loading = false }) => {
  const initials = getInitials ? getInitials(user.fullname) : `${user.fullname.firstname?.[0] || ''}${user.fullname.lastname?.[0] || ''}`.toUpperCase()

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-card-avatar">
          {user.profilePicture?.url ? (
            <img src={user.profilePicture.url} alt={user.fullname.firstname} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="user-card-info">
          <h3 className="user-card-name">
            {user.fullname.firstname} {user.fullname.lastname}
          </h3>
          <p className="user-card-email">{user.email}</p>
        </div>
        <span className={`admin-role-badge role-${user.role}`}>{user.role}</span>
      </div>

      <div className="user-card-meta">
        <div className="user-card-stat">
          <div className="user-card-stat-value">{formatDate(user.createdAt)}</div>
          <div className="user-card-stat-label">Joined</div>
        </div>
        <span
          className="status-badge"
          style={
            user.isActive
              ? { background: 'rgba(16,185,129,0.12)', color: '#34d399' }
              : { background: 'rgba(239,68,68,0.10)', color: '#f87171' }
          }
        >
          <span className="status-badge-dot" style={{ background: user.isActive ? '#34d399' : '#f87171' }} />
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="user-card-actions">
        <Button
          variant={user.isActive ? 'danger' : 'success'}
          size="small"
          onClick={() => onToggleStatus(user._id, !user.isActive)}
          disabled={loading}
          icon={user.isActive ? <IoCloseCircleOutline /> : <IoCheckmarkCircleOutline />}
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onDelete(user._id)}
          disabled={loading}
          icon={<IoTrashOutline />}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default UserCard
