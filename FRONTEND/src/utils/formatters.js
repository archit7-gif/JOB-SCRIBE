// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  const now = new Date()
  
  // Reset time to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  const diffTime = today - compareDate
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  
  return formatDate(date)
}

// Get user initials
export const getInitials = (fullname) => {
  if (!fullname) return 'U'
  
  const { firstname = '', lastname = '' } = fullname
  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

// Truncate text
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Validate file type
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

// Validate file size
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize
}
