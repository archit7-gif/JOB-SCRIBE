import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  allUsers: [],        // ALL users from API
  filteredUsers: [],   // Filtered users for display
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  search: '',
  loading: false,
  error: null
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setUsers: (state, action) => {
      // Store all users
      state.allUsers = action.payload.data
      state.pagination.total = action.payload.count
      
      // Apply current search filter if exists
      if (state.search) {
        const searchLower = state.search.toLowerCase()
        state.filteredUsers = state.allUsers.filter(user => {
          const fullName = `${user.fullname?.firstname || ''} ${user.fullname?.lastname || ''}`.toLowerCase()
          const email = (user.email || '').toLowerCase()
          return fullName.includes(searchLower) || email.includes(searchLower)
        })
      } else {
        state.filteredUsers = state.allUsers
      }
      
      state.loading = false
    },
    setStats: (state, action) => {
      state.stats = action.payload
    },
    updateUserStatus: (state, action) => {
      const updatedUser = action.payload
      
      // Update in allUsers
      const allIndex = state.allUsers.findIndex(u => u._id === updatedUser._id)
      if (allIndex !== -1) {
        state.allUsers[allIndex] = updatedUser
      }
      
      // Update in filteredUsers
      const filteredIndex = state.filteredUsers.findIndex(u => u._id === updatedUser._id)
      if (filteredIndex !== -1) {
        state.filteredUsers[filteredIndex] = updatedUser
      }
      
      // Update stats
      if (updatedUser.isActive) {
        state.stats.activeUsers += 1
        state.stats.inactiveUsers -= 1
      } else {
        state.stats.activeUsers -= 1
        state.stats.inactiveUsers += 1
      }
    },
    removeUser: (state, action) => {
      // Remove from both arrays
      state.allUsers = state.allUsers.filter(u => u._id !== action.payload)
      state.filteredUsers = state.filteredUsers.filter(u => u._id !== action.payload)
      
      state.pagination.total -= 1
      state.stats.totalUsers -= 1
    },
    setSearch: (state, action) => {
      state.search = action.payload
      
      // Filter users immediately (client-side)
      if (action.payload) {
        const searchLower = action.payload.toLowerCase()
        state.filteredUsers = state.allUsers.filter(user => {
          const fullName = `${user.fullname?.firstname || ''} ${user.fullname?.lastname || ''}`.toLowerCase()
          const email = (user.email || '').toLowerCase()
          return fullName.includes(searchLower) || email.includes(searchLower)
        })
      } else {
        // If search is empty, show all users
        state.filteredUsers = state.allUsers
      }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  setLoading,
  setUsers,
  setStats,
  updateUserStatus,
  removeUser,
  setSearch,
  setPagination,
  setError,
  clearError
} = adminSlice.actions

export default adminSlice.reducer

