export const JOB_STATUSES = [
  { value: 'saved',        label: 'Saved',        color: '#8b949e' },
  { value: 'applied',      label: 'Applied',      color: '#60a5fa' },
  { value: 'interviewing', label: 'Interviewing', color: '#fbbf24' },
  { value: 'offer',        label: 'Offer',        color: '#34d399' },
  { value: 'rejected',     label: 'Rejected',     color: '#f87171' },
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
  NOT_FOUND: '*',
}

export const FILE_TYPES = {
  RESUME: {
    accept: '.pdf,.docx',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  PROFILE_PICTURE: {
    accept: '.jpg,.jpeg,.png',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
  },
}

export const RATE_LIMITS = {
  AI_ANALYSIS: 10,
  FILE_UPLOAD: 20,
}
