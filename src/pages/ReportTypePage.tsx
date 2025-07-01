import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function ReportTypePage() {
  const navigate = useNavigate();
  // Example: Add more report type options as needed
  const [reportType, setReportType] = useState<'single' | 'multi' | null>(null);
  const [focus, setFocus] = useState('KPI summary');

  const handleNext = () => {
    // Here you would send the report type config to your backend or context
    navigate('/data-cleaning');
  };

  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/data-source')}>Back</button>
        <h2>Report Type Selection</h2>
        <p>Choose your report type and focus:</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className={`button${reportType === 'single' ? ' selected' : ''}`} onClick={() => setReportType('single')}>Single Page</button>
          <button className={`button${reportType === 'multi' ? ' selected' : ''}`} onClick={() => setReportType('multi')}>Multi Page</button>
        </div>
        <select value={focus} onChange={e => setFocus(e.target.value)} style={{ marginBottom: '1.5rem', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <option value="KPI summary">KPI Summary</option>
          <option value="trend analysis">Trend Analysis</option>
          <option value="comparison">Comparison</option>
        </select>
        {reportType && (
          <button className="button" onClick={handleNext}>Next: Cleanse Data</button>
        )}
      </div>
    </div>
  );
}

export default ReportTypePage;
