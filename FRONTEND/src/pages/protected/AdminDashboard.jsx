import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoPeople, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'
import Card from '../../components/common/Card'
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

  // Filter out admin users from the list
  const nonAdminUsers = useMemo(() => {
    return filteredUsers.filter(u => u.role !== 'admin')
  }, [filteredUsers])

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats()
      if (response.success) {
        dispatch(setStats(response.stats))
      }
    } catch (error) {
      toast.error('Failed to load statistics')
    }
  }

  const fetchUsers = async () => {
    try {
      dispatch(setLoading(true))
      const response = await adminService.getUsers()
      if (response.success) {
        dispatch(setUsers(response))
      }
    } catch (error) {
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

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users and monitor system</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatsCard
          icon={<IoPeople />}
          label="Total Users"
          value={stats.totalUsers}
          color="#667eea"
        />
        <StatsCard
          icon={<IoCheckmarkCircle />}
          label="Active Users"
          value={stats.activeUsers}
          color="var(--color-success)"
        />
        <StatsCard
          icon={<IoCloseCircle />}
          label="Inactive Users"
          value={stats.inactiveUsers}
          color="var(--color-danger)"
        />
      </div>

      <Card className="users-card">
        <h2 className="users-title">User Management</h2>
        <UserTable
          users={nonAdminUsers}
          currentUserId={user?._id}
          search={search}
          onSearchChange={(value) => dispatch(setSearch(value))}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="small"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this user? All their data will be permanently removed.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser} loading={deleting}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard




