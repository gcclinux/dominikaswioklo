import path from 'path';
import dotenv from 'dotenv';
import { initializeMongo, getDb, closeMongo } from './mongoInit';

// Load root .env
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGO_DB_NAME || 'easy_scheduler';
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(' → URI:', uri.replace(/:\w+@/, '://****@'));
    console.log(' → DB :', dbName);
    await initializeMongo();
    const db = getDb();

    // Fetch basic stats
    const collections = await db.listCollections().toArray();
    console.log(`✅ Connected. Found ${collections.length} collections.`);
    const known = [
      'users',
      'appointments',
      'admin',
      'settings',
      'appointment_types',
      'blocked',
      'email_settings',
      'licenses'
    ];
    for (const name of known) {
      const count = await db.collection(name).countDocuments().catch(() => 0);
      console.log(` • ${name}: ${count}`);
    }
  } catch (err: any) {
    console.error('❌ MongoDB connection test failed:', err?.message || err);
    if (String(err?.message || '').includes('Authentication')) {
      console.error('Hint: If your credentials are in the admin database, append ?authSource=admin to MONGODB_URI');
    }
    process.exit(1);
  } finally {
    await closeMongo().catch(() => void 0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().then(() => process.exit(0));
}

export default main;
