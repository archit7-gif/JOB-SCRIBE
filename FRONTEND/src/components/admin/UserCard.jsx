
import { IoCheckmarkCircle, IoCloseCircle, IoTrash, IoPerson } from 'react-icons/io5'
import Button from '../common/Button'
import { formatDate, getInitials } from '../../utils/formatters'
import './UserCard.css'

const UserCard = ({ user, currentUserId, onToggleStatus, onDelete, loading = false }) => {
  const isCurrentUser = user._id === currentUserId

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {user.profilePicture?.url ? (
            <img src={user.profilePicture.url} alt={user.fullname.firstname} />
          ) : (
            <div className="user-initials">
              {getInitials(user.fullname)}
            </div>
          )}
        </div>
        <div className="user-info">
          <h3 className="user-name">
            {user.fullname.firstname} {user.fullname.lastname}
          </h3>
          <p className="user-email">{user.email}</p>
          <div className="user-meta">
            <span className={`user-status ${user.isActive ? 'status-active' : 'status-inactive'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="user-card-footer">
        <p className="user-joined">Joined {formatDate(user.createdAt)}</p>
        <div className="user-actions">
          <Button
            variant={user.isActive ? 'danger' : 'success'}
            size="small"
            onClick={() => onToggleStatus(user._id, !user.isActive)}
            disabled={isCurrentUser || loading}
            icon={user.isActive ? <IoCloseCircle /> : <IoCheckmarkCircle />}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(user._id)}
            disabled={isCurrentUser || loading}
            icon={<IoTrash />}
          >
            Delete
          </Button>
        </div>
      </div>

      {isCurrentUser && (
        <div className="self-protection-notice">
          Cannot modify your own account
        </div>
      )}
    </div>
  )
}

export default UserCard
