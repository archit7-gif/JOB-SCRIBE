
import api from './api'

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Get profile picture
  getProfilePicture: async () => {
    const response = await api.get('/profile/picture')
    return response.data
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('profilePicture', file)
    
    const response = await api.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/profile/picture')
    return response.data
  }
}

export default authService
