import { useNavigate } from 'react-router-dom';
import '../App.css';

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <h2>Home Page</h2>
        <button className="button" onClick={() => navigate('/data-source')}>
          Create New Report
        </button>
        <button className="button" onClick={() => navigate('/report-viewer')}>
          View Existing Reports
        </button>
      </div>
    </div>
  );
}
export default HomePage;
