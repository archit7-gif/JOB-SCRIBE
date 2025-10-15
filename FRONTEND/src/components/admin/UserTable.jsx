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
  return (
    <div className="user-table">
      {/* SEARCH BAR - ALWAYS VISIBLE */}
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

      {/* LOADING STATE */}
      {loading ? (
        <LoadingSkeleton type="list" count={5} />
      ) : (
        <>
          {/* NO RESULTS */}
          {!users || users.length === 0 ? (
            <EmptyState
              icon="👥"
              title={search ? "No users found" : "No users yet"}
              message={search ? "Try adjusting your search" : "Users will appear here"}
            />
          ) : (
            /* USER CARDS */
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
          )}
        </>
      )}
    </div>
  )
}

export default UserTable

