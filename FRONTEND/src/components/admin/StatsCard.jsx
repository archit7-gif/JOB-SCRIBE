import './StatsCard.css'

const StatsCard = ({ icon, label, value, color, bg }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: bg || 'var(--color-primary-dim)', color: color || 'var(--color-primary)' }}>
        {icon}
      </div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  )
}

export default StatsCard
