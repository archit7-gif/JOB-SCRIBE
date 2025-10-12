

import api from './api'

const adminService = {
  // Get system statistics
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  // Get all users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    
    const response = await api.get(`/admin/users?${params.toString()}`)
    return response.data
  },

  // Get single user
  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive })
    return response.data
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  }
}

export default adminService
