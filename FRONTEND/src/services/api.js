
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

    if (status === 401) {
      // Unauthorized - clear auth and redirect
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action')
    } else if (status === 404) {
      toast.error('Resource not found')
    } else if (status === 409) {
      toast.error(message)
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 400) {
      // Validation errors - don't show generic toast here
      // Individual forms will handle validation errors
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
