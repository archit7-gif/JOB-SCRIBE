
import api from './api'

const jobService = {
  // Get all jobs with optional filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    
    const response = await api.get(`/jobs?${params.toString()}`)
    return response.data
  },

  // Get single job
  getJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  },

  // Create job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData)
    return response.data
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData)
    return response.data
  },

  // Delete job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`)
    return response.data
  }
}

export default jobService
