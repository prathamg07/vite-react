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

  // Type detection
  let detectedType = 'object';
  const isBoolean = values.every((v: any) => typeof v === 'boolean' || v === null || v === undefined || v === '');
  const isInt = values.every((v: any) => v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isInteger(v)) || (/^-?\d+$/.test(v)));
  const intLengths = values.filter((v: any) => v !== null && v !== undefined && v !== '' && ((typeof v === 'number' && Number.isInteger(v)) || (/^-?\d+$/.test(v)))).map((v: any) => String(v).replace(/^-/, '').length);
  const isLongInt = isInt && intLengths.some(len => len > 10);
  const isShortInt = isInt && intLengths.every(len => len <= 10);

  // Alphanum: all non-null, non-empty, all alphanumeric, all same length, all <= 8 chars
  const stringValues = values.filter((v: any) => v !== null && v !== undefined && v !== '');
  const allStrings = stringValues.every((v: any) => typeof v === 'string');
  const allAlphanum = stringValues.every((v: any) => /^[a-zA-Z0-9]+$/.test(v));
  const allShort = stringValues.every((v: any) => String(v).length <= 8);
  const allSameLength = stringValues.length > 0 && stringValues.every((v: any) => String(v).length === String(stringValues[0]).length);
  const isAlphanum = allStrings && allAlphanum && allShort && allSameLength;
  // String: all strings, or any value >8 chars, or not all same length, or not all alphanum
  const isString = allStrings && (!allAlphanum || !allShort || !allSameLength);

  if (isBoolean) detectedType = 'boolean';
  else if (isInt && isLongInt) detectedType = 'longint';
  else if (isInt && isShortInt) detectedType = 'int';
  else if (isAlphanum) detectedType = 'alphanum';
  else if (isString) detectedType = 'string';
  else detectedType = 'object';

  // Data quality checks
  const hasTypeMismatch = uniqueTypes.length > 1;
  const hasLongValue = values.some((v: any) => v && String(v).length > 32);
  const nullPercent = (nullCount / values.length) * 100;
  const isConstant = uniqueValues.size === 1 && nullCount < values.length;
  return {
    nullCount,
    uniqueTypes,
    total: values.length,
    eligible: allUnique && (isInt || isAlphanum),
    detectedType,
    allUnique,
    notTooLong: true,
    reason: '',
    hasTypeMismatch,
    hasLongValue,
    nullPercent,
    isConstant,
  };
}

function DataCleaningPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { columns, preview, selectedColumns: initialSelected, allData, fileName } = location.state || {};

  // If no data, redirect back
  useEffect(() => {
    if (!columns || !preview || !allData) {
      navigate('/');
    }
  }, [columns, preview, allData, navigate]);
  if (!columns || !preview || !allData) return null;

  const [selectedColumns, setSelectedColumns] = useState<string[]>(initialSelected || columns);
  const [primaryKey, setPrimaryKey] = useState('');
  const [addableCol, setAddableCol] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [tableName, setTableName] = useState('');
  const [uploading, setUploading] = useState(false);

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
  const handleUpload = async () => {
    if (!tableName.trim()) {
      alert('Please enter a table name.');
      return;
    }
    setUploading(true);
    // Filter allData to only include selected columns
    const filteredData = allData.map((row: any) => {
      const filtered: any = {};
      selectedColumns.forEach(col => {
        filtered[col] = row[col];
      });
      return filtered;
    });
    const response = await fetch('http://localhost:4000/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableName,
        columns: selectedColumns,
        primaryKey,
        data: filteredData,
        fileName,
      }),
    });
    setUploading(false);
    const result = await response.json();
    if (result.success) {
      alert('Data uploaded successfully!');
      // navigate('/report-type');
    } else {
      alert('Upload failed: ' + result.error);
    }
  };

  // Back button logic: go to 'from' route if provided, else go back
  const handleBack = () => {
    navigate('/column-select', {
      state: {
        columns,
        preview,
        selectedColumns,
        allData,
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
        {/* Table name input */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <label htmlFor="tableName" style={{ fontWeight: 500, color: '#eaff6b', fontSize: 16 }}>Table Name:</label>
          <input
            id="tableName"
            type="text"
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            placeholder="Enter table name"
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #eaff6b', fontSize: 16, minWidth: 220 }}
          />
        </div>
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
                const { nullCount, total, eligible, reason, hasTypeMismatch, hasLongValue, nullPercent, isConstant } = columnAnalysis[col];
                const hasNulls = nullCount > 0;
                const isSelected = selectedColumns.includes(col);
                // Collect issues
                let issues = [];
                if (isConstant) {
                  issues.push({ label: 'Constant', color: '#607d8b', tooltip: 'All values are the same' });
                } else if (nullPercent > 20) {
                  issues.push({ label: 'Many nulls', color: '#d32f2f', tooltip: `More than 20% values are null (${nullCount}/${total})` });
                } else {
                  if (hasLongValue) issues.push({ label: 'Long value', color: '#b71c1c', tooltip: 'Some values exceed 32 characters' });
                  if (hasTypeMismatch) issues.push({ label: 'Type mismatch', color: '#ff9800', tooltip: 'Multiple data types detected' });
                }
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
                      {Math.round(nullPercent)}%
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{columnAnalysis[col].detectedType}</td>
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
              background: primaryKey && selectedColumns.length > 0 && eligiblePKColumns.length > 0 && tableName.trim() && !uploading ? '#eaff6b' : '#888',
              color: '#181e26',
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 8,
              padding: '0.75rem 2rem',
              cursor: primaryKey && selectedColumns.length > 0 && eligiblePKColumns.length > 0 && tableName.trim() && !uploading ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
            disabled={!primaryKey || selectedColumns.length === 0 || eligiblePKColumns.length === 0 || !tableName.trim() || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Uploading...' : 'Upload to Backend'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataCleaningPage;
