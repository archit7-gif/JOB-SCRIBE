
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  jobs: [],
  selectedJob: null,
  filters: {
    status: '',
    search: ''
  },
  loading: false,
  error: null
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setJobs: (state, action) => {
      state.jobs = action.payload
      state.loading = false
      state.error = null
    },
    addJob: (state, action) => {
      state.jobs.unshift(action.payload)
    },
    updateJob: (state, action) => {
      const index = state.jobs.findIndex(j => j._id === action.payload._id)
      if (index !== -1) {
        state.jobs[index] = action.payload
      }
      if (state.selectedJob?._id === action.payload._id) {
        state.selectedJob = action.payload
      }
    },
    deleteJob: (state, action) => {
      state.jobs = state.jobs.filter(j => j._id !== action.payload)
      if (state.selectedJob?._id === action.payload) {
        state.selectedJob = null
      }
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
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
  setJobs, 
  addJob, 
  updateJob, 
  deleteJob, 
  setSelectedJob, 
  setFilters, 
  setError, 
  clearError 
} = jobsSlice.actions

export default jobsSlice.reducer
