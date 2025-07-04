import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ColumnMultiSelect from './ColumnMultiSelect';

function ColumnSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { columns, preview, selectedColumns: initialSelected, allData } = location.state || {};

  if (!columns || !preview || allData == null) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        Required data is missing. Please start from the data upload page.
      </div>
    );
  }

  const [selectedColumns, setSelectedColumns] = useState<string[]>(initialSelected || columns);

  const handleNext = () => {
    if (selectedColumns.length > 0) {
      navigate('/data-cleaning', {
        state: {
          columns,
          preview,
          selectedColumns,
          allData,
          from: '/column-select',
        },
      });
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 1000, margin: '2rem auto', padding: '2.5rem 3rem' }}>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Select Columns</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>
          Choose which columns to include in your data. You can add or remove columns as needed.
        </p>
        <ColumnMultiSelect
          columns={columns}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
        />
        <div className="table-wrapper" style={{ minWidth: 480, maxWidth: '100%', margin: '2rem auto 0 auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                {selectedColumns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {preview.map((row: any, idx: number) => (
                <tr key={idx}>
                  {selectedColumns.map(col => <td key={col}>{row[col]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="button"
            onClick={handleNext}
            disabled={selectedColumns.length === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColumnSelectionPage;
