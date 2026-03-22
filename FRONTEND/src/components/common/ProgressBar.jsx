import './ProgressBar.css'

const ProgressBar = ({ value, max = 100, label, showLabel = true, color, size = 'medium' }) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="progress-bar-wrapper">
      {showLabel && label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-count">{value}</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: color || 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
