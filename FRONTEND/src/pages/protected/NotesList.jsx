

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { IoAdd, IoCreateOutline } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import NoteCard from '../../components/notes/NoteCard'
import NoteForm from '../../components/notes/NoteForm'
import NoteFilters from '../../components/notes/NoteFilters'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import EmptyState from '../../components/common/EmptyState'
import { setNotes, addNote, setLoading } from '../../redux/slices/notesSlice'
import { setJobs } from '../../redux/slices/jobsSlice'
import noteService from '../../services/noteService'
import jobService from '../../services/jobService'
import './NotesList.css'

const NotesList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { notes, filters, loading } = useSelector((state) => state.notes)
  const { jobs } = useSelector((state) => state.jobs)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchNotes()
  }, [filters])

  useEffect(() => {
    // Auto-open create modal if coming from job detail
    if (location.state?.jobId) {
      setShowCreateModal(true)
    }
  }, [location.state])

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs()
      if (response.success) {
        dispatch(setJobs(response.data))
      }
    } catch (error) {
      console.error('Failed to load jobs')
      console.log(error)
    }
  }

  const fetchNotes = async () => {
    try {
      dispatch(setLoading(true))
      const response = await noteService.getAllNotes(filters)
      if (response.success) {
        dispatch(setNotes({ data: response.data, count: response.count }))
      }
    } catch (error) {
      toast.error('Failed to load notes')
      console.log(error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleCreateNote = async (data) => {
    try {
      setCreating(true)
      const response = await noteService.createNote(data)
      if (response.success) {
        dispatch(addNote(response.data))
        toast.success('Note created successfully')
        setShowCreateModal(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create note')
    } finally {
      setCreating(false)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesJob = !filters.jobId || note.jobId === filters.jobId
    const matchesSearch = !filters.search || 
      note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      note.content.toLowerCase().includes(filters.search.toLowerCase())
    return matchesJob && matchesSearch
  })

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          icon={<IoAdd />}
        >
          Create Note
        </Button>
      </div>

      <NoteFilters jobs={jobs} />

      {loading ? (
        <div className="notes-grid">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IoCreateOutline size={64} />}
          title={filters.search || filters.jobId ? "No notes found" : "No notes yet"}
          message={filters.search || filters.jobId ? "Try adjusting your filters" : "Create notes to track interview questions, feedback, and follow-ups"}
          actionText={!filters.search && !filters.jobId ? "Create Note" : null}
          onAction={() => setShowCreateModal(true)}
        />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Note"
        size="large"
      >
        <NoteForm 
          onSubmit={handleCreateNote} 
          loading={creating}
          jobs={jobs}
          initialData={location.state?.jobId ? { jobId: location.state.jobId } : {}}
        />
      </Modal>
    </div>
  )
}

export default NotesList
