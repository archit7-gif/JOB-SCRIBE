
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { IoCamera, IoTrash, IoLogOut } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import ThemeToggle from '../../components/common/ThemeToggle'
import { logout } from '../../redux/slices/authSlice'
import { validationRules } from '../../utils/validators'
import { getInitials } from '../../utils/formatters'
import authService from '../../services/authService'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mode } = useSelector((state) => state.theme)
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstname: user?.fullname?.firstname || '',
      lastname: user?.fullname?.lastname || ''
    }
  })

  useEffect(() => {
    fetchProfilePicture()
  }, [])

  const fetchProfilePicture = async () => {
    try {
      const response = await authService.getProfilePicture()
      if (response.success && response.data.profilePicture) {
        setProfilePicture(response.data.profilePicture)
      }
    } catch (error) {
      console.error('Failed to load profile picture')
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    try {
      setUploading(true)
      const response = await authService.uploadProfilePicture(file)
      if (response.success) {
        setProfilePicture(response.data.profilePicture.url)
        toast.success('Profile picture updated successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProfilePicture = async () => {
    try {
      const response = await authService.deleteProfilePicture()
      if (response.success) {
        setProfilePicture(null)
        toast.success('Profile picture deleted')
      }
    } catch (error) {
      toast.error('Failed to delete profile picture')
    }
  }

  const handleUpdateProfile = async (data) => {
    try {
      toast.info('Profile update feature coming soon')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logout())
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    try {
      setDeleting(true)
      toast.info('Account deletion feature coming soon')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="profile-page">
      <div className="page-header">

      </div>

      <div className="profile-grid">
        {/* Profile Header Card */}
        <Card className="profile-picture-card">
          <div className="profile-picture-container">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-initials">
                {getInitials(user?.fullname)}
              </div>
            )}
            <label className="profile-picture-upload">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleProfilePictureUpload}
                className="file-input-hidden"
                disabled={uploading}
              />
              <div className="upload-overlay">
                <IoCamera />
                <span>{uploading ? 'Uploading...' : 'Change'}</span>
              </div>
            </label>
          </div>

          <div className="profile-info-section">
            <h2 className="profile-name">
              {user?.fullname?.firstname} {user?.fullname?.lastname}
            </h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role-badge">
              {isAdmin ? 'Administrator' : 'User'}
            </span>
            {profilePicture && (
              <Button
                variant="danger"
                size="small"
                onClick={handleDeleteProfilePicture}
                icon={<IoTrash />}
              >
                Remove Photo
              </Button>
            )}
            <p className="profile-picture-note">JPG or PNG • Max 2MB</p>
          </div>
        </Card>

        {/* Account Information Card */}
        <Card className="profile-info-card">
          <h3 className="card-title">Account Information</h3>
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  {...register('firstname', validationRules.firstname)}
                  className={`form-input ${errors.firstname ? 'form-input-error' : ''}`}
                />
                {errors.firstname && <span className="form-error">{errors.firstname.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  {...register('lastname', validationRules.lastname)}
                  className={`form-input ${errors.lastname ? 'form-input-error' : ''}`}
                />
                {errors.lastname && <span className="form-error">{errors.lastname.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                className="form-input"
                disabled
              />
              <p className="field-note">Email cannot be changed</p>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Preferences Card - Only for Regular Users */}
        {!isAdmin && (
          <Card className="preferences-card">
            <h3 className="card-title">Preferences</h3>
            <div className="preference-item">
              <div className="preference-info">
                <p className="preference-label">Appearance</p>
                <p className="preference-description">
                  {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </Card>
        )}

        {/* Danger Zone - Only for Regular Users */}
        {!isAdmin && (
          <Card className="danger-zone-card">
            <h3 className="danger-title">Danger Zone</h3>
            <div className="danger-actions">
              <Button
                variant="secondary"
                onClick={handleLogout}
                icon={<IoLogOut />}
              >
                Logout
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                icon={<IoTrash />}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Modal */}
      {!isAdmin && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
          size="small"
        >
          <div className="delete-account-modal">
            <p className="delete-warning">
              ⚠️ This action is permanent and cannot be undone. All your jobs, resumes, and notes will be deleted.
            </p>
            <div className="form-group">
              <label className="form-label">Type <strong>DELETE</strong> to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="form-input"
                placeholder="DELETE"
              />
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                loading={deleting}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Profile



