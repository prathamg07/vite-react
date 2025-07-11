import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import filesRouter from './routes/files';
import pool, { ensureFileMetadataTable } from './db';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

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

app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: DataRow[] = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

  console.log(`Parsed ${data.length} rows from Excel`);

  if (data.length === 0) {
    res.status(400).json({ error: 'No data found in file' });
    return;
  }

  const columns: string[] = Object.keys(data[0]);
  const preview: DataRow[] = data.slice(0, 5);

  res.json({ columns, preview, allData: data });
});

app.post('/save-data', async (req: Request, res: Response) => {
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

    if (rows.length > 0) {
      const start = Date.now();
      const BATCH_SIZE = 100;
      const batches: DataRow[][] = chunkArray(rows, BATCH_SIZE);
      let totalInserted = 0;

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
        totalInserted += batch.length;
      }

      const end = Date.now();
      const timestamp: string = new Date().toISOString();
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      console.log(
        `[${timestamp}] Inserted ${totalInserted} rows into "${tableName}" from ${clientIp} in ${end - start} ms`
      );
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error during DB insert:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to list all uploaded files (tables)
app.get('/files', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM file_metadata ORDER BY uploaded_at DESC');
    const files = result.rows.map(row => ({
      name: row.file_name,
      tableName: row.table_name,
      uploadedAt: row.uploaded_at,
      primaryKey: row.primary_key,
      details: row.details,
      reports: [] // Placeholder for future report integration
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Call this before starting the server
ensureFileMetadataTable().then(() => {
  const PORT = process.env.PORT || 4000;
  app.use('/api', filesRouter);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
