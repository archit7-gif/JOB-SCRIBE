

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import jobsReducer from './slices/jobsSlice'
import resumesReducer from './slices/resumesSlice'
import notesReducer from './slices/notesSlice'
import themeReducer from './slices/themeSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    resumes: resumesReducer,
    notes: notesReducer,
    theme: themeReducer,
    admin: adminReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
