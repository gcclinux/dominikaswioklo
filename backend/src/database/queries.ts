import db from './init';
import { Appointment, User, Admin, Settings, Blocked, EmailSettings } from '../types';

export class DatabaseQueries {
  // APPOINTMENTS
  static createAppointment(appointment: Omit<Appointment, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO appointments (udi, count, date, timeStart, timeEnd, repeat, confirmed, cancelled, status, userId, appTag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        appointment.udi,
        appointment.count,
        appointment.date,
        appointment.timeStart,
        appointment.timeEnd,
        appointment.repeat,
        appointment.confirmed ? 1 : 0,
        appointment.cancelled ? 1 : 0,
        appointment.status,
        appointment.userId,
        appointment.appTag || null
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  static getAppointments(): Promise<Appointment[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, u.name, u.surname, u.email, u.phone, u.ipAddress 
        FROM appointments a 
        LEFT JOIN users u ON a.userId = u.uid 
        ORDER BY a.date, a.timeStart
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Appointment[]);
      });
    });
  }

  static getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, u.name, u.surname, u.email, u.phone, u.ipAddress 
        FROM appointments a 
        LEFT JOIN users u ON a.userId = u.uid 
        WHERE a.date = ? AND a.cancelled = 0
        ORDER BY a.timeStart
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Appointment[]);
      });
    });
  }

  static getAppointmentByUdi(udi: string): Promise<Appointment | null> {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, u.name, u.surname, u.email, u.phone, u.ipAddress 
        FROM appointments a 
        LEFT JOIN users u ON a.userId = u.uid 
        WHERE a.udi = ?
      `, [udi], (err, row) => {
        if (err) reject(err);
        else resolve((row as Appointment) || null);
      });
    });
  }

  static updateAppointment(id: number, updates: Partial<Appointment>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      db.run(`
        UPDATE appointments 
        SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [...values, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static blockAllAppointmentsForUser(userId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE appointments
         SET cancelled = 1,
             status = 'blocked',
             updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ? AND cancelled = 0`,
        [userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes || 0);
        }
      );
    });
  }

  static blockAllAppointmentsByEmail(email: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE appointments
         SET cancelled = 1,
             status = 'blocked',
             updatedAt = CURRENT_TIMESTAMP
         WHERE cancelled = 0
           AND userId IN (SELECT uid FROM users WHERE email = ?)`,
        [email],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes || 0);
        }
      );
    });
  }

  static countUserAppointmentsByDateRange(userId: number, startDate: string, endDate: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE userId = ? 
          AND cancelled = 0 
          AND date >= ? 
          AND date <= ?
      `, [userId, startDate, endDate], (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }

  // USERS
  static createUser(user: Omit<User, 'uid'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO users (name, middle, surname, email, phone, ipAddress)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        user.name,
        user.middle,
        user.surname,
        user.email,
        user.phone,
        user.ipAddress
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  static getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row as User || null);
      });
    });
  }

  static getUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM users ORDER BY createdAt DESC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as User[]);
      });
    });
  }

  static getUserById(uid: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE uid = ?`, [uid], (err, row) => {
        if (err) reject(err);
        else resolve((row as User) || null);
      });
    });
  }

  // SETTINGS
  static getSettings(): Promise<Settings> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM settings WHERE sid = 1`, (err, row) => {
        if (err) reject(err);
        else resolve(row as Settings);
      });
    });
  }

  static updateSettings(settings: Partial<Settings>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(settings).map(key => `${key} = ?`).join(', ');
      const values = Object.values(settings);
      
      db.run(`
        UPDATE settings 
        SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
        WHERE sid = 1
      `, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // BLOCKED
  static addBlocked(blocked: Omit<Blocked, 'bid'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO blocked (userId, ipAddress, email, reason)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run([blocked.userId ?? null, blocked.ipAddress, blocked.email || null, blocked.reason], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  static isBlocked(ipAddress: string, userId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let query = `SELECT COUNT(*) as count FROM blocked WHERE ipAddress = ?`;
      let params = [ipAddress];
      
      if (userId) {
        query += ` OR userId = ?`;
        params.push(userId.toString());
      }
      
      db.get(query, params, (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });
  }

  static getBlocked(): Promise<Blocked[]> {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM blocked ORDER BY createdAt DESC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Blocked[]);
      });
    });
  }

  static deleteBlocked(bid: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM blocked WHERE bid = ?`, [bid], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // ADMINS
  static createAdmin(admin: Omit<Admin, 'aid'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO admin (aName, aSurname, email, login, password, passwordLastChanged)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run([admin.aName, admin.aSurname, admin.email, admin.login, admin.password], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });

      stmt.finalize();
    });
  }

  static getAdmins(): Promise<Admin[]> {
    return new Promise((resolve, reject) => {
      // select only safe fields (exclude password)
      db.all(`SELECT aid, aName, aSurname, email, login, passwordLastChanged, createdAt, updatedAt FROM admin ORDER BY createdAt DESC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Admin[]);
      });
    });
  }

  static getAdminById(aid: number): Promise<Admin | null> {
    return new Promise((resolve, reject) => {
      // select only safe fields (exclude password)
      db.get(`SELECT aid, aName, aSurname, email, login, passwordLastChanged, createdAt, updatedAt FROM admin WHERE aid = ?`, [aid], (err, row) => {
        if (err) reject(err);
        else resolve(row as Admin || null);
      });
    });
  }

  static getAdminByLogin(login: string): Promise<Admin | null> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM admin WHERE login = ?`, [login], (err, row) => {
        if (err) reject(err);
        else resolve(row as Admin || null);
      });
    });
  }

  static updateAdmin(aid: number, updates: Partial<Admin>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      db.run(`
        UPDATE admin
        SET ${fields}, updatedAt = CURRENT_TIMESTAMP
        WHERE aid = ?
      `, [...values, aid], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static deleteAdmin(aid: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM admin WHERE aid = ?`, [aid], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static updateUser(uid: number, updates: Partial<User>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).filter(key => updates[key as keyof User] !== undefined).map(key => `${key} = ?`).join(', ');
      const values = Object.keys(updates).filter(key => updates[key as keyof User] !== undefined).map(key => updates[key as keyof User]);
      
      if (fields.length === 0) {
        return resolve();
      }
      
      db.run(`
        UPDATE users 
        SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
        WHERE uid = ?
      `, [...values, uid], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static deleteUser(uid: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM users WHERE uid = ?`, [uid], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // EMAIL SETTINGS
  static getEmailSettings(): Promise<EmailSettings> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM email_settings WHERE eid = 1`, (err, row) => {
        if (err) reject(err);
        else resolve(row as EmailSettings);
      });
    });
  }

  static updateEmailSettings(settings: Partial<EmailSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(settings).map(key => `${key} = ?`).join(', ');
      const values = Object.values(settings);
      
      db.run(`
        UPDATE email_settings 
        SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
        WHERE eid = 1
      `, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // APPOINTMENT TYPES
  static getAppointmentTypes(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`SELECT atid, appName, appTag, appPrice, appCurrency FROM appointment_types ORDER BY appName`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as any[]);
      });
    });
  }

  static updateAppointmentTypes(types: any[], currency: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM appointment_types`, (err) => {
        if (err) return reject(err);
        
        if (types.length === 0) return resolve();
        
        const stmt = db.prepare(`INSERT INTO appointment_types (appName, appTag, appPrice, appCurrency) VALUES (?, ?, ?, ?)`);
        let completed = 0;
        
        types.forEach(type => {
          stmt.run([type.name, type.tag || type.name, type.price || null, currency || 'USD'], (err) => {
            if (err) reject(err);
            completed++;
            if (completed === types.length) {
              stmt.finalize();
              resolve();
            }
          });
        });
      });
    });
  }

  // LICENSES
  static createLicense(entry: { saleId?: string | null, name: string, email: string, licenseKey: string, status?: string }): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO licenses (saleId, name, email, licenseKey, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run([entry.saleId || null, entry.name, entry.email, entry.licenseKey, entry.status || 'active'], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });

      stmt.finalize();
    });
  }

  static getLicenseBySaleId(saleId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM licenses WHERE saleId = ?`, [saleId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static getLicenseByEmail(email: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM licenses WHERE email = ? ORDER BY createdAt DESC LIMIT 1`, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

}