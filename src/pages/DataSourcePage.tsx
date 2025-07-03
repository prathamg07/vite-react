// DataSourcePage.tsx
// This page lets users choose how to provide data for the report: by uploading Excel files or connecting to a database.
// It handles file validation, database form input, and navigation to the next step.

import { useState, useRef, DragEvent } from 'react'; // Import React hooks
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import '../App.css'; // Import global styles
import './DataPreview1.css';

// List of allowed file types for upload (Excel formats)
const SUPPORTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

function DataSourcePage() {
  const navigate = useNavigate(); // For navigating between pages
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to the hidden file input

  // State for which option is selected: file upload or database
  const [option, setOption] = useState<'file' | 'db' | null>(null);
  // State for file upload errors
  const [fileError, setFileError] = useState('');
  // State for the uploaded files
  const [files, setFiles] = useState<FileList | null>(null);

  // State for database connection details
  const [dbType, setDbType] = useState(''); // Which DB type is selected
  const [dbDetails, setDbDetails] = useState({
    host: '',
    port: '',
    dbName: '',
    username: '',
    password: ''
  });
  // State for single/multiple table mode
  const [tableMode, setTableMode] = useState<'single' | 'multiple' | null>(null);
  // State for the list of table names
  const [tables, setTables] = useState(['']);
  // State for database form errors
  const [dbErrors, setDbErrors] = useState<{ [key: string]: string }>({});

  // State for column selection
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);

  // Add a flag to track if data is cleansed
  const [dataCleansed, setDataCleansed] = useState(false);

  // Function to validate the database form fields
  const validateDbInputs = () => {
    const errors: { [key: string]: string } = {};
    if (!dbDetails.host.trim()) errors.host = 'Host is required';
    if (!/^\d+$/.test(dbDetails.port)) errors.port = 'Port must be a number';
    if (!dbDetails.dbName.trim()) errors.dbName = 'Database name is required';
    if (!dbDetails.username.trim()) errors.username = 'Username is required';
    if (!dbDetails.password.trim()) errors.password = 'Password is required';
    if (tables.some(t => !t.trim())) errors.tables = 'All table names must be filled';
    return errors;
  };

  // Handler for when files are selected via the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    // Check if all files are supported Excel types
    if (selectedFiles && Array.from(selectedFiles).every(f => SUPPORTED_FILE_TYPES.includes(f.type))) {
      setFiles(selectedFiles);
      setFileError('');
    } else {
      setFiles(null);
      setFileError('Unsupported file type. Upload Excel files only.');
    }
  };

  // Handler for drag-and-drop file upload
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && Array.from(droppedFiles).every(f => SUPPORTED_FILE_TYPES.includes(f.type))) {
      setFiles(droppedFiles);
      setFileError('');
    } else {
      setFiles(null);
      setFileError('Unsupported file type. Upload Excel files only.');
    }
  };

  // Handler for changes in the database form fields
  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbDetails({ ...dbDetails, [name]: value });
  };

  // Handler for changing table names
  const handleTableChange = (idx: number, value: string) => {
    const newTables = [...tables];
    newTables[idx] = value;
    setTables(newTables);
  };

  // Add a new table input field
  const addTable = () => setTables([...tables, '']);
  // Remove a table input field
  const removeTable = (idx: number) => setTables(tables.filter((_, i) => i !== idx));

  // Handler for the Next button
  // Validates DB form if needed, then navigates to the next step
  const handleNext = () => {
    if (option === 'file') {
      // Only allow next if columns and preview are available
      if (columns.length > 0 && preview.length > 0) {
        navigate('/column-select', {
          state: {
            columns,
            preview,
            selectedColumns,
          },
        });
      }
    } else if (option === 'db') {
      // Existing DB validation logic...
      const errors = validateDbInputs();
      setDbErrors(errors);
      if (Object.keys(errors).length > 0) return;
      // For DB, you would also fetch columns/preview and pass them here
      // navigate('/data-cleaning', { state: { ... } });
    }
  };

  const handleUpload = async () => {
    if (!files) return;
    const formData = new FormData();
    formData.append('file', files[0]);
    const response = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    setColumns(result.columns);
    setSelectedColumns(result.columns); // default: all selected
    setPreview(result.preview);
    setDataCleansed(true); // Mark as cleansed
    navigate('/column-select', {
      state: {
        columns: result.columns,
        preview: result.preview,
        selectedColumns: result.columns,
      },
    });
  };

  return (
    <div className="page-container">
      <div className="card">
        {/* Back button to return to the home page */}
        <button className="back-button" onClick={() => navigate('/')}>← Back</button>
        <h2>Data Source Connection</h2>
        {/* Option buttons for file upload or database connection */}
        {!dataCleansed && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className={`button ${option === 'file' ? 'active' : ''}`} onClick={() => setOption('file')}>Upload Excel File(s)</button>
            <button className={`button ${option === 'db' ? 'active' : ''}`} onClick={() => setOption('db')}>Connect to Database</button>
          </div>
        )}

        {/* File upload section */}
        {option === 'file' && !dataCleansed && (
          <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
            {/* Drag-and-drop area for files */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: '2px dashed #eaff6b',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '1rem',
                background: '#232b36',
                color: '#eaff6b',
                cursor: 'pointer'
              }}
            >
              Click or Drag & Drop Excel files here
            </div>
            {/* Hidden file input for manual selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {/* Show error if file type is not supported */}
            {fileError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{fileError}</p>}
            {/* List of selected files */}
            {files && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', color: '#eaff6b', fontSize: '0.95rem' }}>
                {Array.from(files).map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
            <button className="button" onClick={handleUpload} disabled={!files}>
              Cleanse the Data
            </button>
          </div>
        )}

        {/* Show selected file(s) after cleansing */}
        {option === 'file' && dataCleansed && files && (
          <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', color: '#eaff6b', fontSize: '0.95rem' }}>
              {Array.from(files).map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Database connection section */}
        {option === 'db' && (
          <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
            {/* Dropdown to select database type */}
            <select
              value={dbType}
              onChange={e => setDbType(e.target.value)}
              style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.5rem', width: '80%' }}
            >
              <option value="">Select Database Type</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="sqlite">SQLite</option>
            </select>

            {/* Show DB form fields only if a DB type is selected */}
            {dbType && (
              <>
                {/* Input fields for DB connection details */}
                {['host', 'port', 'dbName', 'username', 'password'].map((field, idx) => (
                  <div key={idx}>
                    <input
                      name={field}
                      type={field === 'password' ? 'password' : 'text'}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={(dbDetails as any)[field]}
                      onChange={handleDbChange}
                      style={{ marginBottom: '0.5rem', width: '80%' }}
                    />
                    {/* Show error for each field if present */}
                    {dbErrors[field] && (
                      <div
                        style={{
                          color: '#ff4d4f',
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontWeight: 400,
                          fontSize: '0.92rem',
                          margin: '2px 0 0 8px',
                          textAlign: 'left'
                        }}
                      >
                        {dbErrors[field]}
                      </div>
                    )}
                  </div>
                ))}

                {/* Table selection: single or multiple */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: '#eaff6b' }}>Tables: </span>
                  <label>
                    <input type="radio" checked={tableMode === 'single'} onChange={() => setTableMode('single')} />
                    Single Table
                  </label>
                  <label style={{ marginLeft: '1rem' }}>
                    <input type="radio" checked={tableMode === 'multiple'} onChange={() => setTableMode('multiple')} />
                    Multiple Tables
                  </label>
                </div>

                {/* Input fields for table names */}
                {tableMode && (
                  <>
                    {tables.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <input
                          placeholder={`Table Name ${idx + 1}`}
                          value={t}
                          onChange={e => handleTableChange(idx, e.target.value)}
                          style={{ width: '60%' }}
                        />
                        {/* Button to remove a table (only for multiple tables) */}
                        {tableMode === 'multiple' && tables.length > 1 && (
                          <button onClick={() => removeTable(idx)} style={{ marginLeft: '0.5rem' }}>
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Show error for table names if present */}
                    {dbErrors.tables && (
                      <div
                        style={{
                          color: '#ff4d4f',
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontWeight: 400,
                          fontSize: '0.92rem',
                          margin: '2px 0 0 8px',
                          textAlign: 'left'
                        }}
                      >
                        {dbErrors.tables}
                      </div>
                    )}
                    {/* Button to add another table (only for multiple tables) */}
                    {tableMode === 'multiple' && (
                      <button className="button" style={{ marginTop: '0.5rem' }} onClick={addTable}>Add Table</button>
                    )}
                  </>
                )}

                {/* Next button to proceed after DB details are filled */}
                <button className="button" style={{ marginTop: '1rem' }} onClick={handleNext}>
                  Next
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataSourcePage; // Export the DataSourcePage component
