

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  resumes: [],
  selectedResume: null,
  currentAnalysis: null,
  loading: false,
  analyzing: false,
  optimizing: false,
  error: null
}

const resumesSlice = createSlice({
  name: 'resumes',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setAnalyzing: (state, action) => {
      state.analyzing = action.payload
    },
    setOptimizing: (state, action) => {
      state.optimizing = action.payload
    },
    setResumes: (state, action) => {
      state.resumes = action.payload
      state.loading = false
    },
    addResume: (state, action) => {
      state.resumes.unshift(action.payload)
    },
    updateResume: (state, action) => {
      const index = state.resumes.findIndex(r => r._id === action.payload._id)
      if (index !== -1) {
        state.resumes[index] = action.payload
      }
      if (state.selectedResume?._id === action.payload._id) {
        state.selectedResume = action.payload
      }
    },
    deleteResume: (state, action) => {
      state.resumes = state.resumes.filter(r => r._id !== action.payload)
      if (state.selectedResume?._id === action.payload) {
        state.selectedResume = null
      }
    },
    setSelectedResume: (state, action) => {
      state.selectedResume = action.payload
    },
    setCurrentAnalysis: (state, action) => {
      state.currentAnalysis = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
      state.analyzing = false
      state.optimizing = false
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  setLoading,
  setAnalyzing,
  setOptimizing,
  setResumes,
  addResume,
  updateResume,
  deleteResume,
  setSelectedResume,
  setCurrentAnalysis,
  setError,
  clearError
} = resumesSlice.actions

export default resumesSlice.reducer
