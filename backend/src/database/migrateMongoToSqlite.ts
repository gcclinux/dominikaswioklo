import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { initializeMongo, getDb, closeMongo } from './mongoInit';
import db, { initializeDatabase } from './init';

// Load root .env
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

function getSqlitePath() {
  return process.env.DB_PATH
    ? path.resolve(REPO_ROOT, process.env.DB_PATH)
    : path.join(REPO_ROOT, 'database', 'scheduler.db');
}

const run = (sql: string, params: any[] = []) =>
  new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });

const runWithId = (sql: string, params: any[] = []) =>
  new Promise<number>((resolve, reject) => {
    const database = db as unknown as sqlite3.Database;
    const stmt = database.prepare(sql);
    // Using 'function' to access the Statement context provided by sqlite3 typings
    stmt.run(params, function (this: any, err: Error | null) {
      if (err) reject(err);
      else resolve(this?.lastID ?? 0);
    });
    stmt.finalize();
  });

const toNum = (v: any) => (v ? 1 : 0);

async function migrateMongoToSqlite() {
  const sqlitePath = getSqlitePath();

  // Ensure DB file exists with schema
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existed = fs.existsSync(sqlitePath);
  if (!existed) console.log('🆕 Creating SQLite DB at:', sqlitePath);
  await initializeDatabase();

  // Connect Mongo
  await initializeMongo();
  const mdb = getDb();

  // Load Mongo data
  const mUsers = await mdb.collection('users').find({}).toArray();
  const mAdmins = await mdb.collection('admin').find({}).toArray();
  const mTypes = await mdb.collection('appointment_types').find({}).toArray();
  const mBlocked = await mdb.collection('blocked').find({}).toArray();
  const mLicenses = await mdb.collection('licenses').find({}).toArray();
  const mSettings = await mdb.collection('settings').findOne({ sid: 1 });
  const mEmailSettings = await mdb.collection('email_settings').findOne({ eid: 1 });

  // Appointments with user join to resolve userId mapping
  const mAppointments = await mdb
    .collection('appointments')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          let: { apptUserId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uid', '$$apptUserId'] },
                    { $eq: ['$_id', { $convert: { input: '$$apptUserId', to: 'objectId', onError: null, onNull: null } }] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ])
    .toArray();

  console.log('🔁 Migrating from MongoDB to SQLite...');

  // Build user maps to resolve appointments
  const emailToUid = new Map<string, number>();
  const mongoIdToUid = new Map<string, number>();

  // USERS
  for (const u of mUsers) {
    const uid = typeof u.uid === 'number' ? u.uid : undefined;
    const params = [
      uid ?? undefined,
      u.name || '',
      u.middle ?? null,
      u.surname || '',
      u.email || '',
      u.phone ?? null,
      u.ipAddress ?? null
    ];

    if (uid) {
      await run(
        `INSERT OR REPLACE INTO users (uid, name, middle, surname, email, phone, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params
      );
      emailToUid.set(String((u.email || '').toLowerCase()), uid);
      mongoIdToUid.set(String(u._id), uid);
    } else {
      const newUid = await runWithId(
        `INSERT OR IGNORE INTO users (name, middle, surname, email, phone, ipAddress) VALUES (?, ?, ?, ?, ?, ?)`,
        params.slice(1)
      );
      const resolvedUid = newUid || (await new Promise<number>((res, rej) => {
        (db as any).get(`SELECT uid FROM users WHERE email = ?`, [u.email || ''], (err: any, row: any) => (err ? rej(err) : res(row?.uid || 0)));
      }));
      if (resolvedUid) {
        emailToUid.set(String((u.email || '').toLowerCase()), resolvedUid);
        mongoIdToUid.set(String(u._id), resolvedUid);
      }
    }
  }
  console.log(` → users: ${mUsers.length}`);

  // ADMIN
  for (const a of mAdmins) {
    const aid = typeof a.aid === 'number' ? a.aid : undefined;
    const params = [
      aid ?? undefined,
      a.aName || '',
      a.aSurname || '',
      a.email ?? null,
      a.login || '',
      a.password || '',
      a.passwordLastChanged ?? null
    ];
    if (aid) {
      await run(
        `INSERT OR REPLACE INTO admin (aid, aName, aSurname, email, login, password, passwordLastChanged) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params
      );
    } else {
      await run(
        `INSERT OR IGNORE INTO admin (aName, aSurname, email, login, password, passwordLastChanged) VALUES (?, ?, ?, ?, ?, ?)`,
        params.slice(1)
      );
    }
  }
  console.log(` → admin: ${mAdmins.length}`);

  // APPOINTMENT TYPES
  for (const t of mTypes) {
    const atid = typeof t.atid === 'number' ? t.atid : undefined;
    const doc = {
      appName: t.appName || t.name || '',
      appTag: t.appTag || t.name || '',
      appPrice: t.appPrice ?? t.price ?? null,
      appCurrency: t.appCurrency || 'USD'
    };
    const params = [atid ?? undefined, doc.appName, doc.appTag, doc.appPrice, doc.appCurrency];
    if (atid) {
      await run(
        `INSERT OR REPLACE INTO appointment_types (atid, appName, appTag, appPrice, appCurrency) VALUES (?, ?, ?, ?, ?)`,
        params
      );
    } else {
      await run(
        `INSERT OR IGNORE INTO appointment_types (appName, appTag, appPrice, appCurrency) VALUES (?, ?, ?, ?)`,
        params.slice(1)
      );
    }
  }
  console.log(` → appointment_types: ${mTypes.length}`);

  // APPOINTMENTS
  for (const a of mAppointments) {
    // Resolve userId to SQLite uid
    let uid: number | null = null;
    if (typeof a.userId === 'number') {
      uid = a.userId;
    } else if (a.user && typeof a.user.uid === 'number') {
      uid = a.user.uid;
    } else if (a.user && a.user.email) {
      uid = emailToUid.get(String(a.user.email).toLowerCase()) || null;
    }

    const id = typeof a.id === 'number' ? a.id : undefined;
    const params = [
      id ?? undefined,
      a.udi || String(a._id || ''),
      typeof a.count === 'number' ? a.count : 1,
      a.date || '',
      a.timeStart || '',
      a.timeEnd || '',
      a.repeat || 'none',
      toNum(a.confirmed),
      toNum(a.cancelled),
      a.status || 'pending',
      uid,
      a.appTag ?? null
    ];

    if (id) {
      await run(
        `INSERT OR REPLACE INTO appointments (id, udi, count, date, timeStart, timeEnd, repeat, confirmed, cancelled, status, userId, appTag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );
    } else {
      await run(
        `INSERT OR IGNORE INTO appointments (udi, count, date, timeStart, timeEnd, repeat, confirmed, cancelled, status, userId, appTag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params.slice(1)
      );
    }
  }
  console.log(` → appointments: ${mAppointments.length}`);

  // BLOCKED
  for (const b of mBlocked) {
    const bid = typeof b.bid === 'number' ? b.bid : undefined;
    const params = [bid ?? undefined, b.userId ?? null, b.ipAddress || 'unknown', b.email ?? null, b.reason ?? null];
    if (bid) {
      await run(
        `INSERT OR REPLACE INTO blocked (bid, userId, ipAddress, email, reason) VALUES (?, ?, ?, ?, ?)`,
        params
      );
    } else {
      await run(
        `INSERT OR IGNORE INTO blocked (userId, ipAddress, email, reason) VALUES (?, ?, ?, ?)`,
        params.slice(1)
      );
    }
  }
  console.log(` → blocked: ${mBlocked.length}`);

  // SETTINGS (single row sid=1)
  if (mSettings) {
    const s = mSettings as any;
    await run(
      `INSERT OR REPLACE INTO settings (sid, maxApp, maxAppWeek, startHour, endHour, headerMessage, displayAvailability, pastAppointmentsDays, futureAppointmentsDays, availabilityLocked, availabilityLockedUntil, includeWeekend, allow30Min, appointmentCurrency) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.maxApp ?? 2,
        s.maxAppWeek ?? 4,
        s.startHour ?? 9,
        s.endHour ?? 17,
        s.headerMessage ?? 'Select Your Appointment Time',
        s.displayAvailability ?? 4,
        s.pastAppointmentsDays ?? 7,
        s.futureAppointmentsDays ?? 14,
        toNum(s.availabilityLocked),
        s.availabilityLockedUntil ?? null,
        toNum(s.includeWeekend),
        toNum(s.allow30Min),
        s.appointmentCurrency ?? 'USD'
      ]
    );
    console.log(' → settings: 1');
  } else {
    console.log(' → settings: 0 (none found)');
  }

  // EMAIL SETTINGS (single row eid=1)
  if (mEmailSettings) {
    const e = mEmailSettings as any;
    await run(
      `INSERT OR REPLACE INTO email_settings (eid, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, emailFooter)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.smtpHost ?? 'smtp.gmail.com',
        e.smtpPort ?? 587,
        toNum(e.smtpSecure),
        e.smtpUser ?? '',
        e.smtpPass ?? '',
        e.smtpFrom ?? '',
        e.emailFooter ?? 'Scheduler System'
      ]
    );
    console.log(' → email_settings: 1');
  } else {
    console.log(' → email_settings: 0 (none found)');
  }

  // LICENSES
  for (const l of mLicenses) {
    const params = [l.saleId ?? null, l.name ?? null, l.email ?? null, l.licenseKey ?? null, l.status ?? 'active'];
    await run(
      `INSERT OR IGNORE INTO licenses (saleId, name, email, licenseKey, status) VALUES (?, ?, ?, ?, ?)`,
      params
    );
  }
  console.log(` → licenses: ${mLicenses.length}`);

  console.log('✅ Migration to SQLite completed.');
}

if (require.main === module) {
  migrateMongoToSqlite()
    .catch((err) => {
      console.error('❌ Migration failed:', err?.message || err);
      process.exitCode = 1;
    })
    .finally(() => closeMongo().catch(() => void 0));
}

export default migrateMongoToSqlite;
