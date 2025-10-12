

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: [],
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
      state.users = action.payload.data
      state.pagination.total = action.payload.count
      state.loading = false
    },
    setStats: (state, action) => {
      state.stats = action.payload
    },
    updateUserStatus: (state, action) => {
      const index = state.users.findIndex(u => u._id === action.payload._id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
      // Update stats
      if (action.payload.isActive) {
        state.stats.activeUsers += 1
        state.stats.inactiveUsers -= 1
      } else {
        state.stats.activeUsers -= 1
        state.stats.inactiveUsers += 1
      }
    },
    removeUser: (state, action) => {
      state.users = state.users.filter(u => u._id !== action.payload)
      state.pagination.total -= 1
      state.stats.totalUsers -= 1
    },
    setSearch: (state, action) => {
      state.search = action.payload
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
