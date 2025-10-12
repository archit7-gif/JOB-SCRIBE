

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { 
  IoArrowBack, 
  IoTrash, 
  IoLocationOutline, 
  IoLinkOutline,
  IoCalendarOutline,
  IoCreate
} from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import JobStatusBadge from '../../components/jobs/JobStatusBadge'
import NoteCard from '../../components/notes/NoteCard'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import { setSelectedJob, updateJob as updateJobAction, deleteJob as deleteJobAction } from '../../redux/slices/jobsSlice'
import jobService from '../../services/jobService'
import noteService from '../../services/noteService'
import { JOB_STATUSES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import './JobDetail.css'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedJob } = useSelector((state) => state.jobs)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchJobDetails()
    fetchJobNotes()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await jobService.getJob(id)
      if (response.success) {
        dispatch(setSelectedJob(response.data))
      }
    } catch (error) {
      toast.error('Failed to load job details')
      navigate('/jobs')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobNotes = async () => {
    try {
      const response = await noteService.getNotesByJob(id)
      if (response.success) {
        setNotes(response.data)
      }
    } catch (error) {
      console.error('Failed to load notes')
      console.log(error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      const response = await jobService.updateJob(id, { ...selectedJob, status: newStatus })
      if (response.success) {
        dispatch(updateJobAction(response.data))
        dispatch(setSelectedJob(response.data))
        toast.success('Status updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update status')
      console.log(error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await jobService.deleteJob(id)
      if (response.success) {
        dispatch(deleteJobAction(id))
        toast.success('Job deleted successfully')
        navigate('/jobs')
      }
    } catch (error) {
      toast.error('Failed to delete job')
      setDeleting(false)
      console.log(error)
    }
  }

  if (loading) {
    return (
      <div className="job-detail-page">
        <LoadingSkeleton type="card" count={1} />
      </div>
    )
  }

  if (!selectedJob) {
    return null
  }

  return (
    <div className="job-detail-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          icon={<IoArrowBack />}
        >
          Back to Jobs
        </Button>
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
          icon={<IoTrash />}
        >
          Delete
        </Button>
      </div>

      <Card className="job-detail-card">
        <div className="job-detail-header">
          <div>
            <h1 className="job-detail-title">{selectedJob.title}</h1>
            <p className="job-detail-company">{selectedJob.company}</p>
          </div>
          <JobStatusBadge status={selectedJob.status} />
        </div>

        <div className="job-detail-meta">
          {selectedJob.location && (
            <div className="meta-item">
              <IoLocationOutline size={18} />
              <span>{selectedJob.location}</span>
            </div>
          )}
          {selectedJob.link && (
            <div className="meta-item">
              <IoLinkOutline size={18} />
              <a href={selectedJob.link} target="_blank" rel="noopener noreferrer">
                View Job Posting
              </a>
            </div>
          )}
          <div className="meta-item">
            <IoCalendarOutline size={18} />
            <span>Updated {formatDate(selectedJob.updatedAt)}</span>
          </div>
        </div>

        {selectedJob.description && (
          <div className="job-detail-section">
            <h3 className="section-title">Description</h3>
            <p className="job-description">{selectedJob.description}</p>
          </div>
        )}

        <div className="job-detail-section">
          <h3 className="section-title">Update Status</h3>
          <div className="status-buttons">
            {JOB_STATUSES.map((status) => (
              <Button
                key={status.value}
                variant={selectedJob.status === status.value ? 'primary' : 'secondary'}
                size="small"
                onClick={() => handleStatusChange(status.value)}
                disabled={updatingStatus}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="notes-section">
        <div className="notes-header">
          <h2 className="notes-title">Notes ({notes.length})</h2>
          <Button 
            variant="primary" 
            size="small"
            onClick={() => navigate('/notes', { state: { jobId: id } })}
            icon={<IoCreate />}
          >
            Add Note
          </Button>
        </div>

        {notes.length > 0 ? (
          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="no-notes">No notes yet. Add notes to track interview questions, feedback, or follow-ups.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job"
        size="small"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this job? This action cannot be undone.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default JobDetail
