import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'
    const url = error.config?.url || ''

    // Check if this is a login or register request
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401) {
      // Only logout and redirect if it's NOT a login/register request
      if (!isAuthRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
      // For login failures, let the component handle the error
    } else if (status === 403) {
      if (!isAuthRequest) {
        toast.error('You do not have permission to perform this action')
      }
    } else if (status === 404) {
      // Only show for non-specific resource requests
      if (!url.includes('/jobs/') && !url.includes('/resumes/') && !url.includes('/notes/')) {
        toast.error('Resource not found')
      }
    } else if (status === 409) {
      // Let component handle duplicate errors (e.g., email already exists)
      // Don't show toast here
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 400) {
      // Validation errors - let component handle
    } else {
      // Only show toast for non-auth requests
      if (!isAuthRequest) {
        toast.error(message)
      }
    }

    return Promise.reject(error)
  }
)

export default api
