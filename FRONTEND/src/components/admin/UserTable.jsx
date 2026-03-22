import { IoSearch } from 'react-icons/io5'
import UserCard from './UserCard'
import LoadingSkeleton from '../common/LoadingSkeleton'
import EmptyState from '../common/EmptyState'
import { IoPeopleOutline } from 'react-icons/io5'
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
    <div>
      {/* Search */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <IoSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '1rem', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5625rem 0.875rem 0.5625rem 2.25rem',
              height: 38,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text)',
              background: 'var(--color-input-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-dim)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '1.5rem' }}>
          <LoadingSkeleton type="card" count={4} />
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={<IoPeopleOutline size={48} />}
          title={search ? 'No users found' : 'No users yet'}
          message={search ? 'Try adjusting your search' : 'Users will appear here'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem 1.5rem' }}>
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
    </div>
  )
}

export default UserTable
