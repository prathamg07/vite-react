import { useState, useRef, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SUPPORTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

function DataSourcePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [option, setOption] = useState<'file' | 'db' | null>(null);
  const [fileError, setFileError] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const [dbType, setDbType] = useState('');
  const [dbDetails, setDbDetails] = useState({
    host: '',
    port: '',
    dbName: '',
    username: '',
    password: ''
  });
  const [tableMode, setTableMode] = useState<'single' | 'multiple' | null>(null);
  const [tables, setTables] = useState(['']);
  const [dbErrors, setDbErrors] = useState<{ [key: string]: string }>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && Array.from(selectedFiles).every(f => SUPPORTED_FILE_TYPES.includes(f.type))) {
      setFiles(selectedFiles);
      setFileError('');
    } else {
      setFiles(null);
      setFileError('Unsupported file type. Upload Excel files only.');
    }
  };

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

  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbDetails({ ...dbDetails, [name]: value });
  };

  const handleTableChange = (idx: number, value: string) => {
    const newTables = [...tables];
    newTables[idx] = value;
    setTables(newTables);
  };

  const addTable = () => setTables([...tables, '']);
  const removeTable = (idx: number) => setTables(tables.filter((_, i) => i !== idx));

  const handleNext = () => {
    if (option === 'db') {
      const errors = validateDbInputs();
      setDbErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    navigate('/report-type');
  };

  return (
    <div className="page-container">
      <div className="card">
        <button className="back-button" onClick={() => navigate('/')}>← Back</button>
        <h2>Data Source Connection</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className={`button ${option === 'file' ? 'active' : ''}`} onClick={() => setOption('file')}>Upload Excel File(s)</button>
          <button className={`button ${option === 'db' ? 'active' : ''}`} onClick={() => setOption('db')}>Connect to Database</button>
        </div>

        {option === 'file' && (
          <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
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
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button className="button" onClick={handleNext} disabled={!files}>Next</button>
            {fileError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{fileError}</p>}
            {files && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', color: '#eaff6b', fontSize: '0.95rem' }}>
                {Array.from(files).map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {option === 'db' && (
          <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
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

            {dbType && (
              <>
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
                        {tableMode === 'multiple' && tables.length > 1 && (
                          <button onClick={() => removeTable(idx)} style={{ marginLeft: '0.5rem' }}>×</button>
                        )}
                      </div>
                    ))}
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
                    {tableMode === 'multiple' && (
                      <button className="button" style={{ marginTop: '0.5rem' }} onClick={addTable}>Add Table</button>
                    )}
                  </>
                )}

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

export default DataSourcePage;
