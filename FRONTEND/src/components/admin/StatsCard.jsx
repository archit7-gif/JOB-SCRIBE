
import './StatsCard.css'

const StatsCard = ({ icon, label, value, color }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stats-content">
        <p className="stats-label">{label}</p>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  )
}

export default StatsCard
