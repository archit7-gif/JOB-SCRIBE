import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://job-scribe.onrender.com')
  : '' 

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'
    const url     = error.config?.url || ''

    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 429) {
      return Promise.reject(error)
    }

    if (status === 401) {
      if (!isAuthRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
    } else if (status === 403) {
      if (!isAuthRequest) toast.error('You do not have permission to perform this action')
    } else if (status === 404) {
      if (!url.includes('/jobs/') && !url.includes('/resumes/') && !url.includes('/notes/')) {
        toast.error('Resource not found')
      }
    } else if (status === 409) {
      // duplicate — let component handle
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 400) {
      // validation — let component handle
    } else {
      if (!isAuthRequest) toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api