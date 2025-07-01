import { useNavigate } from 'react-router-dom';
import '../App.css';
function DataSourcePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
        <h2>Data Source Connection</h2>
        <p>Upload files or connect to a database.</p>
      </div>
    </div>
  );
}
export default DataSourcePage;
