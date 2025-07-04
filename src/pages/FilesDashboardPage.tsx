import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
// FontAwesome imports (assume available)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';

interface Report {
  name: string;
  url: string;
}

interface FileMeta {
  name: string; // original file name
  uploadedAt?: string;
  reports?: Report[];
  tableName?: string;
  details?: any;
}

function FilesDashboardPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ fileName: string; rowCount: number } | null>(null);
  const [previewCounts, setPreviewCounts] = useState<{ rowCount: number; colCount: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloadMenuIdx, setDownloadMenuIdx] = useState<number | null>(null);
  const [downloadMenuPos, setDownloadMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    // Fetch files from backend
    async function fetchFiles() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:4000/files');
        const data = await res.json();
        console.log('Files API response:', data);
        setFiles(data.files || []);
      } catch (err) {
        setError('Failed to load files.');
      }
      setLoading(false);
    }
    fetchFiles();
  }, []);

  useEffect(() => {
    if (downloadMenuIdx !== null) {
      const handleClick = (e: MouseEvent) => {
        setDownloadMenuIdx(null);
        setDownloadMenuPos(null);
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [downloadMenuIdx]);

  const handleDownloadIconClick = (idx: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setDownloadMenuIdx(idx);
    setDownloadMenuPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
  };

  const handleDownload = async (fileName: string, format: string) => {
    try {
      const url = `http://localhost:4000/api/download?file=${encodeURIComponent(fileName)}&format=${format}`;
      const response = await fetch(url);
      if (!response.ok) {
        alert('Download failed: ' + (await response.text()));
        setDownloadMenuIdx(null);
        setDownloadMenuPos(null);
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${fileName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Download failed: ' + err);
    }
    setDownloadMenuIdx(null);
    setDownloadMenuPos(null);
  };

  const handlePreview = async (file: FileMeta) => {
    // Fetch preview data and counts from backend
    let previewRows: any[] = [];
    let rowCount = 0;
    let colCount = 0;
    try {
      const tableName = file.tableName || file.name || '';
      console.log('Previewing table:', tableName);
      const res = await fetch(`http://localhost:4000/api/preview?table=${encodeURIComponent(tableName)}`);
      const data = await res.json();
      previewRows = data.preview || [];
      rowCount = data.rowCount || previewRows.length;
      colCount = data.colCount || (previewRows[0] ? Object.keys(previewRows[0]).length : 0);
    } catch {
      previewRows = file.details?.columns ? [file.details.columns] : [];
      rowCount = 0;
      colCount = previewRows[0] ? Object.keys(previewRows[0]).length : 0;
    }
    setPreviewData(previewRows);
    setPreviewMeta({ fileName: file.name, rowCount });
    setPreviewCounts({ rowCount, colCount });
    setShowModal(true);
  };

  const handleAnalysis = (file: FileMeta) => {
    // Navigate to analysis/report page for this file
    navigate('/report-type', { state: { fileName: file.name, tableName: file.tableName } });
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 1000, margin: '2rem auto', padding: '2.5rem 3rem', position: 'relative' }}>
        <button className="back-button" onClick={() => navigate('/')} style={{ position: 'absolute', left: 24, top: 24 }}>← Back</button>
        <h2 style={{ fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Uploaded Files</h2>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 18, textAlign: 'center' }}>
          Browse, download, and manage your uploaded files. You can also create new reports from any file.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#eaff6b' }}>Loading files...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4d4f' }}>{error}</div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#eaff6b' }}>
            You will be able to view the files that have been uploaded here.
          </div>
        ) : (
          <>
            <table className="styled-table" style={{ width: '100%', marginBottom: 32, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>File Name</th>
                  <th>Uploaded</th>
                  <th style={{ textAlign: 'center', minWidth: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr key={file.name || idx}>
                    <td style={{ fontWeight: 500, maxWidth: 320, wordBreak: 'break-all' }}>{file.name}</td>
                    <td>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : '-'}</td>
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      {/* Download icon with popup menu */}
                      <span style={{ marginRight: 24, position: 'relative' }}>
                        <FontAwesomeIcon icon={faDownload} style={{ cursor: 'pointer' }} title="Download" onClick={e => handleDownloadIconClick(idx, e)} />
                      </span>
                      {/* Preview icon */}
                      <span style={{ marginRight: 24 }}>
                        <FontAwesomeIcon icon={faEye} style={{ cursor: 'pointer' }} title="Preview" onClick={() => handlePreview(file)} />
                      </span>
                      {/* Analysis icon */}
                      <span>
                        <FontAwesomeIcon icon={faChartBar} style={{ cursor: 'pointer' }} title="Analysis" onClick={() => handleAnalysis(file)} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Add a button to view all reports for all files */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="button" style={{ minWidth: 220, fontSize: 18, borderRadius: 8 }} onClick={() => navigate('/report-viewer')}>
                📊 View All Reports
              </button>
            </div>
          </>
        )}
      </div>
      {/* Preview Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30, 30, 40, 0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'rgba(44, 44, 60, 0.98)',
            borderRadius: 16,
            padding: 32,
            minWidth: 400,
            maxWidth: 900,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            color: '#eaff6b',
            position: 'relative',
            cursor: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Preview: {previewMeta?.fileName}</h3>
            <div style={{ marginBottom: 12, color: '#fff', fontSize: 16 }}>
              Rows: {previewCounts?.rowCount ?? previewData?.length ?? 0} &nbsp;|&nbsp; Columns: {previewCounts?.colCount ?? (previewData && previewData[0] ? Object.keys(previewData[0]).length : 0)}
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 400, background: '#181e26', borderRadius: 8, padding: 8 }}>
              {previewData && previewData.length > 0 ? (
                <table style={{ width: '100%', color: '#fff', fontSize: 15, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map((col, i) => (
                        <th key={i} style={{ padding: '8px 6px', fontWeight: 600, background: '#232b36', borderBottom: '2px solid #eaff6b' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 20).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#232b36' : '#181e26' }}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} style={{ padding: '8px 6px', borderBottom: '1px solid #232b36' }}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: '#ff4d4f' }}>No preview data available.</div>
              )}
            </div>
            <button className="button" style={{ marginTop: 24, minWidth: 120 }} onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Download popup menu rendered as portal */}
      {downloadMenuIdx !== null && downloadMenuPos && createPortal(
        <div
          style={{
            position: 'absolute',
            top: downloadMenuPos.top,
            left: downloadMenuPos.left,
            background: '#232b36',
            border: '1px solid #eaff6b',
            borderRadius: 8,
            zIndex: 2000,
            minWidth: 120,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{ padding: 10, cursor: 'pointer' }}
            onMouseDown={() => { console.log('Download CSV clicked', files[downloadMenuIdx].name); handleDownload(files[downloadMenuIdx].name, 'csv'); }}
          >
            Download as CSV
          </div>
          <div
            style={{ padding: 10, cursor: 'pointer' }}
            onMouseDown={() => { console.log('Download Excel clicked', files[downloadMenuIdx].name); handleDownload(files[downloadMenuIdx].name, 'xlsx'); }}
          >
            Download as Excel
          </div>
          <div
            style={{ padding: 10, cursor: 'pointer', color: '#ff4d4f' }}
            onMouseDown={() => { setDownloadMenuIdx(null); setDownloadMenuPos(null); }}
          >
            Cancel
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default FilesDashboardPage; 