// DataCleaningPage.tsx
// This page lets users select which columns from their data to include in the report.
// It currently uses mock data for preview, but in a real app, this would show the user's uploaded or connected data.

import { useState } from 'react'; // Import React state hook
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import '../App.css'; // Import global styles

// Mock data for preview (in a real app, this would come from the user's file or database)
const mockData = [
  { Name: 'Alice', Age: 30, Email: 'alice@example.com', Country: 'USA' },
  { Name: 'Bob', Age: 25, Email: 'bob@example.com', Country: 'UK' },
  { Name: 'Charlie', Age: 35, Email: 'charlie@example.com', Country: 'Canada' },
];

function DataCleaningPage() {
  const navigate = useNavigate(); // For navigating between pages
  // Get the column names from the mock data
  const columns = Object.keys(mockData[0]);
  // State for which columns are selected to include in the report
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns);

  // Handler for toggling a column on or off
  const handleColumnToggle = (col: string) => {
    setSelectedColumns(selectedColumns.includes(col)
      ? selectedColumns.filter(c => c !== col) // Remove column if already selected
      : [...selectedColumns, col]); // Add column if not selected
  };

  return (
    <div className="page-container">
      <div className="card">
        {/* Back button to return to the report type selection page */}
        <button className="back-button" onClick={() => navigate('/report-type')}>Back</button>
        <h2>Data Cleaning</h2>
        <p>Select columns to include in your report:</p>
        {/* Checkbox list for each column */}
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
        {/* Preview table showing only the selected columns */}
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
        {/* Next button to proceed to the report viewer */}
        <button className="button" onClick={() => navigate('/report-viewer')}>
          Next: Generate Report
        </button>
      </div>
    </div>
  );
}

export default DataCleaningPage; // Export the DataCleaningPage component
