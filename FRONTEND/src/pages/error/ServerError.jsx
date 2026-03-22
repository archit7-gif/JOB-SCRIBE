import { useNavigate } from 'react-router-dom'
import { IoHomeOutline, IoRefreshOutline } from 'react-icons/io5'
import Button from '../../components/common/Button'
import './ErrorPage.css'

const ServerError = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">500</div>
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          We ran into an unexpected error on our end. Please try again or head back home.
        </p>
        <div className="error-actions">
          <Button variant="secondary" onClick={() => window.location.reload()} icon={<IoRefreshOutline />}>
            Try Again
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard')} icon={<IoHomeOutline />}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServerError
