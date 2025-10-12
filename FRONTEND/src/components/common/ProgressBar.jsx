
import './ProgressBar.css'

const ProgressBar = ({ value, max = 100, label, showLabel = true, color, size = 'medium' }) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="progress-bar-container">
      {showLabel && label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-value">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress-bar progress-bar-${size}`}>
        <div 
          className="progress-bar-fill"
          style={{ 
            width: `${percentage}%`,
            background: color || 'var(--color-primary)'
          }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
