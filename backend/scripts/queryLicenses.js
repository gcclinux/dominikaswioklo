const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Load env from repository root
const REPO_ROOT = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

// Resolve DB path from .env (DB_PATH relative to repo root), allow CLI override as first arg
const envDbPath = process.env.DB_PATH
  ? path.resolve(REPO_ROOT, process.env.DB_PATH)
  : path.join(REPO_ROOT, 'database', 'scheduler.db');

const dbFile = process.argv[2]
  ? path.resolve(REPO_ROOT, process.argv[2])
  : envDbPath;

const db = new sqlite3.Database(dbFile);
const email = process.argv[3] || '%@%';

db.all(`SELECT id, saleId, name, email, licenseKey, status, createdAt FROM licenses WHERE email LIKE ?`, [email], (err, rows) => {
  if (err) {
    console.error('Query error:', err.message);
    process.exit(1);
  }
  console.log(rows);
  db.close();
});
