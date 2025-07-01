import { useNavigate } from 'react-router-dom';
import '../App.css';
function DataCleaningPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
        <h2>Data Cleaning</h2>
        <p>Data transformation and preparation.</p>
      </div>
    </div>
  );
}
export default DataCleaningPage;
