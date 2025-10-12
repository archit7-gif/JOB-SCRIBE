

import { IoSearch } from 'react-icons/io5'
import UserCard from './UserCard'
import LoadingSkeleton from '../common/LoadingSkeleton'
import EmptyState from '../common/EmptyState'
import './UserTable.css'

const UserTable = ({ 
  users, 
  currentUserId,
  search,
  onSearchChange,
  onToggleStatus, 
  onDelete,
  loading = false 
}) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={5} />
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title={search ? "No users found" : "No users yet"}
        message={search ? "Try adjusting your search" : "Users will appear here"}
      />
    )
  }

  return (
    <div className="user-table">
      <div className="user-table-header">
        <div className="search-input-wrapper">
          <IoSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="user-list">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            currentUserId={currentUserId}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default UserTable
