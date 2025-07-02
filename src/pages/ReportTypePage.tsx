// ReportTypePage.tsx
// This page lets users choose the type of report (single or multi-page) and the focus (KPI summary, trend analysis, comparison).
// It handles user selection and navigation to the next step.

import { useState } from 'react'; // Import React state hook
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import '../App.css'; // Import global styles

function ReportTypePage() {
  const navigate = useNavigate(); // For navigating between pages
  // State for which report type is selected
  const [reportType, setReportType] = useState<'single' | 'multi' | null>(null);
  // State for which report focus is selected
  const [focus, setFocus] = useState('KPI summary');

  // Handler for the Next button
  // (In a real app, you would send the selected options to the backend or context here)
  const handleNext = () => {
    navigate('/data-cleaning'); // Go to the data cleaning page
  };

  return (
    <div className="page-container">
      <div className="card">
        {/* Back button to return to the data source page */}
        <button className="back-button" onClick={() => navigate('/data-source')}>Back</button>
        <h2>Report Type Selection</h2>
        <p>Choose your report type and focus:</p>
        {/* Buttons to select single or multi-page report */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className={`button${reportType === 'single' ? ' selected' : ''}`} onClick={() => setReportType('single')}>Single Page</button>
          <button className={`button${reportType === 'multi' ? ' selected' : ''}`} onClick={() => setReportType('multi')}>Multi Page</button>
        </div>
        {/* Dropdown to select report focus */}
        <select value={focus} onChange={e => setFocus(e.target.value)} style={{ marginBottom: '1.5rem', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <option value="KPI summary">KPI Summary</option>
          <option value="trend analysis">Trend Analysis</option>
          <option value="comparison">Comparison</option>
        </select>
        {/* Next button is only shown if a report type is selected */}
        {reportType && (
          <button className="button" onClick={handleNext}>Next: Cleanse Data</button>
        )}
      </div>
    </div>
  );
}

export default ReportTypePage; // Export the ReportTypePage component
