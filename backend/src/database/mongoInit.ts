import { MongoClient, Db } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

let client: MongoClient | null = null;
let db: Db | null = null;

export async function initializeMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in environment');

  client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGO_DB_NAME || 'easy_scheduler';
  db = client.db(dbName);
  console.log('✅ Connected to MongoDB:', uri, 'db:', dbName);

  // Ensure basic indexes
  try {
    await db.collection('users').createIndex({ tenantId: 1, email: 1 }, { unique: true, sparse: true });
    await db.collection('appointments').createIndex({ tenantId: 1, date: 1 });
    await db.collection('appointment_types').createIndex({ tenantId: 1, appTag: 1 }, { unique: true, sparse: true });
    await db.collection('admin').createIndex({ tenantId: 1, login: 1 }, { unique: true, sparse: true });
    await db.collection('licenses').createIndex({ tenantId: 1, saleId: 1 }, { unique: true, sparse: true });
  } catch (err) {
    console.warn('Warning: index creation error', err);
  }

  return db;
}

export function getDb() {
  if (!db) throw new Error('MongoDB not initialized. Call initializeMongo first.');
  return db as Db;
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default { initializeMongo, getDb, closeMongo };
