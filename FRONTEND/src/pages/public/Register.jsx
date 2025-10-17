

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoPersonAdd, IoEye, IoEyeOff } from 'react-icons/io5'
import Button from '../../components/common/Button'
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice'
import { validationRules } from '../../utils/validators'
import authService from '../../services/authService'
import './Auth.css'

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const password = watch('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart())
      
      const registerData = {
        fullname: {
          firstname: data.firstname,
          lastname: data.lastname
        },
        email: data.email,
        password: data.password
      }

      const response = await authService.register(registerData)
      
      if (response.success) {
        dispatch(loginSuccess(response))
        toast.success('Account created successfully!')
        
        if (response.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch(loginFailure(message))
      toast.error(message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your job search journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  {...register('firstname', validationRules.firstname)}
                  className={`form-input ${errors.firstname ? 'form-input-error' : ''}`}
                  placeholder="John"
                />
                {errors.firstname && <span className="form-error">{errors.firstname.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  {...register('lastname', validationRules.lastname)}
                  className={`form-input ${errors.lastname ? 'form-input-error' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastname && <span className="form-error">{errors.lastname.message}</span>}
              </div>
            </div>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', validationRules.confirmPassword(password))}
                  className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              fullWidth
              icon={<IoPersonAdd />}
            >
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
