

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notes: [],
  selectedNote: null,
  filters: {
    search: '',
    jobId: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  loading: false,
  error: null
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setNotes: (state, action) => {
      state.notes = action.payload.data
      state.pagination.total = action.payload.count || action.payload.data.length
      state.loading = false
    },
    addNote: (state, action) => {
      state.notes.unshift(action.payload)
      state.pagination.total += 1
    },
    updateNote: (state, action) => {
      const index = state.notes.findIndex(n => n._id === action.payload._id)
      if (index !== -1) {
        state.notes[index] = action.payload
      }
      if (state.selectedNote?._id === action.payload._id) {
        state.selectedNote = action.payload
      }
    },
    deleteNote: (state, action) => {
      state.notes = state.notes.filter(n => n._id !== action.payload)
      state.pagination.total -= 1
      if (state.selectedNote?._id === action.payload) {
        state.selectedNote = null
      }
    },
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  setLoading,
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setSelectedNote,
  setFilters,
  setPagination,
  setError,
  clearError
} = notesSlice.actions

export default notesSlice.reducer
