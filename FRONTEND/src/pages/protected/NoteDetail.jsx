import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { IoArrowBack, IoTrash, IoCreate } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import { 
  setSelectedNote, 
  updateNote as updateNoteAction,
  deleteNote as deleteNoteAction 
} from '../../redux/slices/notesSlice'
import noteService from '../../services/noteService'
import { formatDate } from '../../utils/formatters'
import './NoteDetail.css'

const NoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedNote } = useSelector((state) => state.notes)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    fetchNoteDetails()
  }, [id])

  useEffect(() => {
    if (selectedNote && showEditModal) {
      reset({
        title: selectedNote.title,
        content: selectedNote.content
      })
    }
  }, [selectedNote, showEditModal, reset])

  const fetchNoteDetails = async () => {
    try {
      setLoading(true)
      const response = await noteService.getNote(id)
      if (response.success) {
        dispatch(setSelectedNote(response.data))
      }
    } catch (error) {
      toast.error('Failed to load note')
      navigate('/notes')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNote = async (data) => {
    try {
      setUpdating(true)
      const response = await noteService.updateNote(id, data)
      if (response.success) {
        dispatch(updateNoteAction(response.data))
        dispatch(setSelectedNote(response.data))
        toast.success('Note updated successfully')
        setShowEditModal(false)
      }
    } catch (error) {
      toast.error('Failed to update note')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await noteService.deleteNote(id)
      if (response.success) {
        dispatch(deleteNoteAction(id))
        toast.success('Note deleted successfully')
        navigate('/notes')
      }
    } catch (error) {
      toast.error('Failed to delete note')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="note-detail-page">
        <LoadingSkeleton type="card" count={1} />
      </div>
    )
  }

  if (!selectedNote) {
    return null
  }

  return (
    <div className="note-detail-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/notes')}
          icon={<IoArrowBack />}
        >
          Back to Notes
        </Button>
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => setShowEditModal(true)}
            icon={<IoCreate />}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            icon={<IoTrash />}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="note-detail-card">
        <div className="note-header">
          <h1 className="note-title">{selectedNote.title}</h1>
          <p className="note-date">Last updated: {formatDate(selectedNote.updatedAt)}</p>
        </div>

        <div className="note-content">
          {selectedNote.contentHTML ? (
            <div 
              className="note-html-content"
              dangerouslySetInnerHTML={{ __html: selectedNote.contentHTML }}
            />
          ) : (
            <pre className="note-text-content">{selectedNote.content}</pre>
          )}
        </div>
      </Card>

      {/* Edit Note Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Note"
        size="medium"
      >
        <form onSubmit={handleSubmit(handleUpdateNote)} className="edit-note-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className={`form-input ${errors.content ? 'form-input-error' : ''}`}
              rows="12"
            />
            {errors.content && <span className="form-error">{errors.content.message}</span>}
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Note"
        size="small"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this note? This action cannot be undone.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default NoteDetail

