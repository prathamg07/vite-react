import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { Pool } from 'pg';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

// Set up Multer for file uploads (in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Needed for Neon and most cloud DBs
});

// POST /upload - Accepts an Excel file and parses it
app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  if (data.length === 0) {
    res.status(400).json({ error: 'No data found in file' });
    return;
  }

  const columns = Object.keys(data[0] as object);
  const preview = data.slice(0, 5);

  res.json({ columns, preview, allData: data });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
