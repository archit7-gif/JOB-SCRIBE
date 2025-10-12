

import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  return savedTheme || 'dark'
}

const initialState = {
  mode: getInitialTheme()
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.mode)
      document.documentElement.setAttribute('data-theme', state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('theme', action.payload)
      document.documentElement.setAttribute('data-theme', action.payload)
    }
  }
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
