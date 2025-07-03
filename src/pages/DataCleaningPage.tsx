// DataCleaningPage.tsx
// This page lets users select which columns from their data to include in the report.
// It currently uses mock data for preview, but in a real app, this would show the user's uploaded or connected data.

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../App.css';

function analyzeColumn(data: any[], col: string) {
  const values = data.map((row: any) => row[col]);
  const nullCount = values.filter((v: any) => v === null || v === undefined || v === '').length;
  const uniqueTypes = Array.from(new Set(values.map((v: any) => typeof v)));
  const uniqueValues = new Set(values.filter((v: any) => v !== null && v !== undefined && v !== ''));
  const allUnique = uniqueValues.size === values.length && nullCount === 0;
  // Check for length: numeric or alphanumeric, not too long
  const isNumeric = values.every((v: any) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)));
  const isAlphanumeric = values.every((v: any) => v !== null && v !== undefined && v !== '' && /^[a-zA-Z0-9]+$/.test(String(v)) && String(v).length <= 32);
  const notTooLong = values.every((v: any) => v === null || v === undefined || v === '' || String(v).length <= 32);
  const eligible = allUnique && notTooLong && (isNumeric || isAlphanumeric);
  let reason = '';
  if (!eligible) {
    if (!allUnique) reason = 'Values are not unique or contain nulls';
    else if (!notTooLong) reason = 'Some values are too long';
    else if (!(isNumeric || isAlphanumeric)) reason = 'Values are not numeric or alphanumeric';
  }
  // Data quality checks
  const hasTypeMismatch = uniqueTypes.length > 1;
  const hasLongValue = values.some((v: any) => v && String(v).length > 32);
  const nullPercent = (nullCount / values.length) * 100;
  const isConstant = uniqueValues.size === 1 && nullCount < values.length;
  return {
    nullCount,
    uniqueTypes,
    total: values.length,
    eligible,
    isNumeric,
    isAlphanumeric,
    allUnique,
    notTooLong,
    reason,
    hasTypeMismatch,
    hasLongValue,
    nullPercent,
    isConstant,
  };
}

function DataCleaningPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { columns, preview, selectedColumns: initialSelected, from } = location.state || {};

  // If no data, redirect back
  if (!columns || !preview) {
    navigate('/');
    return null;
  }

  const [selectedColumns, setSelectedColumns] = useState<string[]>(initialSelected || columns);
  const [primaryKey, setPrimaryKey] = useState('');
  const [addableCol, setAddableCol] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  // Unselected columns for dropdown
  const unselectedColumns = columns.filter((col: string) => !selectedColumns.includes(col));

  // Analyze all columns
  const columnAnalysis = Object.fromEntries(
    columns.map((col: string) => [col, analyzeColumn(preview, col)])
  );

  // Eligible PK columns
  const eligiblePKColumns = selectedColumns.filter((col: string) => columnAnalysis[col].eligible);

  // Handler for toggling a column on or off
  const handleColumnToggle = (col: string) => {
    setSelectedColumns(selectedColumns.includes(col)
      ? selectedColumns.filter(c => c !== col)
      : [...selectedColumns, col]);
    if (primaryKey === col) setPrimaryKey(''); // Unset PK if column is removed
  };

  // Handler for setting primary key
  const handlePrimaryKey = (col: string) => {
    setPrimaryKey(col);
    if (!selectedColumns.includes(col)) {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  // Handler for adding a column from dropdown
  const handleAddColumn = () => {
    if (addableCol && !selectedColumns.includes(addableCol)) {
      setSelectedColumns([...selectedColumns, addableCol]);
      setAddableCol('');
    }
  };

  // Handler for upload (to backend)
  const handleUpload = () => {
    // TODO: Implement upload logic here
    // You can send { selectedColumns, primaryKey, preview } to the backend
    alert('Data uploaded successfully!');
    // navigate('/report-type');
  };

  // Back button logic: go to 'from' route if provided, else go back
  const handleBack = () => {
    navigate('/column-select', {
      state: {
        columns,
        preview,
        selectedColumns,
      },
      replace: true
    });
  };

  // Fade-in animation on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  // Apple-style: clean, minimal, clear
  return (
    <div className="page-container">
      <div
        className="card"
        style={{
          maxWidth: 1000,
          margin: '2rem auto',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <button className="back-button" onClick={handleBack} style={{ marginBottom: 24 }}>← Back</button>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Data Cleansing</h2>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 18 }}>
          Review your selected columns, check for issues, and choose a primary key before uploading.
        </p>
        <div style={{ marginBottom: 32 }}>
          {selectedColumns.length === 0 && (
            <div style={{ color: '#ff4d4f', marginBottom: 12 }}>
              Please select at least one column.
            </div>
          )}
          <table className="styled-table" style={{ width: '100%', marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>Include</th>
                <th style={{ padding: '1rem 0.5rem' }}>Column</th>
                <th style={{ padding: '1rem 0.5rem' }}>Nulls</th>
                <th style={{ padding: '1rem 0.5rem' }}>Type(s)</th>
                <th style={{ padding: '1rem 0.5rem' }}>Issues</th>
                <th style={{ padding: '1rem 0.5rem' }}>Primary Key</th>
              </tr>
            </thead>
            <tbody>
              {selectedColumns.map((col: string, idx) => {
                const { nullCount, uniqueTypes, total, eligible, reason, hasTypeMismatch, hasLongValue, nullPercent, isConstant } = columnAnalysis[col];
                const hasNulls = nullCount > 0;
                const isSelected = selectedColumns.includes(col);
                // Collect issues
                const issues: { label: string; color: string; tooltip: string }[] = [];
                if (hasTypeMismatch) issues.push({ label: 'Type mismatch', color: '#ff9800', tooltip: 'Multiple data types detected' });
                if (hasLongValue) issues.push({ label: 'Long value', color: '#b71c1c', tooltip: 'Some values exceed 32 characters' });
                if (nullPercent > 20) issues.push({ label: 'Many nulls', color: '#d32f2f', tooltip: `More than 20% values are null (${nullCount}/${total})` });
                if (isConstant) issues.push({ label: 'Constant', color: '#607d8b', tooltip: 'All values are the same' });
                return (
                  <tr
                    key={col}
                    style={{
                      background: isSelected ? '#232b36' : '#181e26',
                      opacity: fadeIn ? 1 : 0,
                      transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.7s ${0.1 + idx * 0.05}s cubic-bezier(.4,0,.2,1), transform 0.7s ${0.1 + idx * 0.05}s cubic-bezier(.4,0,.2,1)`
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleColumnToggle(col)}
                        style={{ accentColor: '#eaff6b' }}
                      />
                    </td>
                    <td style={{ fontWeight: 500, padding: '0.75rem 0.5rem' }}>{col}</td>
                    <td style={{ color: hasNulls ? '#ff4d4f' : '#eaff6b', fontWeight: hasNulls ? 600 : 400, padding: '0.75rem 0.5rem' }}>
                      {nullCount > 0 ? `${nullCount} / ${total}` : '0'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{uniqueTypes.join(', ')}</td>
                    <td style={{ minWidth: 120, padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {issues.length === 0 && <span style={{ color: '#4caf50', fontWeight: 500, fontSize: 13, background: '#eaff6b22', borderRadius: 6, padding: '2px 8px' }}>No issues</span>}
                        {issues.map((issue, idx) => (
                          <span
                            key={idx}
                            style={{ color: issue.color, fontWeight: 500, fontSize: 13, background: issue.color + '22', borderRadius: 6, padding: '2px 8px' }}
                            title={issue.tooltip}
                          >
                            {issue.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', position: 'relative', padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name="primaryKey"
                          checked={primaryKey === col}
                          disabled={!isSelected || !eligible}
                          onChange={() => handlePrimaryKey(col)}
                          style={{ accentColor: eligible ? '#eaff6b' : '#bbb', cursor: eligible ? 'pointer' : 'not-allowed' }}
                          title={eligible ? 'Eligible as primary key' : `Not eligible: ${reason}`}
                        />
                        {eligible ? (
                          <span style={{ color: '#4caf50', fontWeight: 500, fontSize: 13, background: '#eaff6b22', borderRadius: 6, padding: '2px 8px' }}>Eligible</span>
                        ) : (
                          <span style={{ color: '#bbb', fontWeight: 500, fontSize: 13, background: '#8882', borderRadius: 6, padding: '2px 8px' }}>Not eligible</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Addable columns dropdown */}
          {unselectedColumns.length > 0 && (
            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#eaff6b', fontWeight: 500 }}>Add column:</span>
              <select
                value={addableCol}
                onChange={e => setAddableCol(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: 6 }}
              >
                <option value="">Select column</option>
                {unselectedColumns.map((col: string) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <button
                className="button"
                style={{ padding: '0.4rem 1.2rem', fontSize: 15, borderRadius: 6 }}
                onClick={handleAddColumn}
                disabled={!addableCol}
              >
                Add
              </button>
            </div>
          )}
          <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: '#ff4d4f', fontWeight: 500 }}>!</span> Columns with <span style={{ color: '#ff4d4f' }}>red</span> null counts have missing data.
            <br />
            <span style={{ color: '#eaff6b' }}>Tip:</span> Set a column as the primary key. You cannot upload without one.
          </div>
          {selectedColumns.length > 0 && eligiblePKColumns.length === 0 && (
            <div style={{ color: '#ff4d4f', fontWeight: 500, margin: '10px 0' }}>
              No eligible column can be set as primary key. Please adjust your selection.
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button
            className="button"
            style={{
              minWidth: 180,
              background: primaryKey && selectedColumns.length > 0 && eligiblePKColumns.length > 0 ? '#eaff6b' : '#888',
              color: '#181e26',
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 8,
              padding: '0.75rem 2rem',
              cursor: primaryKey && selectedColumns.length > 0 && eligiblePKColumns.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
            disabled={!primaryKey || selectedColumns.length === 0 || eligiblePKColumns.length === 0}
            onClick={handleUpload}
          >
            Upload to Backend
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataCleaningPage;
