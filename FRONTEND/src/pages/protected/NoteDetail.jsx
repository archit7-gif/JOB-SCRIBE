
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack, IoTrash, IoCreate } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import { 
  setSelectedNote, 
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
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchNoteDetails()
  }, [id])

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

  const handleEdit = () => {
    // Navigate to edit mode or open edit modal
    toast.info('Edit functionality coming soon!')
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
            onClick={handleEdit}
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
