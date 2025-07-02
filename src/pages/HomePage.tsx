// HomePage.tsx
// This is the landing page of the application.
// It lets users start creating a new report or view existing reports.

import { useNavigate } from 'react-router-dom'; // Import navigation hook from React Router
import '../App.css'; // Import global styles

function HomePage() {
  const navigate = useNavigate(); // useNavigate allows us to programmatically change pages
  return (
    <div className="page-container">
      <div className="card">
        <h2>Home Page</h2>
        {/* Button to start the report creation workflow */}
        <button className="button" onClick={() => navigate('/data-source')}>
          Create New Report
        </button>
        {/* Button to view existing reports (not yet implemented) */}
        <button className="button" onClick={() => navigate('/report-viewer')}>
          View Existing Reports
        </button>
      </div>
    </div>
  );
}

export default HomePage; // Export the HomePage component
