import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoLogIn, IoEye, IoEyeOff } from 'react-icons/io5'
import Button from '../../components/common/Button'
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice'
import { validationRules } from '../../utils/validators'
import authService from '../../services/authService'
import './Auth.css'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data, event) => {
    if (event) {
      event.preventDefault()
    }

    try {
      dispatch(loginStart())
      const response = await authService.login(data)
      
      if (response.success) {
        dispatch(loginSuccess(response))
        
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
            <p className="auth-subtitle">Sign in to continue to JobScribe</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                {...register('email', validationRules.email)}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', validationRules.password)}
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>
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

