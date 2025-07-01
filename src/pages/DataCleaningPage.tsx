import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

// Mock data for preview
const mockData = [
  { Name: 'Alice', Age: 30, Email: 'alice@example.com', Country: 'USA' },
  { Name: 'Bob', Age: 25, Email: 'bob@example.com', Country: 'UK' },
  { Name: 'Charlie', Age: 35, Email: 'charlie@example.com', Country: 'Canada' },
];

function DataCleaningPage() {
  const navigate = useNavigate();
  const columns = Object.keys(mockData[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns);

  const handleColumnToggle = (col: string) => {
    setSelectedColumns(selectedColumns.includes(col)
      ? selectedColumns.filter(c => c !== col)
      : [...selectedColumns, col]);
  };

  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/report-type')}>Back</button>
        <h2>Data Cleaning</h2>
        <p>Select columns to include in your report:</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {columns.map(col => (
            <label key={col} style={{ fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleColumnToggle(col)}
              />
              {col}
            </label>
          ))}
        </div>
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {selectedColumns.map(col => (
                  <th key={col} style={{ border: '1px solid #eaff6b', padding: '0.5rem', background: '#232b36', color: '#eaff6b' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, idx) => (
                <tr key={idx}>
                  {selectedColumns.map(col => (
                    <td key={col} style={{ border: '1px solid #eaff6b', padding: '0.5rem', background: '#181e26', color: '#f4f4f4' }}>
                      {row[col as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="button" onClick={() => navigate('/report-viewer')}>
          Next: Generate Report
        </button>
      </div>
    </div>
  );
}

export default DataCleaningPage;
