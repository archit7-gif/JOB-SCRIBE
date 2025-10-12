
import './LoadingSkeleton.css'

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (type === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-footer">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'list') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-circle"></div>
            <div className="skeleton-list-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'stat') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton-number"></div>
            <div className="skeleton-label"></div>
          </div>
        ))}
      </>
    )
  }

  return <div className="skeleton-block"></div>
}

export default LoadingSkeleton
