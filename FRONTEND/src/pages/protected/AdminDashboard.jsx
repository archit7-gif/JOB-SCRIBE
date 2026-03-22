import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoPeopleOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'
import StatsCard from '../../components/admin/StatsCard'
import UserTable from '../../components/admin/UserTable'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import {
  setStats,
  setUsers,
  setSearch,
  updateUserStatus as updateUserStatusAction,
  removeUser,
  setLoading
} from '../../redux/slices/adminSlice'
import adminService from '../../services/adminService'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats, filteredUsers, search, loading } = useSelector((state) => state.admin)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const nonAdminUsers = useMemo(() => filteredUsers.filter(u => u.role !== 'admin'), [filteredUsers])

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats()
      if (response.success) dispatch(setStats(response.stats))
    } catch {
      toast.error('Failed to load statistics')
    }
  }

  const fetchUsers = async () => {
    try {
      dispatch(setLoading(true))
      const response = await adminService.getUsers()
      if (response.success) dispatch(setUsers(response))
    } catch {
      toast.error('Failed to load users')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleToggleStatus = async (userId, isActive) => {
    try {
      const response = await adminService.updateUserStatus(userId, isActive)
      if (response.success) {
        dispatch(updateUserStatusAction(response.data))
        toast.success(response.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId)
    setShowDeleteModal(true)
  }

  const handleDeleteUser = async () => {
    try {
      setDeleting(true)
      const response = await adminService.deleteUser(selectedUserId)
      if (response.success) {
        dispatch(removeUser(selectedUserId))
        toast.success('User deleted successfully')
        setShowDeleteModal(false)
        fetchStats()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && !nonAdminUsers.length) {
    return (
      <div className="admin-page">
        <div className="admin-stats-grid">
          <LoadingSkeleton type="stat" count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users and monitor system health</p>
        </div>
        <span className="admin-badge">
          <IoShieldCheckmarkOutline size={14} />
          Admin
        </span>
      </div>

      <div className="admin-stats-grid">
        <StatsCard
          icon={<IoPeopleOutline size={22} />}
          label="Total Users"
          value={stats.totalUsers ?? '—'}
          color="#8b78f5"
          bg="rgba(108,92,231,0.12)"
        />
        <StatsCard
          icon={<IoCheckmarkCircleOutline size={22} />}
          label="Active Users"
          value={stats.activeUsers ?? '—'}
          color="#34d399"
          bg="rgba(16,185,129,0.12)"
        />
        <StatsCard
          icon={<IoCloseCircleOutline size={22} />}
          label="Inactive Users"
          value={stats.inactiveUsers ?? '—'}
          color="#f87171"
          bg="rgba(239,68,68,0.10)"
        />
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2 className="admin-table-title">All Users</h2>
          <span className="admin-table-count">{nonAdminUsers.length}</span>
        </div>
        <UserTable
          users={nonAdminUsers}
          currentUserId={user?._id}
          search={search}
          onSearchChange={(value) => dispatch(setSearch(value))}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
          Are you sure you want to permanently delete this user? All their data — jobs, resumes, and notes — will be removed and cannot be recovered.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser} loading={deleting}>Delete User</Button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard
