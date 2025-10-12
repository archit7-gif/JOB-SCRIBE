
import { useForm } from 'react-hook-form'
import { validationRules } from '../../utils/validators'
import Button from '../common/Button'
import './AIAnalysisForm.css'

const AIAnalysisForm = ({ onSubmit, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ai-analysis-form">
      <div className="form-group">
        <label className="form-label">Job Title (Optional)</label>
        <input
          type="text"
          {...register('jobTitle')}
          className="form-input"
          placeholder="e.g., Senior Software Engineer at Google"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Job Description *</label>
        <textarea
          {...register('jobDescription', validationRules.jobDescription)}
          className={`form-textarea ${errors.jobDescription ? 'form-input-error' : ''}`}
          rows="10"
          placeholder="Paste the complete job description here..."
        ></textarea>
        {errors.jobDescription && (
          <span className="form-error">{errors.jobDescription.message}</span>
        )}
      </div>

      <Button type="submit" variant="primary" loading={loading} fullWidth>
        {loading ? 'Analyzing Resume...' : 'Analyze with AI'}
      </Button>

      <p className="analysis-note">
        This may take 15-30 seconds. Your resume will be analyzed against the job requirements.
      </p>
    </form>
  )
}

export default AIAnalysisForm
