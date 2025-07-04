import express from 'express';
import pool from '../db';
import * as XLSX from 'xlsx';
import { Parser as Json2csvParser } from 'json2csv';

type DataRow = Record<string, string | number | boolean | null>;

function detectColumnTypes(data: DataRow[], columns: string[]): Record<string, string> {
  const types: Record<string, string> = {};
  columns.forEach((col: string) => {
    let colType: string = 'TEXT';
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const value = data[i][col];
      if (typeof value === 'number') {
        colType = 'NUMERIC';
        break;
      } else if (typeof value === 'boolean') {
        colType = 'BOOLEAN';
        break;
      }
    }
    types[col] = colType;
  });
  return types;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function saveData(req: express.Request, res: express.Response): Promise<any> {
  const { tableName, columns, primaryKey, data, fileName } = req.body;

  if (!tableName || !Array.isArray(columns) || !primaryKey || !Array.isArray(data)) {
    res.status(400).json({ error: 'Missing required fields or wrong types' });
    return;
  }

  const cols: string[] = columns as string[];
  const rows: DataRow[] = data as DataRow[];

  const colTypes = detectColumnTypes(rows, cols);
  const columnDefs: string = cols
    .map((col: string) => `"${col}" ${colTypes[col] || 'TEXT'}`)
    .join(', ');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      ${columnDefs},
      PRIMARY KEY ("${primaryKey}")
    );
  `;

  try {
    await pool.query(createTableSQL);
    console.log(`Table "${tableName}" ensured`);

    // Insert metadata for this file
    await pool.query(
      `INSERT INTO file_metadata (file_name, table_name, primary_key, details) VALUES ($1, $2, $3, $4) ON CONFLICT (table_name) DO NOTHING;`,
      [fileName || tableName, tableName, primaryKey, JSON.stringify({ columns })]
    );
    console.log(`Inserted metadata for table: ${tableName}`);

    if (rows.length > 0) {
      const BATCH_SIZE = 100;
      const batches: DataRow[][] = chunkArray(rows, BATCH_SIZE);

      for (const batch of batches) {
        const allValues: any[] = [];
        const valuePlaceholders: string[] = [];

        batch.forEach((row: DataRow, rowIdx: number) => {
          const rowValues: (string | number | boolean | null)[] = cols.map((col: string) => {
            const val = row[col];
            if ((colTypes[col] === 'NUMERIC' || colTypes[col] === 'BOOLEAN') && (val === '' || val === undefined)) {
              return null;
            }
            return val;
          });
          allValues.push(...rowValues);
          const offset = rowIdx * cols.length;
          valuePlaceholders.push(
            `(${cols.map((_: unknown, i: number) => `$${offset + i + 1}`).join(', ')})`
          );
        });

        const colNames: string = cols.map((col: string) => `"${col}"`).join(', ');
        const insertSQL = `
          INSERT INTO "${tableName}" (${colNames}) VALUES
          ${valuePlaceholders.join(', ')}
          ON CONFLICT DO NOTHING;
        `;

        await pool.query(insertSQL, allValues);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error during DB insert:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getFiles(req: express.Request, res: express.Response): Promise<any> {
  try {
    const result = await pool.query('SELECT * FROM file_metadata ORDER BY uploaded_at DESC');
    const files = result.rows.map(row => ({
      name: row.file_name,
      tableName: row.table_name,
      uploadedAt: row.uploaded_at,
      primaryKey: row.primary_key,
      details: row.details,
      reports: []
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
}

export async function downloadFile(req: express.Request, res: express.Response): Promise<any> {
  const { file: fileName, format } = req.query;
  if (!fileName || !format) {
    return res.status(400).json({ error: 'Missing file or format parameter' });
  }
  try {
    // Find the table name for this file
    const metaResult = await pool.query('SELECT * FROM file_metadata WHERE file_name = $1', [fileName]);
    if (metaResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    const tableName = metaResult.rows[0].table_name;
    // Get all data from the table
    const dataResult = await pool.query(`SELECT * FROM "${tableName}"`);
    const rows = dataResult.rows;
    if (format === 'csv') {
      const parser = new Json2csvParser();
      const csv = parser.parse(rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${fileName}.csv`);
      return res.send(csv);
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${fileName}.xlsx`);
      return res.send(buf);
    } else {
      return res.status(400).json({ error: 'Invalid format' });
    }
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ error: 'Failed to download file' });
  }
}

export async function previewFile(req: express.Request, res: express.Response): Promise<any> {
  const { table } = req.query;
  if (!table) {
    return res.status(400).json({ error: 'Missing table parameter' });
  }
  try {
    // Get first 20 rows
    const previewResult = await pool.query(`SELECT * FROM "${table}" LIMIT 20`);
    console.log('Preview rows for', table, ':', previewResult.rows);
    // Get total row count
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
    // Get column count
    const columnsResult = await pool.query(`SELECT * FROM "${table}" LIMIT 1`);
    const preview = previewResult.rows;
    const rowCount = parseInt(countResult.rows[0].count, 10);
    const colCount = columnsResult.rows.length > 0 ? Object.keys(columnsResult.rows[0]).length : 0;
    res.json({ preview, rowCount, colCount });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: 'Failed to get preview' });
  }
} 