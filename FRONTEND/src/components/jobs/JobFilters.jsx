


import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../redux/slices/jobsSlice'
import { JOB_STATUSES } from '../../utils/constants'
import { IoSearch } from 'react-icons/io5'
import './JobFilters.css'

const JobFilters = () => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.jobs)

  const handleStatusChange = (e) => {
    dispatch(setFilters({ status: e.target.value }))
  }

  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value }))
  }

  return (
    <div className="job-filters">
      <div className="filter-group">
        <div className="search-input-wrapper">
          <IoSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-group">
        <select 
          value={filters.status} 
          onChange={handleStatusChange}
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
    </div>
  )
}

export default JobFilters
