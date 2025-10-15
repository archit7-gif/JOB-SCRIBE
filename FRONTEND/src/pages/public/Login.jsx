

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoLogIn } from 'react-icons/io5'
import Button from '../../components/common/Button'
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice'
import { validationRules } from '../../utils/validators'
import authService from '../../services/authService'
import './Auth.css'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth) // Added user

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate]) // Added user to dependencies

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart())
      const response = await authService.login(data)
      
      if (response.success) {
        dispatch(loginSuccess(response))
        
        // Redirect based on role
        if (response.user.role === 'admin') {
          toast.success(`Welcome, Admin ${response.user.fullname.firstname}!`)
          navigate('/admin')
        } else {
          toast.success(`Welcome back, ${response.user.fullname.firstname}!`)
          navigate('/dashboard')
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch(loginFailure(message))
      toast.error(message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your JobScribe account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                {...register('email', validationRules.email)}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                {...register('password', validationRules.password)}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              fullWidth
              icon={<IoLogIn />}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
