import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../redux/slices/jobsSlice'
import { JOB_STATUSES } from '../../utils/constants'
import { IoSearchOutline } from 'react-icons/io5'
import './JobFilters.css'

const JobFilters = () => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.jobs)

  return (
    <div className="job-filters">
      <div className="filter-search-wrapper">
        <IoSearchOutline className="filter-search-icon" />
        <input
          type="text"
          placeholder="Search by title or company…"
          value={filters.search}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          className="filter-search-input"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
        className="filter-select"
      >
        <option value="">All Statuses</option>
        {JOB_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default JobFilters
