import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { ensureDefaultLicense } from '../config/licenseLoader';

// Load environment variables from repo root
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

// Resolve DB_PATH relative to repository root so paths are consistent regardless of CWD
const dbPath = process.env.DB_PATH
  ? path.resolve(REPO_ROOT, process.env.DB_PATH)
  : path.join(REPO_ROOT, 'database', 'scheduler.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);
// Log the exact database file being used (resolved against repo root)
console.log('📁 SQLite database path:', dbPath);

// Ensure license exists as early as possible (before routes import license)
ensureDefaultLicense();

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create APPOINTMENTS table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          udi TEXT UNIQUE NOT NULL,
          count INTEGER DEFAULT 1,
          date TEXT NOT NULL,
          timeStart TEXT NOT NULL,
          timeEnd TEXT NOT NULL,
          repeat TEXT DEFAULT 'none',
          confirmed BOOLEAN DEFAULT 0,
          cancelled BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'pending',
          userId INTEGER,
          appTag TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (uid)
        )
      `);

      // Create USERS table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          uid INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          middle TEXT,
          surname TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          ipAddress TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create ADMIN table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin (
          aid INTEGER PRIMARY KEY AUTOINCREMENT,
          aName TEXT NOT NULL,
          aSurname TEXT NOT NULL,
          login TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create SETTINGS table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          sid INTEGER PRIMARY KEY AUTOINCREMENT,
          maxApp INTEGER DEFAULT 2,
          maxAppWeek INTEGER DEFAULT 4,
          startHour INTEGER DEFAULT 9,
           endHour INTEGER DEFAULT 17,
           headerMessage TEXT DEFAULT 'Select Your Appointment Time',
           displayAvailability INTEGER DEFAULT 4,
          pastAppointmentsDays INTEGER DEFAULT 7,
          futureAppointmentsDays INTEGER DEFAULT 14,
          availabilityLocked INTEGER DEFAULT 0,
          availabilityLockedUntil TEXT DEFAULT NULL,
          includeWeekend INTEGER DEFAULT 0,
          allow30Min INTEGER DEFAULT 0,
          appointmentCurrency TEXT DEFAULT 'USD',
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create BLOCKED table
      db.run(`
        CREATE TABLE IF NOT EXISTS blocked (
          bid INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          ipAddress TEXT NOT NULL,
          email TEXT,
          reason TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (uid)
        )
      `);

      // Create EMAIL_SETTINGS table
      db.run(`
        CREATE TABLE IF NOT EXISTS email_settings (
          eid INTEGER PRIMARY KEY AUTOINCREMENT,
          smtpHost TEXT DEFAULT 'smtp.gmail.com',
          smtpPort INTEGER DEFAULT 587,
          smtpSecure INTEGER DEFAULT 0,
          smtpUser TEXT DEFAULT '',
          smtpPass TEXT DEFAULT '',
          smtpFrom TEXT DEFAULT '',
          emailFooter TEXT DEFAULT 'Scheduler System',
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create APPOINTMENT_TYPES table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointment_types (
          atid INTEGER PRIMARY KEY AUTOINCREMENT,
          appName TEXT NOT NULL,
          appTag TEXT NOT NULL,
          appPrice REAL,
          appCurrency TEXT DEFAULT 'USD',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Ensure emailFooter column exists in email_settings table
      db.all(`PRAGMA table_info('email_settings')`, (emailErr, emailRows: any[]) => {
        if (!emailErr && emailRows) {
          const emailCols = emailRows.map(r => r.name);
          if (!emailCols.includes('emailFooter')) {
            db.run(`ALTER TABLE email_settings ADD COLUMN emailFooter TEXT DEFAULT 'Scheduler System'`, (alterErr) => {
              if (alterErr) {
                console.warn('Could not add emailFooter column:', alterErr.message);
              } else {
                console.log('✅ Added emailFooter column to email_settings table');
              }
            });
          }
        }
      });

      // Ensure email column exists in blocked table (safe migration for existing DBs)
      db.all(`PRAGMA table_info('blocked')`, (blockedErr, blockedRows: any[]) => {
        if (blockedErr) {
          console.warn('Failed to read blocked table info:', blockedErr);
        } else {
          const blockedCols = blockedRows.map(r => r.name);
          if (!blockedCols.includes('email')) {
            db.run(`ALTER TABLE blocked ADD COLUMN email TEXT`, (alterErr) => {
              if (alterErr) {
                console.warn('Could not add email column to blocked table:', alterErr.message);
              } else {
                console.log('✅ Added email column to blocked table');
              }
            });
          }
        }
      });

      // Ensure email and passwordLastChanged columns exist in admin table (safe migration for existing DBs)
      db.all(`PRAGMA table_info('admin')`, (adminErr, adminRows: any[]) => {
        if (adminErr) {
          console.warn('Failed to read admin table info:', adminErr);
        } else {
          const adminCols = adminRows.map(r => r.name);
          if (!adminCols.includes('email')) {
            db.run(`ALTER TABLE admin ADD COLUMN email TEXT`, (alterErr) => {
              if (alterErr) {
                console.warn('Could not add email column to admin table:', alterErr.message);
              } else {
                console.log('✅ Added email column to admin table');
              }
            });
          }
          if (!adminCols.includes('passwordLastChanged')) {
            db.run(`ALTER TABLE admin ADD COLUMN passwordLastChanged DATETIME`, (alterErr) => {
              if (alterErr) {
                console.warn('Could not add passwordLastChanged column to admin table:', alterErr.message);
              } else {
                console.log('✅ Added passwordLastChanged column to admin table');
                // Set initial values for existing admins
                db.run(`UPDATE admin SET passwordLastChanged = createdAt WHERE passwordLastChanged IS NULL`, (updateErr) => {
                  if (updateErr) {
                    console.warn('Could not set initial passwordLastChanged values:', updateErr.message);
                  } else {
                    console.log('✅ Set initial passwordLastChanged values for existing admins');
                  }
                });
              }
            });
          }
        }
      });

      // Ensure appTag column exists in appointments table (safe migration)
      db.all(`PRAGMA table_info('appointments')`, (appErr, appRows: any[]) => {
        if (!appErr && appRows) {
          const appCols = appRows.map(r => r.name);
          if (!appCols.includes('appTag')) {
            db.run(`ALTER TABLE appointments ADD COLUMN appTag TEXT`, (alterErr) => {
              if (alterErr) console.warn('Could not add appTag column:', alterErr.message);
              else console.log('✅ Added appTag column to appointments table');
            });
          }
        }
      });

      // Migrate appointment_types table
      db.all(`PRAGMA table_info('appointment_types')`, (atErr, atRows: any[]) => {
        if (!atErr && atRows) {
          const atCols = atRows.map(r => r.name);
          if (atCols.includes('name') && !atCols.includes('appName')) {
            db.run(`ALTER TABLE appointment_types RENAME COLUMN name TO appName`, (renameErr) => {
              if (renameErr) console.warn('Could not rename name to appName:', renameErr.message);
              else console.log('✅ Renamed name to appName in appointment_types table');
            });
          }
          if (atCols.includes('price') && !atCols.includes('appPrice')) {
            db.run(`ALTER TABLE appointment_types RENAME COLUMN price TO appPrice`, (renameErr) => {
              if (renameErr) console.warn('Could not rename price to appPrice:', renameErr.message);
              else console.log('✅ Renamed price to appPrice in appointment_types table');
            });
          }
          if (!atCols.includes('appTag')) {
            db.run(`ALTER TABLE appointment_types ADD COLUMN appTag TEXT`, (alterErr) => {
              if (alterErr) console.warn('Could not add appTag column:', alterErr.message);
              else console.log('✅ Added appTag column to appointment_types table');
            });
          }
          if (!atCols.includes('appCurrency')) {
            db.run(`ALTER TABLE appointment_types ADD COLUMN appCurrency TEXT DEFAULT 'USD'`, (alterErr) => {
              if (alterErr) console.warn('Could not add appCurrency column:', alterErr.message);
              else console.log('✅ Added appCurrency column to appointment_types table');
            });
          }
        }
      });

        // Create LICENSES table for storing generated licenses and processed sales (idempotency)
        db.run(`
          CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            saleId TEXT UNIQUE,
            name TEXT,
            email TEXT,
            licenseKey TEXT,
            status TEXT DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

      // Ensure startHour/endHour columns exist (safe migration for existing DBs)

      db.all(`PRAGMA table_info('settings')`, (err, rows: any[]) => {
        if (err) {
          console.error('Failed to read settings table info:', err);
          console.log('✅ Database tables initialized successfully');
          return resolve();
        }

        const cols = rows.map(r => r.name);
        const alters: string[] = [];
        if (!cols.includes('startHour')) {
          alters.push(`ALTER TABLE settings ADD COLUMN startHour INTEGER DEFAULT 9`);
        }
        if (!cols.includes('endHour')) {
          alters.push(`ALTER TABLE settings ADD COLUMN endHour INTEGER DEFAULT 17`);
        }
        if (!cols.includes('displayAvailability')) {
          alters.push(`ALTER TABLE settings ADD COLUMN displayAvailability INTEGER DEFAULT 4`);
        }
        if (!cols.includes('headerMessage')) {
          alters.push(`ALTER TABLE settings ADD COLUMN headerMessage TEXT DEFAULT 'Select Your Appointment Time'`);
        }
        if (!cols.includes('pastAppointmentsDays')) {
          alters.push(`ALTER TABLE settings ADD COLUMN pastAppointmentsDays INTEGER DEFAULT 30`);
        }
        if (!cols.includes('futureAppointmentsDays')) {
          alters.push(`ALTER TABLE settings ADD COLUMN futureAppointmentsDays INTEGER DEFAULT 30`);
        }
        if (!cols.includes('availabilityLocked')) {
          alters.push(`ALTER TABLE settings ADD COLUMN availabilityLocked INTEGER DEFAULT 0`);
        }
        if (!cols.includes('availabilityLockedUntil')) {
          alters.push(`ALTER TABLE settings ADD COLUMN availabilityLockedUntil TEXT DEFAULT NULL`);
        }
        if (!cols.includes('includeWeekend')) {
          alters.push(`ALTER TABLE settings ADD COLUMN includeWeekend INTEGER DEFAULT 1`);
        }
        if (!cols.includes('allow30Min')) {
          alters.push(`ALTER TABLE settings ADD COLUMN allow30Min INTEGER DEFAULT 1`);
        }
        if (!cols.includes('appointmentCurrency')) {
          alters.push(`ALTER TABLE settings ADD COLUMN appointmentCurrency TEXT DEFAULT 'USD'`);
        }

        const runInSeries = (arr: string[], idx: number, cb: () => void) => {
          if (idx >= arr.length) return cb();
          db.run(arr[idx], (alterErr) => {
            if (alterErr) {
              console.warn('Could not add column:', alterErr.message);
            }
            runInSeries(arr, idx + 1, cb);
          });
        };

        runInSeries(alters, 0, () => {
          // Insert default settings if not exists (includes new columns)
          db.run(`
            INSERT OR IGNORE INTO settings (sid, maxApp, maxAppWeek, startHour, endHour, headerMessage, displayAvailability, pastAppointmentsDays, futureAppointmentsDays, availabilityLocked, availabilityLockedUntil, includeWeekend, allow30Min) 
              VALUES (1, 2, 4, 9, 17, 'Select Your Appointment Time', 4, 7, 14, 0, NULL, 0, 0)
          `, (insertErr) => {
            if (insertErr) {
              console.warn('Failed to insert default settings:', insertErr.message);
            }

            // Insert default email settings if not exists
            db.run(`
              INSERT OR IGNORE INTO email_settings (eid, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, emailFooter)
                VALUES (1, 'smtp.gmail.com', 587, 0, '', '', '', 'Scheduler System')
            `, (emailInsertErr) => {
              if (emailInsertErr) {
                console.warn('Failed to insert default email settings:', emailInsertErr.message);
              }

              // Ensure existing row has non-null defaults for the new columns
              db.run(`
              UPDATE settings SET 
                maxApp = COALESCE(maxApp, 2),
                maxAppWeek = COALESCE(maxAppWeek, 4),
                startHour = COALESCE(startHour, 9),
                endHour = COALESCE(endHour, 17),
                headerMessage = COALESCE(headerMessage, 'Select Your Appointment Time'),
                displayAvailability = COALESCE(displayAvailability, 4),
                pastAppointmentsDays = COALESCE(pastAppointmentsDays, 7),
                futureAppointmentsDays = COALESCE(futureAppointmentsDays, 14),
                availabilityLocked = COALESCE(availabilityLocked, 0),
                availabilityLockedUntil = COALESCE(availabilityLockedUntil, NULL),
                includeWeekend = COALESCE(includeWeekend, 0),
                allow30Min = COALESCE(allow30Min, 0)
              WHERE sid = 1
              `, (updateErr) => {
                if (updateErr) {
                  console.warn('Failed to ensure default values for settings:', updateErr.message);
                }
                console.log('✅ Database tables initialized successfully');
                resolve();
              });
            });
          });
        });
      });
    });

    db.on('error', (err) => {
      console.error('❌ Database initialization error:', err);
      reject(err);
    });
  });
};

export default db;