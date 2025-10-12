
import api from './api'

const noteService = {
  // Get all notes with filters
  getAllNotes: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/notes?${params.toString()}`)
    return response.data
  },

  // Get notes by job
  getNotesByJob: async (jobId) => {
    const response = await api.get(`/notes/job/${jobId}`)
    return response.data
  },

  // Get single note
  getNote: async (noteId) => {
    const response = await api.get(`/notes/${noteId}`)
    return response.data
  },

  // Create note
  createNote: async (noteData) => {
    const response = await api.post('/notes', noteData)
    return response.data
  },

  // Update note
  updateNote: async (noteId, noteData) => {
    const response = await api.put(`/notes/${noteId}`, noteData)
    return response.data
  },

  // Delete note
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`)
    return response.data
  }
}

export default noteService
