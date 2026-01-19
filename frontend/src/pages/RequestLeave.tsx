import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

// Calculate days with half day support (client-side preview)
function calculateDaysPreview(
  startDate: string,
  endDate: string,
  startHalfDay: 'full' | 'am' | 'pm',
  endHalfDay: 'full' | 'am' | 'pm'
): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const wholeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  // If same day
  if (startDate === endDate) {
    if (startHalfDay === 'full') return 1;
    return 0.5;
  }
  
  let adjustment = 0;
  if (startHalfDay === 'pm') adjustment -= 0.5;
  if (endHalfDay === 'am') adjustment -= 0.5;
  
  return wholeDays + adjustment;
}

export default function RequestLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    start_half_day: 'full' as 'full' | 'am' | 'pm',
    end_half_day: 'full' as 'full' | 'am' | 'pm',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [daysPreview, setDaysPreview] = useState(0);

  // Update days preview when dates or half day options change
  useEffect(() => {
    const days = calculateDaysPreview(
      formData.start_date,
      formData.end_date,
      formData.start_half_day,
      formData.end_half_day
    );
    setDaysPreview(days);
  }, [formData.start_date, formData.end_date, formData.start_half_day, formData.end_half_day]);

  // Check if it's a single day request
  const isSingleDay = !!(formData.start_date && formData.start_date === formData.end_date);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.submitLeaveRequest(formData);
      alert('Leave request submitted successfully!');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Request Leave</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  start_date: e.target.value,
                  end_date: formData.end_date || e.target.value // Auto-set end date if not set
                })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="start_half_day">Start Day Type</label>
              <select
                id="start_half_day"
                value={formData.start_half_day}
                onChange={(e) => setFormData({ ...formData, start_half_day: e.target.value as 'full' | 'am' | 'pm' })}
                style={{ width: '100%' }}
              >
                <option value="full">Full Day</option>
                <option value="pm">Half Day (PM only - start afternoon)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                required
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_half_day">End Day Type</label>
              <select
                id="end_half_day"
                value={formData.end_half_day}
                onChange={(e) => setFormData({ ...formData, end_half_day: e.target.value as 'full' | 'am' | 'pm' })}
                style={{ width: '100%' }}
                disabled={isSingleDay} // Disable if single day (use start_half_day instead)
              >
                <option value="full">Full Day</option>
                <option value="am">Half Day (AM only - end at lunch)</option>
              </select>
              {isSingleDay && (
                <small style={{ color: '#aaa' }}>
                  For single day, use Start Day Type to select half day
                </small>
              )}
            </div>
          </div>

          {/* Days Preview */}
          {daysPreview > 0 && (
            <div className="alert alert-info" style={{ maxWidth: '600px', marginTop: '1rem' }}>
              <strong>Days Requested: {daysPreview} {daysPreview === 1 ? 'day' : 'days'}</strong>
              {daysPreview % 1 !== 0 && <span> (includes half day)</span>}
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="reason">Reason (Optional)</label>
            <textarea
              id="reason"
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              style={{ maxWidth: '600px' }}
            />
          </div>

          {error && <div className="alert alert-danger" style={{ maxWidth: '600px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting || daysPreview === 0}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}