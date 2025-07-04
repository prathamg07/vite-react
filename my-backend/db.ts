import { Pool } from 'pg';

// Directly set your Neon connection string here:
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Yz7h2kyVNSmv@ep-wandering-surf-a82ws6po-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

export async function ensureFileMetadataTable() {
  const createMetaTableSQL = `
    CREATE TABLE IF NOT EXISTS file_metadata (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      table_name TEXT NOT NULL UNIQUE,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
      primary_key TEXT NOT NULL,
      details JSONB
    );
  `;
  await pool.query(createMetaTableSQL);
  console.log('file_metadata table ensured');
}

export default pool; 