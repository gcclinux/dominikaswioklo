import path from 'path';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { initializeMongo, getDb, closeMongo } from './mongoInit';

// Load root .env
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

function openSqlite(dbPath: string) {
  return new sqlite3.Database(dbPath);
}

function all<T = any>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

async function migrate() {
  const sqlitePath = process.env.DB_PATH
    ? path.resolve(REPO_ROOT, process.env.DB_PATH)
    : path.join(REPO_ROOT, 'database', 'scheduler.db');

  console.log('📁 Reading SQLite DB:', sqlitePath);
  const sdb = openSqlite(sqlitePath);

  try {
    // Connect Mongo
    await initializeMongo();
    const mdb = getDb();

    // Collections
    const users = await all(sdb, 'SELECT * FROM users ORDER BY uid');
    const admins = await all(sdb, 'SELECT * FROM admin ORDER BY aid');
    const appointments = await all(sdb, 'SELECT * FROM appointments ORDER BY id');
    const settings = await all(sdb, 'SELECT * FROM settings WHERE sid = 1');
    const emailSettings = await all(sdb, 'SELECT * FROM email_settings WHERE eid = 1');
    const types = await all(sdb, 'SELECT * FROM appointment_types ORDER BY atid');
    const blocked = await all(sdb, 'SELECT * FROM blocked ORDER BY bid');
    const licenses = await all(sdb, 'SELECT * FROM licenses ORDER BY id');

    console.log('🔁 Starting migration to MongoDB...');

    // Helper to strip null/undefined keys to play nicely with sparse indexes
    const stripNulls = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));

    // Users: upsert by email
    for (const u of users) {
      const filter = u.email ? { email: u.email } : { uid: u.uid };
      await mdb.collection('users').updateOne(filter, { $set: stripNulls(u) }, { upsert: true });
    }
    console.log(` → users: ${users.length}`);

    // Admin: upsert by login
    for (const a of admins) {
      const filter = a.login ? { login: a.login } : { aid: a.aid };
      await mdb.collection('admin').updateOne(filter, { $set: stripNulls(a) }, { upsert: true });
    }
    console.log(` → admin: ${admins.length}`);

    // Appointment types: upsert by appTag (fallback to appName)
    for (const t of types) {
      const tag = t.appTag || t.appName;
      const doc = stripNulls({ ...t, appTag: tag });
      await mdb.collection('appointment_types').updateOne({ appTag: tag }, { $set: doc }, { upsert: true });
    }
    console.log(` → appointment_types: ${types.length}`);

    // Appointments: upsert by udi (fallback to id)
    for (const a of appointments) {
      const filter = a.udi ? { udi: a.udi } : { id: a.id };
      await mdb.collection('appointments').updateOne(filter, { $set: stripNulls(a) }, { upsert: true });
    }
    console.log(` → appointments: ${appointments.length}`);

    // Blocked: upsert by bid
    for (const b of blocked) {
      await mdb.collection('blocked').updateOne({ bid: b.bid }, { $set: stripNulls(b) }, { upsert: true });
    }
    console.log(` → blocked: ${blocked.length}`);

    // Settings (single row)
    if (settings[0]) {
      await mdb.collection('settings').updateOne({ sid: 1 }, { $set: stripNulls(settings[0]) }, { upsert: true });
      console.log(' → settings: 1');
    } else {
      console.log(' → settings: 0 (none found)');
    }

    // Email settings (single row)
    if (emailSettings[0]) {
      await mdb.collection('email_settings').updateOne({ eid: 1 }, { $set: stripNulls(emailSettings[0]) }, { upsert: true });
      console.log(' → email_settings: 1');
    } else {
      console.log(' → email_settings: 0 (none found)');
    }

    // Licenses: upsert by saleId (fallback to licenseKey)
    for (const l of licenses) {
      const filter = l.saleId ? { saleId: l.saleId } : { licenseKey: l.licenseKey };
      const doc = stripNulls(l);
      await mdb.collection('licenses').updateOne(filter, { $set: doc }, { upsert: true });
    }
    console.log(` → licenses: ${licenses.length}`);

    console.log('✅ Migration completed.');
  } catch (err: any) {
    console.error('❌ Migration failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await closeMongo().catch(() => void 0);
    sdb.close();
  }
}

// Run if executed directly
if (require.main === module) {
  migrate().then(() => process.exit());
}

export default migrate;
