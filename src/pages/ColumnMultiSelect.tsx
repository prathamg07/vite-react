import React, { useState, useRef, useEffect } from 'react';
import './DataPreview1.css';

interface ColumnMultiSelectProps {
  columns: string[];
  selectedColumns: string[];
  setSelectedColumns: (cols: string[]) => void;
}

const ColumnMultiSelect: React.FC<ColumnMultiSelectProps> = ({
  columns,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = columns.filter(col =>
    col.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns(
      selectedColumns.includes(col)
        ? selectedColumns.filter(c => c !== col)
        : [...selectedColumns, col]
    );
  };

  return (
    <div className="column-multiselect" ref={ref}>
      <div
        className="dropdown-selected"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') setOpen(o => !o); }}
        style={{ display: 'flex', alignItems: 'center', borderRadius: '1.5rem', minHeight: 44, padding: '6px 12px', background: '#232b36', border: open ? '2px solid #eaff6b' : '2px solid #333', cursor: 'default' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          {selectedColumns.length === 0 && <span style={{ color: '#888' }}>Select columns...</span>}
          {selectedColumns.map(col => (
            <span className="selected-tag" key={col} style={{ borderRadius: '1.2rem', background: '#eaff6b', color: '#232b36', padding: '4px 12px', margin: '2px 0', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 15 }}>
              {col}
              <span
                style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 700 }}
                onClick={e => { e.stopPropagation(); toggleColumn(col); }}
              >×</span>
            </span>
          ))}
        </div>
        <span
          className="dropdown-chevron"
          style={{ marginLeft: 10, fontSize: 22, color: '#eaff6b', cursor: 'pointer', userSelect: 'none', borderRadius: '50%', padding: 2, transition: 'background 0.2s' }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '▲' : '▼'}
        </span>
      </div>
      <div className={`dropdown-list${open ? ' open' : ''}`} style={{ borderRadius: '1.2rem', marginTop: 4 }}>
        <input
          className="dropdown-search"
          placeholder="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: '1rem', margin: '8px', padding: '6px 12px', border: '1px solid #eaff6b', width: 'calc(100% - 32px)' }}
        />
        {filtered.map(col => (
          <div
            className="dropdown-option"
            key={col}
            onClick={() => toggleColumn(col)}
            style={{ borderRadius: '1rem', padding: '6px 12px', margin: '2px 8px', cursor: 'pointer', background: selectedColumns.includes(col) ? '#eaff6b22' : 'transparent', display: 'flex', alignItems: 'center' }}
          >
            <input
              type="checkbox"
              className="dropdown-checkbox"
              checked={selectedColumns.includes(col)}
              readOnly
              style={{ marginRight: 8 }}
            />
            {col}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnMultiSelect;
