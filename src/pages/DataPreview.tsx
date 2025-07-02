import React from 'react';
import './DataPreview1.css';

interface DataPreviewProps {
  columns: string[];
  selectedColumns: string[];
  setSelectedColumns: (cols: string[]) => void;
  preview: any[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ columns, selectedColumns, setSelectedColumns, preview }) => {
  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="data-preview-container">
      <h3 className="section-title">Select Columns to Include</h3>
      <div className="column-selector">
        {columns.map(col => (
          <label key={col} className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={selectedColumns.includes(col)}
              onChange={() => toggleColumn(col)}
            />
            <span>{col}</span>
          </label>
        ))}
      </div>

      {preview.length > 0 && (
        <div className="table-wrapper">
          <h3 className="section-title">Data Preview</h3>
          <table className="styled-table">
            <thead>
              <tr>
                {selectedColumns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, idx) => (
                <tr key={idx}>
                  {selectedColumns.map(col => <td key={col}>{row[col]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataPreview;
