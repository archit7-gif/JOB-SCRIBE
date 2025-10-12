

export const JOB_STATUSES = [
  { value: 'saved', label: 'Saved', color: '#6e7681' },
  { value: 'applied', label: 'Applied', color: '#1f6feb' },
  { value: 'interviewing', label: 'Interviewing', color: '#d29922' },
  { value: 'offer', label: 'Offer', color: '#238636' },
  { value: 'rejected', label: 'Rejected', color: '#da3633' }
]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  ADD_JOB: '/jobs/add',
  RESUMES: '/resumes',
  RESUME_DETAIL: '/resumes/:id',
  NOTES: '/notes',
  PROFILE: '/profile',
  ADMIN: '/admin',
  NOT_FOUND: '*'
}

export const FILE_TYPES = {
  RESUME: {
    accept: '.pdf,.docx',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  PROFILE_PICTURE: {
    accept: '.jpg,.jpeg,.png',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png']
  }
}

export const RATE_LIMITS = {
  AI_ANALYSIS: 10,
  FILE_UPLOAD: 20
}
