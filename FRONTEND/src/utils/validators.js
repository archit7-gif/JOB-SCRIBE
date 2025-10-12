
// Email validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Password validation (8-50 chars)
export const validatePassword = (password) => {
  return password && password.length >= 8 && password.length <= 50
}

// Name validation (2-30 chars)
export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 30
}

// Required field validation
export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Form validation rules for react-hook-form
export const validationRules = {
  firstname: {
    required: 'First name is required',
    minLength: { value: 2, message: 'First name must be at least 2 characters' },
    maxLength: { value: 30, message: 'First name must not exceed 30 characters' }
  },
  lastname: {
    required: 'Last name is required',
    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
    maxLength: { value: 30, message: 'Last name must not exceed 30 characters' }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    maxLength: { value: 50, message: 'Password must not exceed 50 characters' }
  },
  confirmPassword: (password) => ({
    required: 'Please confirm your password',
    validate: (value) => value === password || 'Passwords do not match'
  }),
  jobTitle: {
    required: 'Job title is required',
    minLength: { value: 2, message: 'Title must be at least 2 characters' },
    maxLength: { value: 100, message: 'Title must not exceed 100 characters' }
  },
  company: {
    required: 'Company name is required',
    minLength: { value: 2, message: 'Company must be at least 2 characters' },
    maxLength: { value: 100, message: 'Company must not exceed 100 characters' }
  },
  resumeTitle: {
    required: 'Resume title is required',
    minLength: { value: 2, message: 'Title must be at least 2 characters' },
    maxLength: { value: 100, message: 'Title must not exceed 100 characters' }
  },
  resumeContent: {
    required: 'Resume content is required',
    minLength: { value: 10, message: 'Content must be at least 10 characters' },
    maxLength: { value: 10000, message: 'Content must not exceed 10,000 characters' }
  },
  noteTitle: {
    required: 'Note title is required',
    minLength: { value: 2, message: 'Title must be at least 2 characters' },
    maxLength: { value: 100, message: 'Title must not exceed 100 characters' }
  },
  noteContent: {
    required: 'Note content is required',
    minLength: { value: 1, message: 'Content is required' },
    maxLength: { value: 5000, message: 'Content must not exceed 5,000 characters' }
  },
  jobDescription: {
    required: 'Job description is required',
    minLength: { value: 10, message: 'Description must be at least 10 characters' },
    maxLength: { value: 5000, message: 'Description must not exceed 5,000 characters' }
  }
}
