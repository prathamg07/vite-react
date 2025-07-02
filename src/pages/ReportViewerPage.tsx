// ReportViewerPage.tsx
// This page is meant to display the final AI-generated report with visuals and narrative.
// Currently, it is a placeholder and does not show real report data yet.

import { useNavigate } from 'react-router-dom'; // Import navigation hook
import '../App.css'; // Import global styles

function ReportViewerPage() {
  const navigate = useNavigate(); // For navigating between pages
  return (
    <div className="page-container">
      <div className="card">
        {/* Back button to return to the home page */}
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
        <h2>Report Viewer</h2>
        {/* Placeholder text for the report output */}
        <p>Display the AI-generated report with visuals and narrative.</p>
      </div>
    </div>
  );
}

export default ReportViewerPage; // Export the ReportViewerPage component
