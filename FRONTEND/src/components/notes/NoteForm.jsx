

import { useForm } from 'react-hook-form'
import { validationRules } from '../../utils/validators'
import Button from '../common/Button'
import './NoteForm.css'

const NoteForm = ({ onSubmit, initialData = {}, loading = false, jobs = [] }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      jobId: initialData.jobId || '',
      title: initialData.title || '',
      content: initialData.content || ''
    }
  })

  const contentLength = watch('content')?.length || 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="note-form">
      <div className="form-group">
        <label className="form-label">Related Job *</label>
        <select 
          {...register('jobId', { required: 'Please select a job' })}
          className={`form-select ${errors.jobId ? 'form-input-error' : ''}`}
          disabled={initialData.jobId}
        >
          <option value="">Select a job...</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>
        {errors.jobId && <span className="form-error">{errors.jobId.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Note Title *</label>
        <input
          type="text"
          {...register('title', validationRules.noteTitle)}
          className={`form-input ${errors.title ? 'form-input-error' : ''}`}
          placeholder="e.g., Interview Questions"
        />
        {errors.title && <span className="form-error">{errors.title.message}</span>}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label">Content * (Markdown supported)</label>
          <span className="char-count">
            {contentLength} / 5000
          </span>
        </div>
        <textarea
          {...register('content', validationRules.noteContent)}
          className={`form-textarea ${errors.content ? 'form-input-error' : ''}`}
          rows="10"
          placeholder="Write your notes here... Markdown is supported!"
        ></textarea>
        {errors.content && <span className="form-error">{errors.content.message}</span>}
      </div>

      <Button type="submit" variant="primary" loading={loading} fullWidth>
        {initialData._id ? 'Update Note' : 'Create Note'}
      </Button>
    </form>
  )
}

export default NoteForm
