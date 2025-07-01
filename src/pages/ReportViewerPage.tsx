import { useNavigate } from 'react-router-dom';
import '../App.css';
function ReportViewerPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
        <h2>Report Viewer</h2>
        <p>Display the AI-generated report with visuals and narrative.</p>
      </div>
    </div>
  );
}
export default ReportViewerPage;
