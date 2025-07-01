import { useNavigate } from 'react-router-dom';
import '../App.css';
function ReportTypePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
        <h2>Report Type Selection</h2>
        <p>Choose single or multiple page report.</p>
      </div>
    </div>
  );
}
export default ReportTypePage;
