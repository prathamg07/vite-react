import express, { Request, Response } from 'express';
import pool from './db';

const app = express();
app.use(express.json());

app.post('/test', async (req: Request, res: Response) => {
  res.json({ ok: true });
});

async function ensureUniqueConstraint() {
  try {
    // Try to add the unique constraint, ignore error if it already exists
    await pool.query(`ALTER TABLE file_metadata ADD CONSTRAINT unique_table_name UNIQUE (table_name);`);
    console.log('Unique constraint added to file_metadata.table_name');
  } catch (err: any) {
    if (err.code === '23505' || (err.message && err.message.includes('already exists'))) {
      console.log('Unique constraint already exists on file_metadata.table_name');
    } else {
      console.error('Error adding unique constraint:', err);
    }
  } finally {
    await pool.end();
  }
}

ensureUniqueConstraint();

app.listen(4000, () => console.log('Server running'));
