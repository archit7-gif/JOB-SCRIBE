

import { useForm } from 'react-hook-form'
import { validationRules } from '../../utils/validators'
import { JOB_STATUSES } from '../../utils/constants'
import Button from '../common/Button'
import './JobForm.css'

const JobForm = ({ onSubmit, initialData = {}, loading = false, resumes = [] }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData.title || '',
      company: initialData.company || '',
      link: initialData.link || '',
      location: initialData.location || '',
      status: initialData.status || 'saved',
      description: initialData.description || '',
      resumeId: initialData.resumeId || ''
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="job-form">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            type="text"
            {...register('title', validationRules.jobTitle)}
            className={`form-input ${errors.title ? 'form-input-error' : ''}`}
            placeholder="e.g., Senior Software Engineer"
          />
          {errors.title && <span className="form-error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Company *</label>
          <input
            type="text"
            {...register('company', validationRules.company)}
            className={`form-input ${errors.company ? 'form-input-error' : ''}`}
            placeholder="e.g., Google"
          />
          {errors.company && <span className="form-error">{errors.company.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Job Link</label>
          <input
            type="url"
            {...register('link')}
            className="form-input"
            placeholder="https://company.com/careers/job-id"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            type="text"
            {...register('location')}
            className="form-input"
            placeholder="e.g., Remote, New York, NY"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select {...register('status')} className="form-select">
            {JOB_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Resume (Optional)</label>
          <select {...register('resumeId')} className="form-select">
            <option value="">No resume selected</option>
            {resumes.map((resume) => (
              <option key={resume._id} value={resume._id}>
                {resume.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group form-group-full">
        <label className="form-label">Description</label>
        <textarea
          {...register('description')}
          className="form-textarea"
          rows="6"
          placeholder="Paste the job description here..."
        ></textarea>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary" loading={loading} fullWidth>
          {initialData._id ? 'Update Job' : 'Add Job'}
        </Button>
      </div>
    </form>
  )
}

export default JobForm
