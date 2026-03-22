import './LoadingSkeleton.css'

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i)

  if (type === 'card') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-card-title" />
            <div className="skeleton skeleton-card-line" />
            <div className="skeleton skeleton-card-line" />
            <div className="skeleton skeleton-card-line" />
          </div>
        ))}
      </>
    )
  }

  if (type === 'stat') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton skeleton-stat-icon" />
            <div className="skeleton-stat-body">
              <div className="skeleton skeleton-stat-value" />
              <div className="skeleton skeleton-stat-label" />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'block') {
    return <div className="skeleton skeleton-block" />
  }

  if (type === 'text') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="skeleton skeleton-text" />
        ))}
      </>
    )
  }

  return <div className="skeleton skeleton-block" />
}

export default LoadingSkeleton
