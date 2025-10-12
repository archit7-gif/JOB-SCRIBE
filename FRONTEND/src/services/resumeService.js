
import api from './api'

const resumeService = {
  // Get all resumes
  getResumes: async () => {
    const response = await api.get('/resumes')
    return response.data
  },

  // Get single resume
  getResume: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`)
    return response.data
  },

  // Create resume from text
  createResumeFromText: async (data) => {
    const response = await api.post('/resumes/text', data)
    return response.data
  },

  // Upload resume file
  uploadResumeFile: async (file, title) => {
    const formData = new FormData()
    formData.append('resumeFile', file)
    formData.append('title', title)
    
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Update resume
  updateResume: async (resumeId, data) => {
    const response = await api.put(`/resumes/${resumeId}`, data)
    return response.data
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`)
    return response.data
  },

  // Analyze resume
  analyzeResume: async (resumeId, analysisData) => {
    const response = await api.post(`/resumes/${resumeId}/analyze`, analysisData)
    return response.data
  },

  // Optimize resume
  optimizeResume: async (resumeId, optimizationData) => {
    const response = await api.post(`/resumes/${resumeId}/optimize`, optimizationData)
    return response.data
  },

  // Download optimized resume
  downloadOptimizedResume: async (resumeId, optimizationId) => {
    const response = await api.get(`/resumes/${resumeId}/download/${optimizationId}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default resumeService
